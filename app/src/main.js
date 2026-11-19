/* Bind the studio controls to the canvas renderer. */
(() => {
  'use strict';
  const el = (id) => document.getElementById(id);
  const canvas = el('cover'), upload = el('photo'), caption = el('caption'), status = el('status');
  const zoom = el('zoom'), library = el('photo-library'), frameList = el('frame-strip');
  const frames = Array.from({ length: 9 }, () => ({ image: null, zoom: 1, panX: 0, panY: 0, label: '' }));
  const libraryItems = [], paths = { pier: './samples/pier.jpg', boulevard: './samples/boulevard.jpg' };
  let selected = 0, currentPhoto = null, grade = 'vice', ink = '#fff4dc', format = 'square', drag = null;

  function repaint() {
    CoverArt.render(canvas, frames, { format, grade, caption: caption.value, ink, selected, outline: !document.body.classList.contains('shot-cover') });
    document.body.dataset.format = format;
  }
  function chooseFrame(index) {
    if (index < 0 || index >= frames.length) return;
    selected = index;
    frameList.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
    el('selected-label').textContent = `Frame ${String(index + 1).padStart(2, '0')}`;
    zoom.value = frames[index].zoom || 1; el('zoom-value').textContent = `${Number(zoom.value).toFixed(1)}×`; repaint();
  }
  function makeFramePicker() {
    frameList.replaceChildren();
    frames.forEach((_, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `frame-button${i === selected ? ' active' : ''}`;
      button.textContent = String(i + 1).padStart(2, '0'); button.setAttribute('aria-label', `Select frame ${i + 1}`);
      button.addEventListener('click', () => chooseFrame(i)); frameList.append(button);
    });
  }
  function showLibrary() {
    library.replaceChildren();
    if (!libraryItems.length) { const note = document.createElement('span'); note.className = 'empty-library'; note.textContent = 'Your photos will appear here.'; library.append(note); return; }
    libraryItems.forEach((photo) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `photo-item${photo === currentPhoto ? ' selected' : ''}`;
      button.textContent = photo.label; button.title = `${photo.label} · apply to selected frame`;
      button.addEventListener('click', () => { currentPhoto = photo; applyPhoto(photo); showLibrary(); }); library.append(button);
    });
  }
  function remember(image, label, source) {
    const item = { image, label, source, key: `${Date.now()}-${Math.random()}` };
    libraryItems.push(item); currentPhoto = item; showLibrary(); return item;
  }
  function applyPhoto(photo) {
    frames[selected] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label };
    status.textContent = `${photo.label} added to frame ${String(selected + 1).padStart(2, '0')}`; chooseFrame(selected);
  }
  function fillAll(value, label) {
    const photo = value && value.image ? value : remember(value, label || 'Photo', ''); currentPhoto = photo;
    frames.forEach((_, i) => { frames[i] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label }; });
    showLibrary(); chooseFrame(selected); status.textContent = `${photo.label} fills all 9 frames`;
  }
  function loadImage(source) {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
  }
  const loadSample = (name) => loadImage(paths[name] || paths.pier);
  function setCaption(value) { caption.value = value.slice(0, 34); repaint(); }
  function setFormat(value) { format = value; el('format').value = value; repaint(); }

  upload.addEventListener('change', async (event) => {
    const images = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    for (const file of images) {
      const source = URL.createObjectURL(file);
      try { applyPhoto(remember(await loadImage(source), file.name, source)); }
      catch (_) { URL.revokeObjectURL(source); status.textContent = `Couldn't open ${file.name}`; }
    }
    upload.value = '';
  });
  document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', async () => {
    const name = button.dataset.sample;
    try { applyPhoto(remember(await loadSample(name), name === 'boulevard' ? 'Boulevard demo' : 'Pier demo', paths[name])); }
    catch (_) { status.textContent = 'The bundled demo photo could not be opened'; }
  }));
  el('fill-all').addEventListener('click', () => currentPhoto ? fillAll(currentPhoto) : (status.textContent = 'Upload a photo or choose a demo first'));
  caption.addEventListener('input', repaint);
  zoom.addEventListener('input', () => { frames[selected].zoom = Number(zoom.value); el('zoom-value').textContent = `${frames[selected].zoom.toFixed(1)}×`; repaint(); });
  document.querySelectorAll('.grade-card').forEach((button) => button.addEventListener('click', () => {
    grade = button.dataset.grade; document.querySelectorAll('.grade-card').forEach((card) => card.classList.toggle('selected', card === button)); repaint();
  }));
  document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => {
    ink = button.dataset.ink; document.querySelectorAll('.swatch').forEach((item) => item.classList.toggle('active', item === button)); repaint();
  }));
  el('format').addEventListener('change', (event) => setFormat(event.target.value));

  canvas.addEventListener('pointerdown', (event) => {
    const index = CoverArt.frameAt(canvas, event.clientX, event.clientY); if (index < 0) return;
    if (index !== selected) chooseFrame(index);
    if (!frames[selected].image) { if (currentPhoto) applyPhoto(currentPhoto); else return; }
    canvas.setPointerCapture(event.pointerId); const box = canvas.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, panX: frames[selected].panX || 0, panY: frames[selected].panY || 0, w: box.width / 3, h: box.height / 3 };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    frames[selected].panX = drag.panX + (event.clientX - drag.x) / drag.w;
    frames[selected].panY = drag.panY + (event.clientY - drag.y) / drag.h; repaint();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => canvas.addEventListener(name, () => { drag = null; }));
  el('export').addEventListener('click', () => {
    repaint(); CoverArt.exportPng(canvas, frames, { format, grade, caption: caption.value, ink, selected, outline: false }, (blob) => {
      if (!blob) { status.textContent = 'PNG export failed'; return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a'), size = CoverArt.layouts[format];
      link.href = url; link.download = `afterglow-${size.w}x${size.h}.png`; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = `Saved ${size.w} × ${size.h} PNG`;
    });
  });

  makeFramePicker(); showLibrary(); repaint();
  const api = { redraw: repaint, loadSample, fillAll, setCaption, setFormat };
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) CoverShots.runShot(query, api).catch(() => { status.textContent = 'The screenshot scene could not load'; window.__shotReady = true; });
})();
