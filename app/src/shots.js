/* Reproducible scenes for the screenshot capture page. */
(() => {
  'use strict';
  async function runShot(query, editor) {
    const scene = query.get('shot');
    if (scene !== 'cover' && scene !== 'editor') return false;
    const photoName = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    if (scene === 'cover') document.body.classList.add('shot-cover');
    editor.setFormat('square');
    editor.fillAll(await editor.loadSample(photoName), photoName);
    editor.setCaption(query.get('caption') || 'CITY OF GOLD');
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    editor.redraw(); window.__shotReady = true; return true;
  }
  window.CoverShots = { runShot };
})();
