/* Editor state and local photo handling. No image leaves this page. */
(function () {
  const canvas = document.getElementById('cover'), caption = document.getElementById('caption'), color = document.getElementById('captionColor');
  const status = document.getElementById('status'), zoom = document.getElementById('zoom');
  const panels = CoverArt.panels.map(() => ({ photo: null, x: 0, y: 0, zoom: 1 }));
  let selected = 0, look = 'vice', pointer = null;
  const photos = [];
  function render(selection) { CoverArt.drawCover(canvas, panels, caption.value, color.value, look, selected, { selection: !!selection }); document.getElementById('selectionLabel').textContent = `PANEL ${String(selected + 1).padStart(2, '0')} / 06`; }
  function choosePanel(index) { selected = index; zoom.value = panels[selected].zoom; render(true); }
  function applyPhoto(photo, all) { if (all) panels.forEach((p) => { p.photo = photo; p.x = 0; p.y = 0; p.zoom = 1; }); else { panels[selected].photo = photo; panels[selected].x = 0; panels[selected].y = 0; panels[selected].zoom = 1; } render(!document.body.classList.contains('shot-cover')); }
  function loadImage(url) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }
  async function loadSample(path) { const photo = await loadImage(path); photos.push(photo); applyPhoto(photo, true); }
  document.getElementById('photoFiles').addEventListener('change', async (event) => {
    for (const file of Array.from(event.target.files || [])) {
      if (!file.type.startsWith('image/')) continue;
      const localUrl = URL.createObjectURL(file);
      try { const photo = await loadImage(localUrl); photos.push(photo); applyPhoto(photo, event.shiftKey || panels.every((panel) => !panel.photo)); status.textContent = `${file.name} loaded locally.`; }
      catch (_) { status.textContent = `Could not read ${file.name}.`; }
    }
    event.target.value = '';
  });
  document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', async () => { await loadSample(`./samples/${button.dataset.demo}.jpg`); status.textContent = 'Sample loaded into every panel.'; }));
  caption.addEventListener('input', () => render(!document.body.classList.contains('shot-cover')));
  color.addEventListener('input', () => render(!document.body.classList.contains('shot-cover')));
  zoom.addEventListener('input', () => { panels[selected].zoom = Number(zoom.value); render(true); });
  document.querySelectorAll('[data-look]').forEach((button) => button.addEventListener('click', () => { look = button.dataset.look; document.querySelectorAll('[data-look]').forEach((item) => item.classList.toggle('active', item === button)); render(!document.body.classList.contains('shot-cover')); }));
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    const found = CoverArt.panels.find((panel) => x >= panel.x && x <= panel.x + panel.w && y >= panel.y && y <= panel.y + panel.h);
    if (!found) return; choosePanel(found.id); canvas.setPointerCapture(event.pointerId); pointer = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointermove', (event) => { if (!pointer) return; const rect = canvas.getBoundingClientRect(), panel = CoverArt.panels[selected], state = panels[selected]; state.x += (event.clientX - pointer.x) / rect.width / panel.w; state.y += (event.clientY - pointer.y) / rect.height / panel.h; pointer = { x: event.clientX, y: event.clientY }; render(true); });
  canvas.addEventListener('pointerup', () => { pointer = null; }); canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('wheel', (event) => { event.preventDefault(); panels[selected].zoom = Math.max(1, Math.min(2.6, panels[selected].zoom + (event.deltaY < 0 ? .06 : -.06))); zoom.value = panels[selected].zoom; render(true); }, { passive: false });
  const formats = { square: [1080, 1080], portrait: [1080, 1350], landscape: [1920, 1080] };
  document.getElementById('export').addEventListener('click', async () => {
    await document.fonts.ready;
    const [width, height] = formats[document.getElementById('format').value], output = document.createElement('canvas'); output.width = width; output.height = height;
    CoverArt.drawCover(output, panels, caption.value, color.value, look, selected, {});
    output.toBlob((blob) => { if (!blob) { status.textContent = 'PNG export failed.'; return; } const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `afterglow-${width}x${height}.png`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); status.textContent = `Saved ${width} × ${height} PNG.`; }, 'image/png');
  });
  const query = new URLSearchParams(location.search);
  if (query.has('shot')) runCoverShot(query.get('shot'), query, loadSample, (text) => { caption.value = text; render(false); });
  else render(true);
})();
