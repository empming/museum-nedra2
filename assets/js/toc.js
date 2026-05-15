// ── правая мини-TOC: подсветка текущей секции ───────────────────────────────
const tocItems = Array.from(document.querySelectorAll('.toc li[data-target]'));
if (tocItems.length) {
  const byId = Object.fromEntries(tocItems.map(li => [li.dataset.target, li]));
  const sections = tocItems
    .map(li => document.getElementById(li.dataset.target))
    .filter(Boolean);

  // запоминаем последнюю «прошедшую» секцию (та, чей top ≤ половины окна)
  const setCurrent = id => {
    tocItems.forEach(li => li.classList.toggle('is-current', li.dataset.target === id));
  };

  const onScroll = () => {
    const mid = window.innerHeight * 0.4;
    let currentId = sections[0]?.id;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid) currentId = s.id;
    }
    if (currentId) setCurrent(currentId);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();
}

// ── fallback для scroll-progress, если animation-timeline не поддерживается ──
const supportsScrollTimeline = CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()');
if (!supportsScrollTimeline) {
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = `scaleX(${pct})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
}
