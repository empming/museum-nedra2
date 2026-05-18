const list = document.getElementById('halls-list');
if (list) {
  const halls = await fetch('data/halls.json?v=6').then(r => r.json());
  const frag = document.createDocumentFragment();

  halls.forEach(h => {
    const sec = document.createElement('article');
    sec.className = 'hall reveal';
    sec.id = 'hall-' + h.id;
    if (h.accent) sec.style.setProperty('--hall-accent', h.accent);
    if (h.accent_soft) sec.style.setProperty('--hall-accent-soft', h.accent_soft);
    if (h.accent_glow) sec.style.setProperty('--hall-accent-glow', h.accent_glow);
    sec.innerHTML = `
      <header class="hall-marker">
        <div class="hall-roman">${h.roman}</div>
        <div class="hall-years">${h.years}</div>
      </header>
      <div class="hall-body">
        <h3>Зал ${h.roman}. ${h.title}</h3>
        <p class="hall-lede">${h.lede}</p>
        <div class="hall-cards">
          ${h.cards.map(c => `
            <article class="hall-card">
              ${c.image ? `<figure class="hall-card-fig"><img src="${c.image}" alt="${c.company}"${c.image_credit ? ` title="${c.image_credit}"` : ''}><figcaption>${c.image_credit || ''}</figcaption></figure>` : ''}
              <h4>${c.company}</h4>
              <p>${c.text}</p>
              <a class="src-link" href="${c.source_url}" target="_blank" rel="noopener">${c.source_label} →</a>
            </article>`).join('')}
        </div>
      </div>`;
    frag.appendChild(sec);
  });

  list.appendChild(frag);
}
