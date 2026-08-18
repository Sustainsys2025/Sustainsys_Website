/**
 * SustainSys — AI Career Journey Module
 * Shared client-side helpers.
 * Requires: @supabase/supabase-js UMD + courses/assets/supabase-auth.js
 * (Both already loaded by the existing site for ai-learn.html.)
 */
(function () {
  'use strict';

  /* ── Auth wiring (matches existing pattern) ───────────── */
  async function hydrateAuth() {
    if (typeof supaGetSession !== 'function') return;
    try {
      const session = await supaGetSession();
      const avatar = document.getElementById('journeyAvatar');
      const user = session && session.user;
      if (user) {
        const meta = user.user_metadata || {};
        const name = meta.display_name || meta.first_name || (user.email || '').split('@')[0] || 'You';
        const initials = name.split(/\s+/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        if (avatar) {
          avatar.textContent = initials || 'S';
          avatar.title = name + ' — Sign out';
        }
        // Reveal logged-in states
        document.querySelectorAll('[data-auth="in"]').forEach(el => el.style.display = '');
        document.querySelectorAll('[data-auth="out"]').forEach(el => el.style.display = 'none');
        // First-name interpolation
        document.querySelectorAll('[data-first-name]').forEach(el => {
          el.textContent = (meta.first_name || name.split(' ')[0] || 'there');
        });
      } else {
        if (avatar) avatar.textContent = '·';
        document.querySelectorAll('[data-auth="in"]').forEach(el => el.style.display = 'none');
        document.querySelectorAll('[data-auth="out"]').forEach(el => el.style.display = '');
      }
    } catch (err) {
      console.warn('[journey] auth hydrate failed', err);
    }
  }

  /* ── Avatar click → sign out (with confirm) ───────────── */
  function wireAvatar() {
    const avatar = document.getElementById('journeyAvatar');
    if (!avatar) return;
    avatar.addEventListener('click', async () => {
      if (typeof supaGetSession !== 'function') {
        window.location.href = 'ai-learn.html#/login';
        return;
      }
      const session = await supaGetSession();
      if (!session) {
        window.location.href = 'ai-learn.html#/login';
        return;
      }
      if (confirm('Sign out of your Journey?')) {
        if (typeof supaSignOut === 'function') {
          await supaSignOut();
        }
        window.location.href = 'ai-learn.html';
      }
    });
  }

  /* ── Drawer plumbing ──────────────────────────────────── */
  function openDrawer(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    const backdrop = drawer.previousElementSibling && drawer.previousElementSibling.classList.contains('j-drawer-backdrop')
      ? drawer.previousElementSibling
      : null;
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(id) {
    const drawer = id ? document.getElementById(id) : document.querySelector('.j-drawer.open');
    if (!drawer) return;
    drawer.classList.remove('open');
    const backdrop = drawer.previousElementSibling && drawer.previousElementSibling.classList.contains('j-drawer-backdrop')
      ? drawer.previousElementSibling
      : null;
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.JourneyDrawer = { open: openDrawer, close: closeDrawer };

  /* Wire any [data-drawer-open] / [data-drawer-close] / backdrop click */
  function wireDrawers() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-drawer-open]');
      if (opener) {
        const id = opener.getAttribute('data-drawer-open');
        e.preventDefault();
        openDrawer(id);
        return;
      }
      const closer = e.target.closest('[data-drawer-close]');
      if (closer) {
        e.preventDefault();
        closeDrawer(closer.getAttribute('data-drawer-close') || null);
        return;
      }
      if (e.target.classList && e.target.classList.contains('j-drawer-backdrop')) {
        closeDrawer();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ── Tabs (data-tabs-group) ───────────────────────────── */
  function wireTabs() {
    document.querySelectorAll('[data-tabs-group]').forEach(group => {
      const tabs = group.querySelectorAll('.j-tab');
      const targets = document.querySelectorAll(`[data-tabs-panel="${group.dataset.tabsGroup}"] .tab-panel`);
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const name = tab.dataset.tab;
          targets.forEach(p => {
            p.style.display = (p.dataset.tab === name) ? '' : 'none';
          });
        });
      });
    });
  }

  /* ── Progress ring animation (data-ring="78") ────────── */
  function wireProgressRings() {
    document.querySelectorAll('[data-ring]').forEach(el => {
      const v = Math.max(0, Math.min(100, Number(el.dataset.ring) || 0));
      const r = el.querySelector('.ring-progress');
      if (!r) return;
      const C = 2 * Math.PI * 52;
      r.style.strokeDasharray = `${C}`;
      r.style.strokeDashoffset = `${C * (1 - v / 100)}`;
    });
  }

  /* ── Toast (transient notification) ──────────────────── */
  function toast(message, opts = {}) {
    const t = document.createElement('div');
    t.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #0a0e1a; color: #fff; padding: 0.7rem 1.1rem; border-radius: 10px;
      font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25); z-index: 99999; opacity: 0;
      transition: opacity 0.2s, transform 0.2s; display: flex; align-items: center; gap: 8px;
    `;
    if (opts.kind === 'success') t.style.background = '#16a34a';
    if (opts.kind === 'error')   t.style.background = '#dc2626';
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => t.remove(), 220);
    }, opts.duration || 2400);
  }
  window.journeyToast = toast;

  /* ── Boot ─────────────────────────────────────────────── */
  function init() {
    wireAvatar();
    wireDrawers();
    wireTabs();
    wireProgressRings();
    hydrateAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
