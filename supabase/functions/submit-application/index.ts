// submit-application — receives job applications (with CV) and contact-form
// messages from sustainsys.co.uk, stores them in Supabase and emails a
// notification via Resend when RESEND_API_KEY is configured.
//
// Deployed with verify_jwt = false (public form). Protections: origin
// allow-list, honeypot field, field length limits, CV type/size checks and a
// per-IP rate limit.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "info@sustainsys.co.uk";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "SustainSys Website <onboarding@resend.dev>";

const ALLOWED_ORIGINS = new Set([
  "https://sustainsys.co.uk",
  "https://www.sustainsys.co.uk",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const RATE_LIMIT = 5; // submissions per IP per hour
const rateBucket = new Map<string, { n: number; reset: number }>();

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://sustainsys.co.uk";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

function str(form: FormData, key: string, max = 500): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function esc(s: string | null | undefined) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = rateBucket.get(ip);
  if (!b || b.reset < now) {
    rateBucket.set(ip, { n: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  b.n += 1;
  return b.n > RATE_LIMIT;
}

async function dbInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`db insert failed: ${res.status} ${await res.text()}`);
  const [inserted] = await res.json();
  return inserted;
}

async function storageUpload(path: string, file: File) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/applications/${path}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new Error(`storage upload failed: ${res.status} ${await res.text()}`);
}

async function sendEmail(subject: string, html: string, attachment?: { filename: string; file: File }) {
  if (!RESEND_API_KEY) return "skipped (no RESEND_API_KEY)";
  const body: Record<string, unknown> = { from: NOTIFY_FROM, to: [NOTIFY_TO], subject, html };
  if (attachment) {
    const bytes = new Uint8Array(await attachment.file.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    body.attachments = [{ filename: attachment.filename, content: btoa(bin) }];
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok ? "sent" : `failed ${res.status}: ${await res.text()}`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json({ error: "Too many submissions. Please try again later or email info@sustainsys.co.uk." }, 429, origin);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Invalid form data" }, 400, origin);
  }

  // Honeypot
  if (str(form, "_honey")) return json({ ok: true }, 200, origin);

  const kind = str(form, "kind", 20) ?? "application";
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  try {
    // ---------------- Contact form ----------------
    if (kind === "contact") {
      const full_name = str(form, "name", 200);
      const email = str(form, "email", 200);
      const message = str(form, "message", 5000);
      if (!full_name || !email || !message) return json({ error: "Name, email and message are required." }, 400, origin);
      const row = await dbInsert("contact_messages", {
        inquiry_type: str(form, "inquiry_type", 100),
        full_name, email,
        phone: str(form, "phone", 50),
        message,
        user_agent: userAgent,
      });
      const mail = await sendEmail(
        `Website enquiry: ${row.inquiry_type ?? "General"} — ${full_name}`,
        `<h2>New website enquiry</h2>
         <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">
           <tr><td><b>Type</b></td><td>${esc(row.inquiry_type)}</td></tr>
           <tr><td><b>Name</b></td><td>${esc(full_name)}</td></tr>
           <tr><td><b>Email</b></td><td>${esc(email)}</td></tr>
           <tr><td><b>Phone</b></td><td>${esc(row.phone)}</td></tr>
           <tr><td valign="top"><b>Message</b></td><td>${esc(message).replace(/\n/g, "<br>")}</td></tr>
         </table>
         <p style="color:#666;font-size:12px">Stored in Supabase: contact_messages / ${row.id}</p>`,
      );
      return json({ ok: true, id: row.id, mail }, 200, origin);
    }

    // ---------------- Job application ----------------
    const position = str(form, "position", 200);
    const full_name = str(form, "full_name", 200);
    const email = str(form, "email", 200);
    const covering_note = str(form, "covering_note", 8000);
    const consent = str(form, "consent", 20);
    if (!position || !full_name || !email || !covering_note) {
      return json({ error: "Position, name, email and covering note are required." }, 400, origin);
    }
    if (!consent) return json({ error: "Please confirm the consent statement." }, 400, origin);

    const cv = form.get("cv");
    if (!(cv instanceof File) || cv.size === 0) return json({ error: "Please attach your CV." }, 400, origin);
    if (cv.size > MAX_CV_BYTES) return json({ error: "CV must be 5 MB or smaller." }, 400, origin);
    const ext = ALLOWED_CV_TYPES[cv.type] ?? (cv.name.toLowerCase().match(/\.(pdf|docx?)$/)?.[1]);
    if (!ext) return json({ error: "CV must be a PDF or Word document." }, 400, origin);

    const refMatch = position.match(/SUS-\d{4}-[A-Z]+-\d+/);
    const reference = refMatch ? refMatch[0] : null;
    const safeName = full_name.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "applicant";
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
    const cv_path = `${reference ?? "general"}/${stamp}_${safeName}.${ext}`;

    await storageUpload(cv_path, cv);

    const row = await dbInsert("job_applications", {
      position, reference, full_name, email,
      phone: str(form, "phone", 50),
      current_location: str(form, "current_location", 200),
      in_uk: str(form, "in_uk", 10),
      right_to_work: str(form, "right_to_work", 200),
      driving_licence: str(form, "driving_licence", 10),
      availability: str(form, "availability", 200),
      covering_note,
      cv_path,
      cv_filename: cv.name.slice(0, 200),
      cv_size_bytes: cv.size,
      consent: true,
      user_agent: userAgent,
    });

    const mail = await sendEmail(
      `Job application: ${position} — ${full_name}`,
      `<h2>New job application</h2>
       <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">
         <tr><td><b>Position</b></td><td>${esc(position)}</td></tr>
         <tr><td><b>Name</b></td><td>${esc(full_name)}</td></tr>
         <tr><td><b>Email</b></td><td>${esc(email)}</td></tr>
         <tr><td><b>Phone</b></td><td>${esc(row.phone)}</td></tr>
         <tr><td><b>Location</b></td><td>${esc(row.current_location)}</td></tr>
         <tr><td><b>In the UK</b></td><td>${esc(row.in_uk)}</td></tr>
         <tr><td><b>Right to work</b></td><td>${esc(row.right_to_work)}</td></tr>
         <tr><td><b>Driving licence</b></td><td>${esc(row.driving_licence)}</td></tr>
         <tr><td><b>Availability</b></td><td>${esc(row.availability)}</td></tr>
         <tr><td valign="top"><b>Covering note</b></td><td>${esc(covering_note).replace(/\n/g, "<br>")}</td></tr>
         <tr><td><b>CV</b></td><td>${esc(cv.name)} (${Math.round(cv.size / 1024)} KB) — attached; stored at applications/${esc(cv_path)}</td></tr>
       </table>
       <p style="color:#666;font-size:12px">Stored in Supabase: job_applications / ${row.id}</p>`,
      { filename: cv.name, file: cv },
    );

    return json({ ok: true, id: row.id, mail }, 200, origin);
  } catch (err) {
    console.error(err);
    return json({ error: "Something went wrong saving your submission. Please email info@sustainsys.co.uk." }, 500, origin);
  }
});
