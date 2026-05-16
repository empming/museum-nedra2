// ── правая боковая навигация: капсулы + связующие линии заполняются по мере скролла ──
const navItems = Array.from(document.querySelectorAll('.side-nav-list li[data-target]'));
const sections = navItems
  .map(li => ({ li, section: document.getElementById(li.dataset.target) }))
  .filter(p => p.section);

const updateNav = () => {
  const vh = window.innerHeight;
  const docH = document.documentElement.scrollHeight;
  const maxScroll = Math.max(0, docH - vh);
  // readLine растёт от 0 в самом верху страницы до docH в самом низу — гарантия,
  // что последняя капсула достигнет 100 % именно тогда, когда скролл упирается в дно.
  const scrollFrac = maxScroll > 0 ? window.scrollY / maxScroll : 1;
  const readLine = scrollFrac * docH;

  let currentIdx = -1;
  const pills = sections.map(({ li, section }) => {
    const top = section.offsetTop;
    const range = section.offsetHeight;
    let p = range > 0 ? ((readLine - top) / range) * 100 : 0;
    p = Math.max(0, Math.min(100, p));
    const fillEl = li.querySelector('.fill');
    if (fillEl) fillEl.style.width = p.toFixed(1) + '%';
    li.classList.toggle('is-passed', p >= 100);
    return { li, section, top, bottom: top + range, p };
  });

  // подсветка «текущей»: первой, чья заливка ещё не достигла 100 %
  for (let i = 0; i < pills.length; i++) {
    if (pills[i].p < 100 && pills[i].p > 0) { currentIdx = i; break; }
    if (pills[i].p === 0) break;
  }
  navItems.forEach((li, i) => li.classList.toggle('is-current', i === currentIdx));

  // линии-коннекторы между капсулами
  for (let i = 0; i < pills.length - 1; i++) {
    const linkFill = pills[i].li.querySelector('.link-fill');
    if (!linkFill) continue;
    const gapStart = pills[i].bottom;
    const gapEnd = pills[i + 1].top;
    let lp;
    if (gapEnd <= gapStart) {
      // секции вплотную — коннектор заполняется одновременно с тем, что
      // следующая капсула начала наливаться
      lp = pills[i + 1].p > 0 ? 100 : 0;
    } else {
      lp = ((readLine - gapStart) / (gapEnd - gapStart)) * 100;
    }
    lp = Math.max(0, Math.min(100, lp));
    linkFill.style.height = lp.toFixed(1) + '%';
  }
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
