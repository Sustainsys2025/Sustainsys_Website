/* ============================================================
   SustainSys AI Academy — Course Navigation JavaScript
   Handles sidebar toggle, progress tracking, scroll spy,
   copy buttons, reveal animations, and quiz interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Sidebar Toggle (Mobile) --- */
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      this.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
    });
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
          toggle.textContent = '☰';
        }
      });
    });
  }

  /* --- Reading Progress Circle --- */
  const progressCircle = document.getElementById('progressCircle');
  const progressLabel = document.getElementById('progressLabel');
  if (progressCircle) {
    const circumference = 2 * Math.PI * 15;
    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(Math.round((scrollTop / docHeight) * 100), 100) : 0;
      progressCircle.style.strokeDashoffset = circumference - (circumference * pct / 100);
      if (progressLabel) progressLabel.textContent = pct + '%';
    });
  }

  /* --- Scroll Spy for Sidebar --- */
  const sections = document.querySelectorAll('.section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a, .sidebar-lessons a');
  if (sections.length && sidebarLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sidebarLinks.forEach(function (link) { link.classList.remove('active'); });
          var activeLink = document.querySelector('.sidebar-nav a[href="#' + entry.target.id + '"], .sidebar-lessons a[href="#' + entry.target.id + '"]');
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* --- Copy Code Buttons --- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = this.closest('.code-header') ? this.closest('.code-header').nextElementSibling : null;
      if (!pre) pre = this.closest('pre');
      if (pre) {
        var code = pre.querySelector('code') || pre;
        navigator.clipboard.writeText(code.textContent).then(function () {
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        });
      }
    });
  });

  /* --- Reveal on Scroll --- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- Quiz Interactions --- */
  document.querySelectorAll('.quiz-options li').forEach(function (option) {
    option.addEventListener('click', function () {
      var question = this.closest('.quiz-question');
      if (!question) return;
      // Prevent re-answering
      if (question.classList.contains('answered')) return;
      question.classList.add('answered');

      var correctIndex = parseInt(question.getAttribute('data-correct')) || 0;
      var options = question.querySelectorAll('.quiz-options li');
      var clickedIndex = Array.from(options).indexOf(this);

      if (clickedIndex === correctIndex) {
        this.classList.add('correct');
      } else {
        this.classList.add('wrong');
        options[correctIndex].classList.add('correct');
      }

      // Show explanation
      var answer = question.querySelector('.quiz-answer');
      if (answer) answer.classList.add('visible');
    });
  });

});
