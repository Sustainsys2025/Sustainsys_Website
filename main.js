/* ============================================================
   SustainSys - Shared JavaScript
   ============================================================ */

// Neural Network Background
function createNeuralNetwork() {
    const bg = document.getElementById('neuralBg');
    if (!bg) return;
    const nodeCount = 25;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'neural-node';
        node.style.left = Math.random() * 100 + '%';
        node.style.top = Math.random() * 100 + '%';
        node.style.animationDelay = Math.random() * 4 + 's';
        bg.appendChild(node);
        nodes.push({ x: parseFloat(node.style.left), y: parseFloat(node.style.top) });
    }

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() > 0.87) {
                const conn = document.createElement('div');
                conn.className = 'neural-connection';
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                conn.style.width = dist + 'vw';
                conn.style.left = nodes[i].x + '%';
                conn.style.top = nodes[i].y + '%';
                conn.style.transform = `rotate(${angle}rad)`;
                conn.style.animationDelay = Math.random() * 3 + 's';
                bg.appendChild(conn);
            }
        }
    }
}

// Mobile Menu
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');

    if (!btn || !nav || !overlay) return;

    function toggle() {
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    btn.addEventListener('click', toggle);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); toggle(); }, { passive: false });
    overlay.addEventListener('click', () => { nav.classList.remove('active'); overlay.classList.remove('active'); });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => { nav.classList.remove('active'); overlay.classList.remove('active'); });
    });
});

// Logo Video Playback (mobile-safe)
document.addEventListener('DOMContentLoaded', () => {
    const v = document.getElementById('logoVideo');
    if (!v) return;
    v.play().catch(() => {
        document.addEventListener('touchstart', function unlock() {
            v.play();
            document.removeEventListener('touchstart', unlock);
        }, { once: true });
    });
});

// Scroll Progress Ring
(function() {
    const circle = document.querySelector('.progress-ring-circle');
    if (!circle) return;
    const r = circle.r.baseVal.value;
    const c = 2 * Math.PI * r;
    circle.style.strokeDasharray = `${c} ${c}`;
    circle.style.strokeDashoffset = c;

    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        circle.style.strokeDashoffset = c - pct * c;
    });
})();

// Mouse Trail (desktop only)
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        document.body.appendChild(dot);
        requestAnimationFrame(() => { dot.style.opacity = '0'; dot.style.transform = 'scale(2)'; });
        setTimeout(() => dot.remove(), 500);
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// Init
window.addEventListener('load', createNeuralNetwork);
