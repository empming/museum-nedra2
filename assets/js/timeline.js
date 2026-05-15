import { bus } from './bus.js';

const track = document.getElementById('timeline-track');
if (track) {
  const data = await fetch('data/timeline.json').then(r => r.json());
  const frag = document.createDocumentFragment();
  const cards = [];
  data.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'timeline-card reveal';
    card.dataset.year = String(item.year);
    if (item.company) card.dataset.company = item.company;
    card.innerHTML = `
      <div class="timeline-year ${item.company ? 'is-clickable' : ''}" data-year="${item.year}" ${item.company ? `data-company="${item.company}"` : ''}>${item.year}</div>
      <span class="timeline-tag">${item.tag}</span>
      <h3 class="timeline-title">${item.title}</h3>
      <p class="timeline-text">${item.text}</p>
      <p class="timeline-src">
        ${item.source_url
          ? `<a href="${item.source_url}" rel="noopener" target="_blank">${item.source}</a>`
          : item.source}
      </p>`;
    frag.appendChild(card);
    cards.push(card);
  });
  track.appendChild(frag);

  // wheel-to-horizontal scroll on desktop
  track.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // ── год → pulse соответствующего пина на карте ────────────────────────────
  track.addEventListener('click', e => {
    const y = e.target.closest('.timeline-year.is-clickable');
    if (!y) return;
    const year = Number(y.dataset.year);
    const company = y.dataset.company || null;
    bus.dispatchEvent(new CustomEvent('year:select', { detail: { year, company } }));
    // подсветим саму карточку коротко
    const card = y.closest('.timeline-card');
    if (card) {
      card.classList.add('flash-highlight');
      setTimeout(() => card.classList.remove('flash-highlight'), 1300);
    }
  });

  // ── пин на карте → подсветить связанные карточки ──────────────────────────
  let lastCompany = null;
  const clear = () => {
    cards.forEach(c => c.classList.remove('is-related', 'is-dimmed'));
    lastCompany = null;
  };
  bus.addEventListener('mine:select', ev => {
    const { company } = ev.detail || {};
    if (!company || company === lastCompany) {
      clear();
      return;
    }
    lastCompany = company;
    let firstMatch = null;
    cards.forEach(c => {
      const match = c.dataset.company === company;
      c.classList.toggle('is-related', match);
      c.classList.toggle('is-dimmed', !match);
      if (match && !firstMatch) firstMatch = c;
    });
    if (firstMatch) {
      const trackRect = track.getBoundingClientRect();
      const cardRect = firstMatch.getBoundingClientRect();
      track.scrollBy({
        left: cardRect.left - trackRect.left - 24,
        behavior: 'smooth',
      });
    }
  });
  bus.addEventListener('clear', clear);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lastCompany) bus.dispatchEvent(new Event('clear'));
  });
}
