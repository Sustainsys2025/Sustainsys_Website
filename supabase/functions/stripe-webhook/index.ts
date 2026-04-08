const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Map Stripe Price IDs to entitlement product info */
const PRICE_TO_PRODUCT: Record<string, { product_type: string; product_id: string }> = {
  "price_1THLekPq7EC8TeurVwXSBLSI": { product_type: "certification", product_id: "ai-practitioner-associate" },
  "price_1THLfFPq7EC8TeurzbofRSO0": { product_type: "certification", product_id: "ai-practitioner-advanced" },
  "price_1THLfXPq7EC8Teur0irCW2Sf": { product_type: "certification", product_id: "ai-solution-architect" },
  "price_1THLeFPq7EC8TeurNvY8vvZm": { product_type: "subscription", product_id: "all-access" },
};

/** Verify Stripe webhook signature using Web Crypto */
async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(",");
  let timestamp = "";
  let signature = "";
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") signature = value;
  }
  if (!timestamp || !signature) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === signature;
}

/** Supabase REST helper — upsert into entitlements */
async function upsertEntitlement(row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entitlements`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase upsert error:", err);
  }
  return res.ok;
}

/** Supabase REST helper — update entitlements */
async function updateEntitlement(
  filters: Record<string, string>,
  updates: Record<string, unknown>
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    params.append(k, `eq.${v}`);
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/entitlements?${params.toString()}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase update error:", err);
  }
}

/** Stripe REST helper */
async function stripeGet(endpoint: string) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("No signature", { status: 400 });

    const valid = await verifySignature(body, sig, WEBHOOK_SECRET);
    if (!valid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id || session.client_reference_id;
        if (!userId) { console.error("No user ID"); break; }

        if (session.mode === "payment") {
          const lineItems = await stripeGet(`/checkout/sessions/${session.id}/line_items`);
          for (const item of lineItems.data || []) {
            const info = PRICE_TO_PRODUCT[item.price?.id];
            if (info) {
              await upsertEntitlement({
                user_id: userId,
                product_type: info.product_type,
                product_id: info.product_id,
                stripe_customer_id: session.customer,
                stripe_payment_intent_id: session.payment_intent,
                status: "active",
                starts_at: new Date().toISOString(),
                expires_at: null,
              });
              console.log(`Granted ${info.product_id} to ${userId}`);
            }
          }
        }

        if (session.mode === "subscription") {
          const sub = await stripeGet(`/subscriptions/${session.subscription}`);
          for (const item of sub.items?.data || []) {
            const info = PRICE_TO_PRODUCT[item.price?.id];
            if (info) {
              await upsertEntitlement({
                user_id: userId,
                product_type: info.product_type,
                product_id: info.product_id,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                status: "active",
                starts_at: new Date(sub.current_period_start * 1000).toISOString(),
                expires_at: new Date(sub.current_period_end * 1000).toISOString(),
              });
              console.log(`Granted subscription ${info.product_id} to ${userId}`);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.supabase_user_id;
        for (const item of sub.items?.data || []) {
          const info = PRICE_TO_PRODUCT[item.price?.id];
          if (info && userId) {
            await updateEntitlement(
              { user_id: userId, product_id: info.product_id, stripe_subscription_id: sub.id },
              {
                status: sub.status === "active" ? "active" : "expired",
                expires_at: new Date(sub.current_period_end * 1000).toISOString(),
                cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
              }
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await updateEntitlement(
            { user_id: userId, stripe_subscription_id: sub.id },
            { status: "expired", cancelled_at: new Date().toISOString() }
          );
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
