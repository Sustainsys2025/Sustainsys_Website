/**
 * SustainSys AI Academy — Course Access Gate
 * Include after supabase-auth.js on any course page.
 * Checks that the user is authenticated AND enrolled in the course.
 *
 * Usage: set window.COURSE_GATE_ID before loading this script.
 *   <script>window.COURSE_GATE_ID = 'associate';</script>
 *   <script src="../assets/course-gate.js"></script>
 */

(async function courseGate() {
  const courseId = window.COURSE_GATE_ID;
  if (!courseId) { console.warn('COURSE_GATE_ID not set'); return; }

  const LOGIN_URL = '../../ai-learn.html#/login';
  const CERTS_URL = '../index.html';

  /* ── 1. Check auth ── */
  const session = await supaGetSession();
  if (!session) {
    window.location.href = LOGIN_URL;
    return;
  }

  /* ── 2. Check enrollment ── */
  const enrollment = await supaIsEnrolled(courseId, 'certification');

  if (!enrollment) {
    // Not enrolled — show access denied overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(15,23,42,0.85);
      display:flex;align-items:center;justify-content:center;
      font-family:'DM Sans','Inter',system-ui,sans-serif;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2.5rem;max-width:440px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.3)">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(220,38,38,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 style="font-family:'DM Serif Display',serif;font-size:1.4rem;color:#0f172a;margin-bottom:0.5rem">Course Not Accessible</h2>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6">
          You need to enroll in this certification program before you can access the course materials.
        </p>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
          <button id="gateEnrollBtn" style="
            padding:0.65rem 1.5rem;background:#ea580c;color:#fff;border:none;border-radius:8px;
            font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;
            transition:background 0.2s;
          ">Enroll Now</button>
          <a href="${CERTS_URL}" style="
            padding:0.65rem 1.5rem;background:none;color:#1d4ed8;border:1px solid #e2e8f0;border-radius:8px;
            font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;text-decoration:none;
            transition:all 0.2s;display:inline-block;
          ">Back to Certifications</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Hide page content
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer').style.display = 'none';

    document.getElementById('gateEnrollBtn').addEventListener('click', async function() {
      this.disabled = true;
      this.textContent = 'Enrolling...';
      const result = await supaEnroll(courseId, 'certification');
      if (result) {
        overlay.remove();
        document.querySelector('main').style.display = '';
        document.querySelector('footer').style.display = '';
      } else {
        this.disabled = false;
        this.textContent = 'Enroll Now';
        alert('Failed to enroll. Please try again.');
      }
    });

    return;
  }

  // Enrolled — update last_accessed timestamp
  const sb = getSupabase();
  if (sb && enrollment.id) {
    sb.from('enrollments')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', enrollment.id)
      .then(() => {});
  }
})();
