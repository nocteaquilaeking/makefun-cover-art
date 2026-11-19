/* Screenshot hooks: ?shot=cover|editor&photo=pier|boulevard&caption=... */
(function () {
  'use strict';
  async function runShot(shot, query, app) {
    if (shot !== 'cover' && shot !== 'editor') return false;
    const sample = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');
    await app.loadSample(sample, query.get('caption') || 'Sunset Heist');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.__shotReady = true;
    return true;
  }
  window.AfterglowShots = { runShot };
})();
