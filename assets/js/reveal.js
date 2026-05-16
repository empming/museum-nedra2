const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

const candidates = document.querySelectorAll(
  '.prologue, .timeline-section, .map-section, .charts-section, ' +
  '.halls-section, .bond-section, .gallery-section, .sources-section, ' +
  '.hall, .timeline-card, .chart-card, .gallery-item'
);
candidates.forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}, 800);

// ── hero parallax (only when motion is allowed) ─────────────────────────────
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches) {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      // лимит чтобы parallax не уползал бесконечно за пределы hero
      if (y > window.innerHeight) { ticking = false; return; }
      heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }
}
