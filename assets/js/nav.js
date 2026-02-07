/* ============================================
   SustainSys — Unified Navigation JS
   Drop this into: assets/js/nav.js
   Then add before </body> on every page:
   <script src="assets/js/nav.js"></script>
   ============================================ */

(function () {
    'use strict';

    // ---- Mobile menu toggle ----
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('open');
            links.classList.toggle('open');
        });

        // Close menu when a link is clicked
        links.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                toggle.classList.remove('open');
                links.classList.remove('open');
            });
        });
    }

    // ---- Active link highlight ----
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navAnchors = document.querySelectorAll('.ss-nav-links a');

    navAnchors.forEach(function (a) {
        const href = a.getAttribute('href');
        if (!href) return;

        const linkPage = href.split('#')[0].split('/').pop();

        if (linkPage === currentPage) {
            a.classList.add('active');
        }

        // Also handle the case where we're on index.html and href is just "index.html"
        if (currentPage === '' && linkPage === 'index.html') {
            a.classList.add('active');
        }
    });

    // ---- Scrolled nav background ----
    const nav = document.getElementById('mainNav');
    if (nav) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

})();
