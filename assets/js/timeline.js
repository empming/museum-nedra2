const track = document.getElementById('timeline-track');
if (track) {
  const data = await fetch('data/timeline.json').then(r => r.json());
  const frag = document.createDocumentFragment();
  data.forEach(item => {
    const card = document.createElement('article');
    card.className = 'timeline-card reveal';
    card.innerHTML = `
      <div class="timeline-year">${item.year}</div>
      <span class="timeline-tag">${item.tag}</span>
      <h3 class="timeline-title">${item.title}</h3>
      <p class="timeline-text">${item.text}</p>
      <p class="timeline-src">
        ${item.source_url
          ? `<a href="${item.source_url}" rel="noopener" target="_blank">${item.source}</a>`
          : item.source}
      </p>`;
    frag.appendChild(card);
  });
  track.appendChild(frag);

  // wheel-to-horizontal scroll on desktop
  track.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}
