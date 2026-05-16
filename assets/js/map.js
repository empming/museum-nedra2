import { bus } from './bus.js';

const el = document.getElementById('leaflet-map');
if (el && window.L) {
  const mines = await fetch('data/mines.json').then(r => r.json());

  // ── палитра по короткому ключу компании ────────────────────────────────
  const companyKey = c => {
    if (c.includes('Селигдар') || c.includes('Русолово')) return 'seligdar';
    if (c.includes('Норильский') || c.includes('Норникель')) return 'nornickel';
    if (c.includes('Полюс'))      return 'polyus';
    if (c.includes('Polymetal'))  return 'polymetal';
    if (c.includes('АЛРОСА'))     return 'alrosa';
    if (c.includes('ЮГК') || c.includes('Южуралзолото')) return 'ugk';
    if (c.includes('Kinross') || c.includes('Highland')) return 'highland';
    return 'other';
  };
  const palette = {
    seligdar:  { color: '#E0BE6A', label: 'Селигдар + Русолово' },
    nornickel: { color: '#7AB6E0', label: 'Норникель' },
    polyus:    { color: '#C7A050', label: 'Полюс' },
    polymetal: { color: '#A6A6A6', label: 'Polymetal' },
    alrosa:    { color: '#9AD0A9', label: 'АЛРОСА' },
    ugk:       { color: '#E08A6A', label: 'ЮГК (Южуралзолото)' },
    highland:  { color: '#C28BD9', label: 'Highland Gold / Kinross' }
  };

  // ── карта ───────────────────────────────────────────────────────────────
  // attributionControl:false убирает дефолтную полоску с украинским флагом;
  // ниже добавляем собственный, нейтральный attribution.
  const map = L.map(el, {
    center: [62, 105],
    zoom: 3,
    minZoom: 3,
    maxZoom: 8,
    scrollWheelZoom: false,
    worldCopyJump: true,
    attributionControl: false
  });
  L.control.attribution({ prefix: 'Leaflet' })
    .addAttribution('© OpenStreetMap')
    .addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // ── иконка пина с цветом компании ───────────────────────────────────────
  const makeIcon = color => L.divIcon({
    className: 'mine-pin',
    html: `<svg width="22" height="28" viewBox="0 0 22 28"><path fill="${color}" stroke="#0E0F12" stroke-width="1.5" d="M11 1C6 1 2 5 2 10c0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z"/><circle cx="11" cy="10" r="3.5" fill="#0E0F12"/></svg>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28]
  });

  // ── карточка справа ─────────────────────────────────────────────────────
  const card = document.getElementById('mine-card');
  const renderCard = m => {
    const key = companyKey(m.company);
    const tint = palette[key]?.color || '#C7A050';
    card.innerHTML = `
      <h3>${m.name}</h3>
      <div class="mine-company" style="color:${tint}">${m.company}</div>
      <dl>
        <dt>Минерал</dt><dd>${m.mineral}</dd>
        <dt>С года</dt><dd>${m.since}</dd>
      </dl>
      <p class="mine-facts">${m.facts}</p>
      ${m.url ? `<a class="src-link" href="${m.url}" target="_blank" rel="noopener">Сайт компании →</a>` : ''}`;
  };

  // ── маркеры с группировкой по компании ──────────────────────────────────
  const groups = {};
  const allMarkers = []; // {marker, mine, key}
  let lastClickedKey = null;
  let lastClickedMine = null;
  mines.forEach(m => {
    const k = companyKey(m.company);
    const marker = L.marker([m.lat, m.lon], {
      icon: makeIcon(palette[k]?.color || '#C7A050'),
      title: m.name
    });
    marker.on('click', () => {
      renderCard(m);
      // toggle cross-filter: повторный клик по пину той же компании → clear
      if (lastClickedKey === k && lastClickedMine === m.id) {
        lastClickedKey = null;
        lastClickedMine = null;
        bus.dispatchEvent(new Event('clear'));
      } else {
        lastClickedKey = k;
        lastClickedMine = m.id;
        bus.dispatchEvent(new CustomEvent('mine:select', {
          detail: { company: k, years: m.years || [], mineId: m.id }
        }));
      }
    });
    marker.bindTooltip(m.name, { direction: 'top', offset: [0, -22] });
    (groups[k] = groups[k] || []).push(marker);
    allMarkers.push({ marker, mine: m, key: k });
  });

  // ── флэш пина при клике по году в timeline ────────────────────────────────
  bus.addEventListener('year:select', ev => {
    const { year, company } = ev.detail || {};
    allMarkers.forEach(({ marker, mine, key }) => {
      const yearMatch = (mine.years || []).includes(year);
      const companyMatch = company ? key === company : true;
      if (yearMatch && companyMatch) {
        const elPin = marker.getElement();
        if (elPin) {
          elPin.classList.add('is-flash');
          setTimeout(() => elPin.classList.remove('is-flash'), 1400);
        }
      }
    });
  });

  const activeKeys = new Set(Object.keys(groups));
  const applyVisibility = () => {
    Object.entries(groups).forEach(([k, list]) => {
      list.forEach(mk => activeKeys.has(k) ? mk.addTo(map) : map.removeLayer(mk));
    });
  };
  applyVisibility();

  // ── чипы-фильтры ────────────────────────────────────────────────────────
  const filtersEl = document.getElementById('mine-filters');
  if (filtersEl) {
    const counts = Object.fromEntries(Object.entries(groups).map(([k, l]) => [k, l.length]));

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'mine-chip mine-chip--all is-active';
    allChip.innerHTML = `<span class="chip-dot" style="background:#EDE6D6"></span>Все · ${mines.length}`;
    filtersEl.appendChild(allChip);

    const chips = [];
    Object.keys(groups).sort((a, b) => counts[b] - counts[a]).forEach(k => {
      const p = palette[k];
      if (!p) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'mine-chip is-active';
      chip.dataset.key = k;
      chip.innerHTML = `<span class="chip-dot" style="background:${p.color}"></span>${p.label} · ${counts[k]}`;
      chip.addEventListener('click', () => {
        if (activeKeys.has(k)) activeKeys.delete(k); else activeKeys.add(k);
        chip.classList.toggle('is-active', activeKeys.has(k));
        allChip.classList.toggle('is-active', activeKeys.size === Object.keys(groups).length);
        applyVisibility();
      });
      chips.push(chip);
      filtersEl.appendChild(chip);
    });

    allChip.addEventListener('click', () => {
      const allOn = activeKeys.size === Object.keys(groups).length;
      activeKeys.clear();
      if (!allOn) Object.keys(groups).forEach(k => activeKeys.add(k));
      chips.forEach(c => c.classList.toggle('is-active', activeKeys.has(c.dataset.key)));
      allChip.classList.toggle('is-active', !allOn);
      applyVisibility();
    });
  }

  // показываем первую точку по умолчанию
  setTimeout(() => renderCard(mines[0]), 400);
}
