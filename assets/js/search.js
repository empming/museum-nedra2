// ── модалка поиска по музею (Cmd/Ctrl+K) ────────────────────────────────────
const modal = document.getElementById('search-modal');
const input = document.getElementById('search-input');
const list = document.getElementById('search-results');
const btn = document.getElementById('nav-search-btn');

if (modal && input && list && btn) {
  let index = null;
  let focusIdx = 0;

  const buildIndex = async () => {
    const [timeline, halls, mines, gallery] = await Promise.all([
      fetch('data/timeline.json').then(r => r.json()).catch(() => []),
      fetch('data/halls.json').then(r => r.json()).catch(() => []),
      fetch('data/mines.json').then(r => r.json()).catch(() => []),
      fetch('data/gallery.json').then(r => r.json()).catch(() => []),
    ]);
    const out = [];
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

  const search = q => {
    if (!index) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return index.slice(0, 12);
    return index.filter(it => it.hay.includes(needle));
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
