/* Connect the studio controls to the cover renderer. */
(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const canvas = byId('cover'), upload = byId('photo'), caption = byId('caption'), status = byId('status');
  const zoom = byId('zoom'), library = byId('photo-library'), frameList = byId('frame-strip');
  const frames = Array.from({ length: 9 }, () => ({ image: null, zoom: 1, panX: 0, panY: 0, label: '' }));
  const photos = [], samplePaths = { pier: './samples/pier.jpg', boulevard: './samples/boulevard.jpg' };
  let selected = 0, currentPhoto = null, grade = 'vice', ink = '#fff4dc', format = 'square', drag = null;
  function repaint() {
    CoverArt.render(canvas, frames, { format, grade, caption: caption.value, ink, selected, outline: !document.body.classList.contains('shot-cover') });
    document.body.dataset.format = format;
  }
  function chooseFrame(index) {
    if (index < 0 || index >= frames.length) return;
    selected = index;
    frameList.querySelectorAll('button').forEach((button, i) => button.classList.toggle('active', i === index));
    byId('selected-label').textContent = `Frame ${String(index + 1).padStart(2, '0')}`;
    zoom.value = frames[index].zoom || 1; byId('zoom-value').textContent = `${Number(zoom.value).toFixed(1)}×`; repaint();
  }
  function buildFramePicker() {
    frameList.replaceChildren();
    frames.forEach((_, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `frame-button${index === selected ? ' active' : ''}`;
      button.textContent = String(index + 1).padStart(2, '0'); button.setAttribute('aria-label', `Select frame ${index + 1}`);
      button.addEventListener('click', () => chooseFrame(index)); frameList.append(button);
    });
  }
  function refreshLibrary() {
    library.replaceChildren();
    if (!photos.length) {
      const empty = document.createElement('span'); empty.className = 'empty-library'; empty.textContent = 'Your photos will appear here.'; library.append(empty); return;
    }
    photos.forEach((photo) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `photo-item${photo === currentPhoto ? ' selected' : ''}`;
      button.textContent = photo.label; button.title = `${photo.label} · apply to selected frame`;
      button.addEventListener('click', () => { currentPhoto = photo; placePhoto(photo); refreshLibrary(); }); library.append(button);
    });
  }
  function remember(image, label, source) {
    const photo = { image, label, source, key: `${Date.now()}-${Math.random()}` };
    photos.push(photo); currentPhoto = photo; refreshLibrary(); return photo;
  }
  function placePhoto(photo) {
    frames[selected] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label };
    status.textContent = `${photo.label} added to frame ${String(selected + 1).padStart(2, '0')}`; chooseFrame(selected);
  }
  function fillAll(value, label) {
    const photo = value && value.image ? value : remember(value, label || 'Photo', ''); currentPhoto = photo;
    frames.forEach((_, index) => { frames[index] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label }; });
    refreshLibrary(); chooseFrame(selected); status.textContent = `${photo.label} fills all 9 frames`;
  }
  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source;
    });
  }
  const loadSample = (name) => loadImage(samplePaths[name] || samplePaths.pier);
  function setCaption(value) { caption.value = value.slice(0, 34); repaint(); }
  function setFormat(value) { format = value; byId('format').value = value; repaint(); }

  upload.addEventListener('change', async (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    for (const file of selectedFiles) {
      const source = URL.createObjectURL(file);
      try { placePhoto(remember(await loadImage(source), file.name, source)); }
      catch (_) { URL.revokeObjectURL(source); status.textContent = `Couldn't open ${file.name}`; }
    }
    upload.value = '';
  });
  document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', async () => {
    const name = button.dataset.sample;
    try { placePhoto(remember(await loadSample(name), name === 'boulevard' ? 'Boulevard demo' : 'Pier demo', samplePaths[name])); }
    catch (_) { status.textContent = 'The bundled demo photo could not be opened'; }
  }));
  byId('fill-all').addEventListener('click', () => currentPhoto ? fillAll(currentPhoto) : (status.textContent = 'Upload a photo or choose a demo first'));
  caption.addEventListener('input', repaint);
  zoom.addEventListener('input', () => { frames[selected].zoom = Number(zoom.value); byId('zoom-value').textContent = `${frames[selected].zoom.toFixed(1)}×`; repaint(); });
  document.querySelectorAll('.grade-card').forEach((button) => button.addEventListener('click', () => {
    grade = button.dataset.grade; document.querySelectorAll('.grade-card').forEach((card) => card.classList.toggle('selected', card === button)); repaint();
  }));
  document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => {
    ink = button.dataset.ink; document.querySelectorAll('.swatch').forEach((item) => item.classList.toggle('active', item === button)); repaint();
  }));
  byId('format').addEventListener('change', (event) => setFormat(event.target.value));
  canvas.addEventListener('pointerdown', (event) => {
    const index = CoverArt.frameAt(canvas, event.clientX, event.clientY); if (index < 0) return;
    if (index !== selected) chooseFrame(index);
    if (!frames[selected].image) { if (currentPhoto) placePhoto(currentPhoto); else return; }
    canvas.setPointerCapture(event.pointerId); const box = canvas.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, panX: frames[selected].panX || 0, panY: frames[selected].panY || 0, w: box.width / 3, h: box.height / 3 };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    frames[selected].panX = drag.panX + (event.clientX - drag.x) / drag.w;
    frames[selected].panY = drag.panY + (event.clientY - drag.y) / drag.h; repaint();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => canvas.addEventListener(name, () => { drag = null; }));
  byId('export').addEventListener('click', () => {
    repaint(); CoverArt.exportPng(canvas, frames, { format, grade, caption: caption.value, ink, selected, outline: false }, (blob) => {
      if (!blob) { status.textContent = 'PNG export failed'; return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a'), size = CoverArt.layouts[format];
      link.href = url; link.download = `afterglow-${size.w}x${size.h}.png`; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = `Saved ${size.w} × ${size.h} PNG`;
    });
  });
  buildFramePicker(); refreshLibrary(); repaint();
  const api = { redraw: repaint, loadSample, fillAll, setCaption, setFormat };
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) CoverShots.runShot(query, api).catch(() => { status.textContent = 'The screenshot scene could not load'; window.__shotReady = true; });
})();
