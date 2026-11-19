/* URL-driven initial state for deterministic editor and cover screenshots. */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const hasPhoto = params.has('photo');
  const hasCaption = params.has('caption');
  const wantsShot = shot === 'cover' || shot === 'editor';
  if (!wantsShot && !hasPhoto && !hasCaption) return;

  window.__shotReady = false;

  (async function applyUrlState() {
    const app = window.EditorApp;
    const state = app.state;
    const requestedPhoto = params.get('photo');
    const photo = requestedPhoto === 'boulevard' ? 'boulevard' : 'pier';
    const caption = hasCaption ? params.get('caption') : 'Sunset Heist';

    // Apply text and view mode immediately so restored/default UI cannot flash over URL state.
    if (hasCaption || wantsShot) {
      state.caption = caption;
      document.getElementById('caption').value = caption;
      document.getElementById('captionCount').textContent = `${caption.length}/34`;
    }
    if (shot === 'cover') document.body.classList.add('shot-cover');
    if (shot === 'editor') document.body.classList.add('shot-editor');

    try {
      const loadPhoto = hasPhoto || wantsShot
        ? app.loadImageSource(`./samples/${photo}.jpg`, photo, photo.toUpperCase())
        : Promise.resolve();
      await Promise.all([loadPhoto, document.fonts.ready]);

      if (hasPhoto || wantsShot) {
        state.panels.forEach((panel, index) => {
          state.panels[index] = { photo: state.selectedPhoto, x: 0, y: 0, zoom: 1 };
        });
      }
      app.setLayout('square');
      app.repaint();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.__shotReady = true;
      }));
    } catch (error) {
      document.getElementById('status').textContent = `Shot setup failed: ${error.message}`;
      window.__shotReady = true;
    }
  })();
})();
