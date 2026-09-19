// Scroll-triggered reveal: elements slide in from the side when they enter
// the viewport, and reset (fade back out) when they leave it — so scrolling
// up then back down replays the animation rather than only firing once.
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => observer.observe(el));

  // back-to-top button: shows after scrolling down a bit, scrolls smoothly to top on click
  const topBtn = document.getElementById('backToTop');
  if (topBtn) {
    const toggleTopBtn = () => {
      topBtn.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', () => requestAnimationFrame(toggleTopBtn));
    toggleTopBtn();
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // tuning results: animate gauge arcs sweeping in and numbers counting up,
  // replaying each time the block scrolls back into view (same reset behaviour
  // as the rest of the site's scroll animations)
  const tuningResults = document.getElementById('tuningResults');
  if (tuningResults) {
    const gauges = tuningResults.querySelectorAll('.gauge-arc');
    const counters = tuningResults.querySelectorAll('[data-count]');
    const CIRC = 263.9;
    let running = false;

    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    function playAnimation() {
      if (running) return;
      running = true;
      const duration = 1200;
      const start = performance.now();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(t);

        gauges.forEach(g => {
          const target = parseFloat(g.dataset.target);
          g.style.strokeDashoffset = CIRC - (target * eased);
        });
        counters.forEach(c => {
          const target = parseFloat(c.dataset.count);
          const prefix = c.dataset.prefix || '';
          const suffix = c.dataset.suffix || '';
          const val = Math.round(target * eased);
          c.textContent = prefix + val + suffix;
        });

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          running = false;
        }
      }
      requestAnimationFrame(frame);
    }

    function resetAnimation() {
      gauges.forEach(g => { g.style.strokeDashoffset = CIRC; });
      counters.forEach(c => {
        const prefix = c.dataset.prefix || '';
        const suffix = c.dataset.suffix || '';
        c.textContent = prefix + '0' + suffix;
      });
    }

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playAnimation();
        } else {
          resetAnimation();
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(tuningResults);
  }
});
