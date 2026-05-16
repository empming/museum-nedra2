// ── левая боковая навигация: подсветка текущей секции + заполнение прогресса ──
const navItems = Array.from(document.querySelectorAll('.side-nav-list li[data-target]'));
const fill = document.querySelector('.side-nav-fill');
const sections = navItems
  .map(li => document.getElementById(li.dataset.target))
  .filter(Boolean);

const setCurrent = id => {
  navItems.forEach(li => li.classList.toggle('is-current', li.dataset.target === id));
};

const updateProgress = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
  if (fill) fill.style.height = (pct * 100) + '%';

  // bar и подсветка текущей секции
  const mid = window.innerHeight * 0.4;
  let currentId = sections[0]?.id;
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.top <= mid) currentId = s.id;
  }
  if (currentId) setCurrent(currentId);
};

if (navItems.length || fill) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateProgress(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

// ── fallback для горизонтального scroll-progress (верхняя полоса) ──
const supportsScrollTimeline = CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()');
if (!supportsScrollTimeline) {
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    let ticking2 = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = `scaleX(${pct})`;
      ticking2 = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking2) { requestAnimationFrame(update); ticking2 = true; }
    }, { passive: true });
    update();
  }
}
