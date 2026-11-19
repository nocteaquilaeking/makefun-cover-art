/* Screenshot scenes: all requested parameters settle without interaction. */
(function () {
  'use strict';
  async function runShot(query, app) {
    const shot = query.get('shot');
    if (shot !== 'cover' && shot !== 'editor') return false;
    const photo = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    const caption = query.get('caption') || 'CITY OF GOLD';
    if (shot === 'cover') document.body.classList.add('shot-cover');
    app.setFormat('square');
    const image = await app.loadSample(photo);
    app.fillAll(image, photo);
    app.setCaption(caption);
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    app.redraw();
    window.__shotReady = true;
    return true;
  }
  window.CoverShots = { runShot };
}());
