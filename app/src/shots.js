/* Deterministic scene setup for the screenshot capture harness. */
(() => {
  'use strict';
  async function runShot(params, editor) {
    const mode = params.get('shot');
    if (mode !== 'cover' && mode !== 'editor') return false;
    const demo = params.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    if (mode === 'cover') document.body.classList.add('shot-cover');
    editor.setFormat('square');
    editor.fillAll(await editor.loadSample(demo), demo);
    editor.setCaption(params.get('caption') || 'CITY OF GOLD');
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    editor.redraw(); window.__shotReady = true; return true;
  }
  window.CoverShots = { runShot };
})();
