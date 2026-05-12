const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

// auto-mark large sections so they reveal even without explicit class
const candidates = document.querySelectorAll(
  '.prologue, .timeline-section, .map-section, .charts-section, ' +
  '.halls-section, .bond-section, .gallery-section, .sources-section, ' +
  '.hall, .timeline-card, .chart-card, .gallery-item'
);
candidates.forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// re-observe dynamically inserted (timeline, halls, gallery) — short delay to catch them after fetch
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}, 800);
