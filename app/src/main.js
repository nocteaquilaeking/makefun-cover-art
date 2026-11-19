/* Browser controls for photo placement, framing, and export. */
(() => {
  'use strict';
  const id = (name) => document.getElementById(name), canvas = id('cover'), picker = id('photo'), caption = id('caption'), status = id('status'), zoom = id('zoom'), library = id('photo-library'), strip = id('frame-strip');
  const frames = Array.from({ length: 9 }, () => ({ image: null, zoom: 1, panX: 0, panY: 0, label: '' })), collection = [];
  const demos = { pier: './samples/pier.jpg', boulevard: './samples/boulevard.jpg' };
  let focus = 0, current = null, mood = 'vice', ink = '#fff4dc', format = 'square', gesture = null;
  const redraw = () => { CoverArt.render(canvas, frames, { format, grade: mood, caption: caption.value, ink, selected: focus, outline: !document.body.classList.contains('shot-cover') }); document.body.dataset.format = format; };
  function selectFrame(index) {
    if (index < 0 || index >= frames.length) return;
    focus = index; strip.querySelectorAll('button').forEach((el, n) => el.classList.toggle('active', n === focus));
    id('selected-label').textContent = `Frame ${String(focus + 1).padStart(2, '0')}`; zoom.value = frames[focus].zoom || 1; id('zoom-value').textContent = `${Number(zoom.value).toFixed(1)}×`; redraw();
  }
  function drawStrip() {
    strip.replaceChildren();
    frames.forEach((_, n) => { const button = document.createElement('button'); button.type = 'button'; button.className = `frame-button${n === focus ? ' active' : ''}`; button.textContent = String(n + 1).padStart(2, '0'); button.setAttribute('aria-label', `Select frame ${n + 1}`); button.addEventListener('click', () => selectFrame(n)); strip.append(button); });
  }
  function refreshLibrary() {
    library.replaceChildren();
    if (!collection.length) { const note = document.createElement('span'); note.className = 'empty-library'; note.textContent = 'Your photos will appear here.'; library.append(note); return; }
    collection.forEach((photo) => { const button = document.createElement('button'); button.type = 'button'; button.className = `photo-item${photo === current ? ' selected' : ''}`; button.textContent = photo.label; button.title = `${photo.label} · apply to selected frame`; button.addEventListener('click', () => { current = photo; apply(photo); refreshLibrary(); }); library.append(button); });
  }
  function remember(image, label, url) { const photo = { image, label, url, id: `${Date.now()}-${Math.random()}` }; collection.push(photo); current = photo; refreshLibrary(); return photo; }
  function apply(photo) { frames[focus] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label }; status.textContent = `${photo.label} added to frame ${String(focus + 1).padStart(2, '0')}`; selectFrame(focus); }
  function fill(photoOrImage, title) {
    const photo = photoOrImage && photoOrImage.image ? photoOrImage : remember(photoOrImage, title || 'Photo', ''); current = photo;
    frames.forEach((_, n) => { frames[n] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label }; }); refreshLibrary(); selectFrame(focus); status.textContent = `${photo.label} fills all 9 frames`;
  }
  function imageFrom(url) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }
  async function loadSample(name) { return imageFrom(demos[name] || demos.pier); }
  function setCaption(value) { caption.value = value.slice(0, 34); redraw(); }
  function setFormat(value) { format = value; id('format').value = value; redraw(); }
  picker.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    for (const file of files) { const url = URL.createObjectURL(file); try { apply(remember(await imageFrom(url), file.name, url)); } catch (_) { URL.revokeObjectURL(url); status.textContent = `Couldn't open ${file.name}`; } }
    picker.value = '';
  });
  document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', async () => { try { const name = button.dataset.sample, image = await loadSample(name); apply(remember(image, name === 'boulevard' ? 'Boulevard demo' : 'Pier demo', demos[name])); } catch (_) { status.textContent = 'The bundled demo photo could not be opened'; } }));
  id('fill-all').addEventListener('click', () => current ? fill(current) : (status.textContent = 'Upload a photo or choose a demo first'));
  caption.addEventListener('input', redraw);
  zoom.addEventListener('input', () => { frames[focus].zoom = Number(zoom.value); id('zoom-value').textContent = `${frames[focus].zoom.toFixed(1)}×`; redraw(); });
  document.querySelectorAll('.grade-card').forEach((button) => button.addEventListener('click', () => { mood = button.dataset.grade; document.querySelectorAll('.grade-card').forEach((card) => card.classList.toggle('selected', card === button)); redraw(); }));
  document.querySelectorAll('.swatch').forEach((button) => button.addEventListener('click', () => { ink = button.dataset.ink; document.querySelectorAll('.swatch').forEach((dot) => dot.classList.toggle('active', dot === button)); redraw(); }));
  id('format').addEventListener('change', (event) => setFormat(event.target.value));
  canvas.addEventListener('pointerdown', (event) => {
    const index = CoverArt.frameAt(canvas, event.clientX, event.clientY); if (index < 0) return; if (index !== focus) selectFrame(index);
    if (!frames[focus].image) { if (current) apply(current); else return; }
    canvas.setPointerCapture(event.pointerId); const rect = canvas.getBoundingClientRect();
    gesture = { x: event.clientX, y: event.clientY, panX: frames[focus].panX || 0, panY: frames[focus].panY || 0, w: rect.width / 3, h: rect.height / 3 };
  });
  canvas.addEventListener('pointermove', (event) => { if (!gesture) return; frames[focus].panX = gesture.panX + (event.clientX - gesture.x) / gesture.w; frames[focus].panY = gesture.panY + (event.clientY - gesture.y) / gesture.h; redraw(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((eventName) => canvas.addEventListener(eventName, () => { gesture = null; }));
  id('export').addEventListener('click', () => {
    redraw(); canvas.toBlob((blob) => { if (!blob) { status.textContent = 'PNG export failed'; return; } const url = URL.createObjectURL(blob), anchor = document.createElement('a'), size = CoverArt.layouts[format]; anchor.href = url; anchor.download = `afterglow-${size.w}x${size.h}.png`; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = `Saved ${size.w} × ${size.h} PNG`; }, 'image/png');
  });
  drawStrip(); refreshLibrary(); redraw();
  const api = { redraw, loadSample, fillAll: fill, setCaption, setFormat }, params = new URLSearchParams(location.search);
  if (params.has('shot')) CoverShots.runShot(params, api).catch(() => { status.textContent = 'The screenshot scene could not load'; window.__shotReady = true; });
})();
