/* Deterministic screenshot setup. The app signals readiness only after the sample is painted. */
(function () {
  async function runShot(shot, query, loadSample, paint) {
    if (shot !== 'cover' && shot !== 'editor') return false;
    const photo = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
    document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');
    await loadSample(`./samples/${photo}.jpg`);
    const caption = query.get('caption');
    paint(caption === null ? 'SUNSET HEIST' : caption);
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.__shotReady = true;
    return true;
  }
  window.runCoverShot = runShot;
})();
