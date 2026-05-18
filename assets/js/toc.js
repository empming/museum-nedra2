// ── правая боковая навигация: точки заполняются по мере скролла ──
const navItems = Array.from(document.querySelectorAll('.side-nav-list li[data-target]'));
const sections = navItems
  .map(li => ({ li, section: document.getElementById(li.dataset.target) }))
  .filter(p => p.section);

const updateNav = () => {
  const vh = window.innerHeight;
  const docH = document.documentElement.scrollHeight;
  const maxScroll = Math.max(0, docH - vh);
  const scrollFrac = maxScroll > 0 ? window.scrollY / maxScroll : 1;
  const readLine = scrollFrac * docH;

  const pills = sections.map(({ li, section }) => {
    const top = section.offsetTop;
    const range = section.offsetHeight;
    let p = range > 0 ? ((readLine - top) / range) * 100 : 0;
    p = Math.max(0, Math.min(100, p));
    li.classList.toggle('is-passed', p >= 100);
    return { li, p };
  });

  // активная — первая, чьё заполнение в процессе (0 < p < 100); если все пройдены — последняя
  let currentIdx = -1;
  for (let i = 0; i < pills.length; i++) {
    if (pills[i].p > 0 && pills[i].p < 100) { currentIdx = i; break; }
    if (pills[i].p === 0) break;
  }
  if (currentIdx === -1 && pills.length && pills[pills.length - 1].p >= 100) {
    currentIdx = pills.length - 1;
  }
  navItems.forEach((li, i) => li.classList.toggle('is-current', i === currentIdx));
};

if (sections.length) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateNav(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateNav, { passive: true });
  updateNav();
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
