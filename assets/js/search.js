// ── модалка поиска по музею (Cmd/Ctrl+K) ────────────────────────────────────
const modal = document.getElementById('search-modal');
const input = document.getElementById('search-input');
const list = document.getElementById('search-results');
const btn = document.getElementById('nav-search-btn');

if (modal && input && list && btn) {
  let index = null;
  let focusIdx = 0;

  // section-level записи: всегда видны и стоят первыми при пустом запросе
  const SECTIONS = [
    { section:'Раздел', anchor:'#prologue', title:'Пролог',
      snippet:'Почему сквозной герой — Селигдар. Артель 1975 → ОАО 1996 → биржа 2010 → GOLD01 2023.',
      hay:'пролог prologue селигдар сквозной герой артель история компании введение почему' },
    { section:'Раздел', anchor:'#timeline', title:'Хронолента 1991–2022',
      snippet:'22 ключевых события горнодобывающей отрасли РФ.',
      hay:'хронолента timeline события хронология даты годы 1991 2022 история таймлайн' },
    { section:'Раздел', anchor:'#map', title:'Карта месторождений',
      snippet:'14 точек семи компаний — от Норильска до Хабаровского края.',
      hay:'карта месторождений mines география локации точки пины места' },
    { section:'Раздел', anchor:'#charts', title:'Цифры эпохи',
      snippet:'Графики: цена золота, добыча РФ, курс рубля, доля Селигдара, капитализация.',
      hay:'цифры графики charts статистика цена золота добыча курс рубля капитализация эпохи' },
    { section:'Раздел', anchor:'#halls', title:'Четыре зала',
      snippet:'I Передел собственности · II IPO · III География · IV Экология.',
      hay:'залы halls четыре зала передел собственности приватизация ipo биржа география регионы экология ксо' },
    { section:'Раздел', anchor:'#bond', title:'Облигация GOLD01',
      snippet:'Первая в РФ облигация в граммах золота. Калькулятор доходности.',
      hay:'облигация bond gold01 золото граммы калькулятор селигдар выпуск инструмент финансовый эпилог' },
    { section:'Раздел', anchor:'#gallery', title:'Артбук Селигдара',
      snippet:'247 фото из юбилейного издания 1975–2015.',
      hay:'артбук gallery галерея фото селигдар золотая поступь юбилей издание' },
    { section:'Раздел', anchor:'#sources', title:'Источники и отчётность',
      snippet:'30+ внешних ссылок: годовые отчёты, ЦБ, LBMA, USGS, законы.',
      hay:'источники sources ссылки документы законы лбма цб usgs отчёты отчётность право' },
  ];

  const buildIndex = async () => {
    const [timeline, halls, mines, gallery] = await Promise.all([
      fetch('data/timeline.json').then(r => r.json()).catch(() => []),
      fetch('data/halls.json').then(r => r.json()).catch(() => []),
      fetch('data/mines.json').then(r => r.json()).catch(() => []),
      fetch('data/gallery.json').then(r => r.json()).catch(() => []),
    ]);
    const out = [...SECTIONS];
    timeline.forEach(t => out.push({
      section: 'Хронолента',
      anchor: '#timeline',
      title: `${t.year} · ${t.title}`,
      snippet: t.text,
      hay: `${t.year} ${t.title} ${t.text} ${t.source || ''} ${t.tag || ''}`.toLowerCase(),
    }));
    halls.forEach(h => {
      out.push({
        section: `Зал ${h.roman}`,
        anchor: '#halls',
        title: `${h.title} (${h.years})`,
        snippet: h.lede,
        hay: `${h.title} ${h.years} ${h.lede}`.toLowerCase(),
      });
      (h.cards || []).forEach(c => out.push({
        section: `Зал ${h.roman} · ${c.company}`,
        anchor: '#halls',
        title: c.company,
        snippet: c.text,
        hay: `${c.company} ${c.text}`.toLowerCase(),
      }));
    });
    mines.forEach(m => out.push({
      section: 'Карта',
      anchor: '#map',
      title: `${m.name} (${m.company})`,
      snippet: m.facts,
      hay: `${m.name} ${m.company} ${m.mineral} ${m.since} ${m.facts}`.toLowerCase(),
    }));
    gallery.forEach(g => out.push({
      section: 'Артбук',
      anchor: '#gallery',
      title: g.src,
      snippet: g.caption,
      hay: g.caption.toLowerCase(),
    }));
    return out;
  };

  const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const render = (results) => {
    if (!results.length) {
      list.innerHTML = `<li class="search-empty">Ничего не найдено</li>`;
      return;
    }
    list.innerHTML = results.slice(0, 24).map((r, i) => `
      <li class="${i === focusIdx ? 'is-focus' : ''}" data-idx="${i}" data-anchor="${r.anchor}">
        <div class="sr-section">${escapeHtml(r.section)}</div>
        <div class="sr-title">${escapeHtml(r.title)}</div>
        <div class="sr-snippet">${escapeHtml(r.snippet.slice(0, 160))}${r.snippet.length > 160 ? '…' : ''}</div>
      </li>
    `).join('');
  };

  // стемминг: режем токен длиннее 4 символов до первых 4 → грубо ловит падежи
  const stem = w => w.length > 4 ? w.slice(0, 4) : w;

  const search = q => {
    if (!index) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return SECTIONS.slice(); // пустой запрос → 8 разделов
    const tokens = needle.split(/\s+/).filter(Boolean).map(stem);
    if (!tokens.length) return SECTIONS.slice();
    return index.filter(it => {
      const hay = ' ' + it.hay + ' ';
      return tokens.every(t => hay.includes(t));
    });
  };

  let lastResults = [];
  const update = () => {
    lastResults = search(input.value);
    focusIdx = 0;
    render(lastResults);
  };

  const jumpTo = r => {
    if (!r) return;
    modal.close();
    const target = document.querySelector(r.anchor);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('flash-highlight');
      setTimeout(() => target.classList.remove('flash-highlight'), 1300);
    } else {
      location.hash = r.anchor;
    }
  };

  const openModal = async () => {
    if (!index) {
      list.innerHTML = `<li class="search-empty">Загружаем индекс…</li>`;
      if (!modal.open) modal.showModal();
      index = await buildIndex();
    } else if (!modal.open) {
      modal.showModal();
    }
    input.value = '';
    update();
    setTimeout(() => input.focus(), 30);
  };

  btn.addEventListener('click', openModal);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (modal.open) modal.close();
      else openModal();
    } else if (e.key === '/' && !modal.open && document.activeElement === document.body) {
      e.preventDefault();
      openModal();
    }
  });

  input.addEventListener('input', update);
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIdx = Math.min(focusIdx + 1, lastResults.length - 1);
      render(lastResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIdx = Math.max(focusIdx - 1, 0);
      render(lastResults);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      jumpTo(lastResults[focusIdx]);
    } else if (e.key === 'Escape') {
      modal.close();
    }
  });

  list.addEventListener('click', e => {
    const li = e.target.closest('li[data-idx]');
    if (!li) return;
    jumpTo(lastResults[+li.dataset.idx]);
  });

  // клик по подложке закрывает модалку
  modal.addEventListener('click', e => {
    const rect = modal.getBoundingClientRect();
    const inDialog = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    );
    if (!inDialog) modal.close();
  });
}
