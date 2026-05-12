const grid = document.getElementById('gallery-grid');
if (grid) {
  const items = await fetch('data/gallery.json').then(r => r.json());
  const frag = document.createDocumentFragment();

  items.forEach(it => {
    const fig = document.createElement('figure');
    fig.className = 'gallery-item';
    fig.innerHTML = `
      <img src="assets/img/artbook/${it.src}" alt="${it.caption}" loading="lazy">
      <figcaption>${it.caption}</figcaption>`;
    frag.appendChild(fig);
  });

  grid.appendChild(frag);
}
