/* Local photo library, panel controls, crop gestures and PNG export. */
(function () {
  'use strict';
  const canvas = document.getElementById('cover');
  const fileInput = document.getElementById('photo');
  const captionInput = document.getElementById('caption');
  const status = document.getElementById('status');
  const zoom = document.getElementById('zoom');
  const library = document.getElementById('photo-library');
  const frameStrip = document.getElementById('frame-strip');
  const state = Array.from({ length: 9 }, () => ({ image: null, zoom: 1, panX: 0, panY: 0, label: '' }));
  const photos = [];
  let selected = 0, activePhoto = null, grade = 'vice', ink = '#fff4dc', format = 'square', drag = null;
  const sampleUrls = { pier: './samples/pier.jpg', boulevard: './samples/boulevard.jpg' };
  const byId = (id) => document.getElementById(id);
  function redraw() {
    CoverArt.render(canvas, state, { format, grade, caption: captionInput.value, ink, selected, outline: !document.body.classList.contains('shot-cover') });
    document.body.dataset.format = format;
  }
  function chooseFrame(index) {
    if (index < 0 || index >= state.length) return;
    selected = index;
    document.querySelectorAll('.frame-button').forEach((button, i) => button.classList.toggle('active', i === selected));
    byId('selected-label').textContent = `Frame ${String(selected + 1).padStart(2, '0')}`;
    zoom.value = state[selected].zoom || 1;
    byId('zoom-value').textContent = `${Number(zoom.value).toFixed(1)}×`;
    redraw();
  }
  function drawFrameButtons() {
    frameStrip.innerHTML = '';
    state.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `frame-button${index === selected ? ' active' : ''}`;
      button.textContent = String(index + 1).padStart(2, '0'); button.setAttribute('aria-label', `Select frame ${index + 1}`);
      button.addEventListener('click', () => chooseFrame(index)); frameStrip.appendChild(button);
    });
  }
  function addPhoto(image, label, url) {
    const record = { image, label, url, id: `${Date.now()}-${Math.random()}` };
    photos.push(record); activePhoto = record; renderLibrary();
    return record;
  }
  function renderLibrary() {
    library.innerHTML = '';
    if (!photos.length) {
      const empty = document.createElement('span'); empty.className = 'empty-library'; empty.textContent = 'Your photos will appear here.'; library.appendChild(empty); return;
    }
    photos.forEach((photo) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `photo-item${photo === activePhoto ? ' selected' : ''}`;
      button.textContent = photo.label; button.title = `${photo.label} · apply to selected frame`;
      button.addEventListener('click', () => { activePhoto = photo; applyToSelected(photo); renderLibrary(); }); library.appendChild(button);
    });
  }
  function applyToSelected(photo) {
    state[selected] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label };
    status.textContent = `${photo.label} added to frame ${String(selected + 1).padStart(2, '0')}`;
    chooseFrame(selected);
  }
  function fillAll(imageOrRecord, label) {
    const record = imageOrRecord && imageOrRecord.image ? imageOrRecord : addPhoto(imageOrRecord, label || 'Photo', '');
    activePhoto = record;
    for (let i = 0; i < state.length; i++) state[i] = { image: record.image, zoom: 1, panX: 0, panY: 0, label: record.label };
    renderLibrary(); chooseFrame(selected); status.textContent = `${record.label} fills all 9 frames`;
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url;
    });
  }
  async function loadSample(name) {
    const url = sampleUrls[name] || sampleUrls.pier;
    const image = await loadImage(url);
    return image;
  }
  function setCaption(text) { captionInput.value = text.slice(0, 34); redraw(); }
  function setFormat(value) { format = value; byId('format').value = value; redraw(); }
  fileInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    for (const file of files) {
      const url = URL.createObjectURL(file);
      try { const image = await loadImage(url); const record = addPhoto(image, file.name, url); applyToSelected(record); }
      catch (_) { URL.revokeObjectURL(url); status.textContent = `Couldn't open ${file.name}`; }
    }
    fileInput.value = '';
  });
  document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', async () => {
    try { const name = button.dataset.sample; const image = await loadSample(name); applyToSelected(addPhoto(image, name === 'boulevard' ? 'Boulevard demo' : 'Pier demo', sampleUrls[name])); }
    catch (_) { status.textContent = 'The bundled demo photo could not be opened'; }
  }));
  byId('fill-all').addEventListener('click', () => { if (activePhoto) fillAll(activePhoto); else status.textContent = 'Upload a photo or choose a demo first'; });
  captionInput.addEventListener('input', redraw);
  zoom.addEventListener('input', () => { state[selected].zoom = Number(zoom.value); byId('zoom-value').textContent = `${state[selected].zoom.toFixed(1)}×`; redraw(); });
  document.querySelectorAll('.grade-card').forEach((button) => button.addEventListener('click', () => {
    grade = button.dataset.grade; document.querySelectorAll('.grade-card').forEach((card) => card.classList.toggle('selected', card === button)); redraw();
  }));
  document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => {
    ink = button.dataset.ink; document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch === button)); redraw();
  }));
  byId('format').addEventListener('change', (event) => setFormat(event.target.value));
  canvas.addEventListener('pointerdown', (event) => {
    const index = CoverArt.frameAt(canvas, event.clientX, event.clientY);
    if (index < 0) return;
    if (index !== selected) chooseFrame(index);
    if (!state[selected].image) { if (activePhoto) applyToSelected(activePhoto); else return; }
    canvas.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, panX: state[selected].panX || 0, panY: state[selected].panY || 0, width: canvas.getBoundingClientRect().width / 3, height: canvas.getBoundingClientRect().height / 3 };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    state[selected].panX = drag.panX + (event.clientX - drag.x) / drag.width;
    state[selected].panY = drag.panY + (event.clientY - drag.y) / drag.height;
    redraw();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => canvas.addEventListener(type, () => { drag = null; }));
  byId('export').addEventListener('click', () => {
    redraw(); canvas.toBlob((blob) => {
      if (!blob) { status.textContent = 'PNG export failed'; return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      const dimensions = CoverArt.layouts[format];
      link.href = url; link.download = `afterglow-${dimensions.w}x${dimensions.h}.png`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = `Saved ${dimensions.w} × ${dimensions.h} PNG`;
    }, 'image/png');
  });
  drawFrameButtons(); renderLibrary(); redraw();
  const app = { redraw, loadSample, fillAll, setCaption, setFormat };
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) CoverShots.runShot(query, app).catch(() => { status.textContent = 'The screenshot scene could not load'; window.__shotReady = true; });
}());
