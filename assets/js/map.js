const el = document.getElementById('leaflet-map');
if (el && window.L) {
  const mines = await fetch('data/mines.json').then(r => r.json());

  const map = L.map(el, {
    center: [62, 105],
    zoom: 3,
    minZoom: 3,
    maxZoom: 8,
    scrollWheelZoom: false,
    worldCopyJump: true
  });

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }
  ).addTo(map);

  // gold marker
  const goldIcon = L.divIcon({
    className: 'mine-pin',
    html: `<svg width="22" height="28" viewBox="0 0 22 28"><path fill="#C7A050" stroke="#0E0F12" stroke-width="1.5" d="M11 1C6 1 2 5 2 10c0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z"/><circle cx="11" cy="10" r="3.5" fill="#0E0F12"/></svg>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28]
  });

  const card = document.getElementById('mine-card');
  const renderCard = m => {
    card.innerHTML = `
      <h3>${m.name}</h3>
      <div class="mine-company">${m.company}</div>
      <dl>
        <dt>Минерал</dt><dd>${m.mineral}</dd>
        <dt>С года</dt><dd>${m.since}</dd>
      </dl>
      <p class="mine-facts">${m.facts}</p>
      ${m.url ? `<a class="src-link" href="${m.url}" target="_blank" rel="noopener">Сайт компании →</a>` : ''}`;
  };

  mines.forEach(m => {
    const marker = L.marker([m.lat, m.lon], { icon: goldIcon, title: m.name }).addTo(map);
    marker.on('click', () => renderCard(m));
    marker.bindTooltip(m.name, { direction: 'top', offset: [0, -22] });
  });

  // open first mine by default after a beat (so users see what a card looks like)
  setTimeout(() => renderCard(mines[0]), 400);
}
