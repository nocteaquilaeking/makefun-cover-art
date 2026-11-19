/* Afterglow editor: local photo library, panel assignment, direct crop gestures and PNG export. */
(function () {
  'use strict';
  const canvas = document.getElementById('cover');
  const ctx = canvas.getContext('2d');
  const state = { photos: [], panelPhotos: Array(9).fill(null), crops: Array.from({ length: 9 }, () => ({ x: 0, y: 0, zoom: 1 })), selectedPanel: 4, caption: 'AFTER THE GLOW', captionColor: '#fff5df', look: 'sunset' };
  const caption = document.getElementById('caption');
  const library = document.getElementById('photo-library');
  const selectedLabel = document.getElementById('selected-label');
  const formatSizes = { square: [1080, 1080], portrait: [1080, 1350], landscape: [1920, 1080] };
  let dragging = null;

  function redraw() { state.caption = caption.value; window.AfterglowCover.drawCover(canvas, state); }
  function addPhoto(image, name, source) {
    const photo = { image, name, source: source || 'local' };
    state.photos.push(photo);
    renderLibrary();
    assignPhoto(photo, state.selectedPanel);
    return photo;
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url;
    });
  }
  function assignPhoto(photo, index) {
    if (!photo) return;
    if (index === 'all') state.panelPhotos = Array.from({ length: 9 }, () => photo);
    else state.panelPhotos[index] = photo;
    renderLibrary(); redraw();
  }
  function renderLibrary() {
    library.innerHTML = '';
    if (!state.photos.length) { library.innerHTML = '<div class="empty-library">Add a photo or choose a demo to begin.</div>'; return; }
    state.photos.forEach(photo => {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'photo-card' + (state.panelPhotos[state.selectedPanel] === photo ? ' selected' : ''); card.title = `Use ${photo.name} in selected panel`;
      const image = document.createElement('img'); image.src = photo.image.src; image.alt = '';
      const label = document.createElement('span'); label.textContent = photo.name;
      card.append(image, label); card.addEventListener('click', () => assignPhoto(photo, state.selectedPanel)); library.appendChild(card);
    });
  }
  function setPanel(index) {
    state.selectedPanel = Math.max(0, Math.min(8, index));
    selectedLabel.textContent = `Panel ${String(index + 1).padStart(2, '0')} selected`;
    document.getElementById('panel-count').textContent = `PANEL ${String(index + 1).padStart(2, '0')} / 09`;
    renderLibrary(); redraw();
  }
  function hitPanel(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 900, y = (event.clientY - rect.top) / rect.height * 900;
    return window.AfterglowCover.panels.findIndex(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
  }
  async function loadSample(name, title) {
    const image = await loadImage(`./samples/${name}.jpg`);
    const previous = state.photos.find(p => p.source === `demo:${name}`);
    const photo = previous || addPhoto(image, name, `demo:${name}`);
    if (previous) { previous.image = image; renderLibrary(); }
    state.panelPhotos = Array.from({ length: 9 }, () => photo);
    state.crops = Array.from({ length: 9 }, () => ({ x: 0, y: 0, zoom: 1 }));
    caption.value = title; state.caption = title;
    redraw();
  }
  async function loadLocalFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      try { const image = await loadImage(url); addPhoto(image, file.name, 'local'); }
      catch (error) { URL.revokeObjectURL(url); console.error('Could not read image', error); }
    }
  }

  document.getElementById('photo-input').addEventListener('change', event => { loadLocalFiles(event.target.files); event.target.value = ''; });
  document.getElementById('demo-pier').addEventListener('click', () => loadSample('pier', 'Sunset Heist'));
  document.getElementById('demo-boulevard').addEventListener('click', () => loadSample('boulevard', 'Boulevard Queen'));
  document.getElementById('assign-all').addEventListener('click', () => { const photo = state.panelPhotos[state.selectedPanel] || state.photos[state.photos.length - 1]; if (photo) assignPhoto(photo, 'all'); });
  caption.addEventListener('input', redraw);
  document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(item => item.classList.remove('active')); button.classList.add('active'); state.captionColor = button.dataset.color; redraw();
  }));
  document.querySelectorAll('.look').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.look').forEach(item => item.classList.remove('active')); button.classList.add('active'); state.look = button.dataset.look; redraw();
  }));
  document.getElementById('zoom-in').addEventListener('click', () => { const crop = state.crops[state.selectedPanel]; crop.zoom = Math.min(3, crop.zoom + .1); redraw(); });
  document.getElementById('zoom-out').addEventListener('click', () => { const crop = state.crops[state.selectedPanel]; crop.zoom = Math.max(1, crop.zoom - .1); redraw(); });
  canvas.addEventListener('pointerdown', event => {
    const panel = hitPanel(event); if (panel < 0) return;
    setPanel(panel); dragging = { x: event.clientX, y: event.clientY }; canvas.classList.add('dragging'); canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect(); const crop = state.crops[state.selectedPanel];
    crop.x += (event.clientX - dragging.x) / rect.width * 900; crop.y += (event.clientY - dragging.y) / rect.height * 900;
    dragging = { x: event.clientX, y: event.clientY }; redraw();
  });
  function endDrag() { dragging = null; canvas.classList.remove('dragging'); }
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  document.getElementById('export').addEventListener('click', () => {
    const [width, height] = formatSizes[document.getElementById('format').value];
    const output = document.createElement('canvas'); output.width = width; output.height = height;
    window.AfterglowCover.drawCover(output, state, width, height);
    output.toBlob(blob => {
      if (!blob) return;
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `afterglow-${width}x${height}.png`; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      document.querySelector('#export span:first-child').textContent = 'Cover downloaded ✓';
      setTimeout(() => { document.querySelector('#export span:first-child').textContent = 'Download cover'; }, 1800);
    }, 'image/png');
  });
  window.AfterglowApp = { state, loadSample, redraw };
  const params = new URLSearchParams(location.search);
  if (params.has('shot')) {
    window.AfterglowShots.runShot(params.get('shot'), params, window.AfterglowApp).catch(error => { console.error(error); window.__shotReady = true; });
  } else redraw();
})();
