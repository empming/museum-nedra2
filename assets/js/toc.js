// ── правая боковая навигация: каждая капсула заполняется по мере прокрутки её раздела ──
const navItems = Array.from(document.querySelectorAll('.side-nav-list li[data-target]'));
const sections = navItems
  .map(li => ({ li, section: document.getElementById(li.dataset.target) }))
  .filter(p => p.section);

const updateNav = () => {
  const vh = window.innerHeight;
  const readLine = window.scrollY + vh * 0.5; // «читательская» линия — середина экрана

  let currentIdx = -1;
  sections.forEach(({ li, section }, i) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    let p;
    if (readLine <= top) {
      p = 0;
    } else if (readLine >= bottom) {
      p = 100;
      li.classList.add('is-passed');
    } else {
      p = ((readLine - top) / (bottom - top)) * 100;
      li.classList.remove('is-passed');
    }
    if (p > 0 && p < 100) currentIdx = i;
    if (p < 100) li.classList.remove('is-passed');
    li.querySelector('.fill').style.setProperty('--p', p.toFixed(1) + '%');
    li.querySelector('.fill').style.width = p.toFixed(1) + '%';
  });

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
