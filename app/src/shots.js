/* Prepare repeatable browser scenes for the screenshot capture runner. */
(() => {
  'use strict';

  async function runShot(query, editor) {
    const scene = query.get('shot');
    if (scene !== 'cover' && scene !== 'editor') return false;

    const sample = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    if (scene === 'cover') document.body.classList.add('shot-cover');
    editor.setFormat('square');
    editor.fillAll(await editor.loadSample(sample), sample);
    editor.setCaption(query.get('caption') || 'CITY OF GOLD');

    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    editor.redraw();
    window.__shotReady = true;
    return true;
  }

  window.CoverShots = { runShot };
})();
