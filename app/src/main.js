/* Connect the form controls to the cover painter and downloadable canvas. */
(() => {
  'use strict';

  const byId = (key) => document.getElementById(key);
  const canvas = byId('cover');
  const upload = byId('photo');
  const captionField = byId('caption');
  const message = byId('status');
  const zoomField = byId('zoom');
  const photoShelf = byId('photo-library');
  const frameShelf = byId('frame-strip');
  const tiles = Array.from({ length: 9 }, () => ({ image: null, zoom: 1, panX: 0, panY: 0, label: '' }));
  const savedPhotos = [];
  const sampleUrls = { pier: './samples/pier.jpg', boulevard: './samples/boulevard.jpg' };
  let activeTile = 0;
  let activePhoto = null;
  let activeGrade = 'vice';
  let titleInk = '#fff4dc';
  let canvasFormat = 'square';
  let dragState = null;

  function redraw() {
    CoverArt.render(canvas, tiles, {
      format: canvasFormat,
      grade: activeGrade,
      caption: captionField.value,
      ink: titleInk,
      selected: activeTile,
      outline: !document.body.classList.contains('shot-cover')
    });
    document.body.dataset.format = canvasFormat;
  }

  function selectTile(index) {
    if (index < 0 || index >= tiles.length) return;
    activeTile = index;
    frameShelf.querySelectorAll('button').forEach((button, position) => button.classList.toggle('active', position === index));
    byId('selected-label').textContent = `Frame ${String(index + 1).padStart(2, '0')}`;
    zoomField.value = tiles[index].zoom || 1;
    byId('zoom-value').textContent = `${Number(zoomField.value).toFixed(1)}×`;
    redraw();
  }

  function buildTileButtons() {
    frameShelf.replaceChildren();
    tiles.forEach((_, position) => {
      const control = document.createElement('button');
      control.type = 'button';
      control.className = `frame-button${position === activeTile ? ' active' : ''}`;
      control.textContent = String(position + 1).padStart(2, '0');
      control.setAttribute('aria-label', `Select frame ${position + 1}`);
      control.addEventListener('click', () => selectTile(position));
      frameShelf.append(control);
    });
  }

  function refreshPhotoShelf() {
    photoShelf.replaceChildren();
    if (!savedPhotos.length) {
      const empty = document.createElement('span');
      empty.className = 'empty-library';
      empty.textContent = 'Your photos will appear here.';
      photoShelf.append(empty);
      return;
    }
    savedPhotos.forEach((photo) => {
      const control = document.createElement('button');
      control.type = 'button';
      control.className = `photo-item${photo === activePhoto ? ' selected' : ''}`;
      control.textContent = photo.label;
      control.title = `${photo.label} · apply to selected frame`;
      control.addEventListener('click', () => {
        activePhoto = photo;
        putInTile(photo);
        refreshPhotoShelf();
      });
      photoShelf.append(control);
    });
  }

  function savePhoto(image, label, source) {
    const photo = { image, label, source, key: `${Date.now()}-${Math.random()}` };
    savedPhotos.push(photo);
    activePhoto = photo;
    refreshPhotoShelf();
    return photo;
  }

  function putInTile(photo) {
    tiles[activeTile] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label };
    message.textContent = `${photo.label} added to frame ${String(activeTile + 1).padStart(2, '0')}`;
    selectTile(activeTile);
  }

  function fillCanvas(value, label) {
    const photo = value && value.image ? value : savePhoto(value, label || 'Photo', '');
    activePhoto = photo;
    for (let index = 0; index < tiles.length; index += 1) {
      tiles[index] = { image: photo.image, zoom: 1, panX: 0, panY: 0, label: photo.label };
    }
    refreshPhotoShelf();
    selectTile(activeTile);
    message.textContent = `${photo.label} fills all 9 frames`;
  }

  function fetchImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  async function fetchSample(name) {
    return fetchImage(sampleUrls[name] || sampleUrls.pier);
  }

  function setCaption(value) {
    captionField.value = value.slice(0, 34);
    redraw();
  }

  function setFormat(value) {
    canvasFormat = value;
    byId('format').value = value;
    redraw();
  }

  upload.addEventListener('change', async (event) => {
    const accepted = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    for (const file of accepted) {
      const source = URL.createObjectURL(file);
      try {
        putInTile(savePhoto(await fetchImage(source), file.name, source));
      } catch (_) {
        URL.revokeObjectURL(source);
        message.textContent = `Couldn't open ${file.name}`;
      }
    }
    upload.value = '';
  });

  document.querySelectorAll('[data-sample]').forEach((control) => control.addEventListener('click', async () => {
    const name = control.dataset.sample;
    try {
      const photo = savePhoto(await fetchSample(name), name === 'boulevard' ? 'Boulevard demo' : 'Pier demo', sampleUrls[name]);
      putInTile(photo);
    } catch (_) {
      message.textContent = 'The bundled demo photo could not be opened';
    }
  }));

  byId('fill-all').addEventListener('click', () => {
    if (activePhoto) fillCanvas(activePhoto);
    else message.textContent = 'Upload a photo or choose a demo first';
  });
  captionField.addEventListener('input', redraw);
  zoomField.addEventListener('input', () => {
    tiles[activeTile].zoom = Number(zoomField.value);
    byId('zoom-value').textContent = `${tiles[activeTile].zoom.toFixed(1)}×`;
    redraw();
  });
  document.querySelectorAll('.grade-card').forEach((control) => control.addEventListener('click', () => {
    activeGrade = control.dataset.grade;
    document.querySelectorAll('.grade-card').forEach((card) => card.classList.toggle('selected', card === control));
    redraw();
  }));
  document.querySelectorAll('.swatch').forEach((control) => control.addEventListener('click', () => {
    titleInk = control.dataset.ink;
    document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch === control));
    redraw();
  }));
  byId('format').addEventListener('change', (event) => setFormat(event.target.value));

  canvas.addEventListener('pointerdown', (event) => {
    const index = CoverArt.frameAt(canvas, event.clientX, event.clientY);
    if (index < 0) return;
    if (index !== activeTile) selectTile(index);
    if (!tiles[activeTile].image) {
      if (activePhoto) putInTile(activePhoto);
      else return;
    }
    canvas.setPointerCapture(event.pointerId);
    const bounds = canvas.getBoundingClientRect();
    dragState = {
      x: event.clientX, y: event.clientY,
      panX: tiles[activeTile].panX || 0, panY: tiles[activeTile].panY || 0,
      width: bounds.width / 3, height: bounds.height / 3
    };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragState) return;
    tiles[activeTile].panX = dragState.panX + (event.clientX - dragState.x) / dragState.width;
    tiles[activeTile].panY = dragState.panY + (event.clientY - dragState.y) / dragState.height;
    redraw();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((kind) => canvas.addEventListener(kind, () => { dragState = null; }));

  byId('export').addEventListener('click', () => {
    redraw();
    canvas.toBlob((blob) => {
      if (!blob) {
        message.textContent = 'PNG export failed';
        return;
      }
      const address = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const size = CoverArt.layouts[canvasFormat];
      link.href = address;
      link.download = `afterglow-${size.w}x${size.h}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(address), 1000);
      message.textContent = `Saved ${size.w} × ${size.h} PNG`;
    }, 'image/png');
  });

  buildTileButtons();
  refreshPhotoShelf();
  redraw();

  const sceneApi = { redraw, loadSample: fetchSample, fillAll: fillCanvas, setCaption, setFormat };
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) {
    CoverShots.runShot(query, sceneApi).catch(() => {
      message.textContent = 'The screenshot scene could not load';
      window.__shotReady = true;
    });
  }
})();
