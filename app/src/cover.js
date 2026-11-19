/* Afterglow's original nine-window cover renderer. Panels share a designed grid while each keeps its own crop. */
(function () {
  'use strict';
  const BASE = 900;
  const GUTTER = 9;
  const PANELS = [
    { x: 0, y: 0, w: 300, h: 238 }, { x: 309, y: 0, w: 340, h: 238 }, { x: 658, y: 0, w: 242, h: 238 },
    { x: 0, y: 247, w: 250, h: 310 }, { x: 259, y: 247, w: 382, h: 310 }, { x: 650, y: 247, w: 250, h: 310 },
    { x: 0, y: 566, w: 286, h: 334 }, { x: 295, y: 566, w: 335, h: 334 }, { x: 639, y: 566, w: 261, h: 334 }
  ];
  const GRADES = {
    sunset: { filter: 'saturate(1.16) contrast(1.08)', top: 'rgba(50,28,79,.14)', bottom: 'rgba(237,91,100,.25)', edge: 'rgba(249,186,130,.12)' },
    neon: { filter: 'saturate(1.48) contrast(1.15) hue-rotate(7deg)', top: 'rgba(20,28,90,.24)', bottom: 'rgba(28,190,193,.19)', edge: 'rgba(211,75,201,.16)' },
    clean: { filter: 'saturate(.88) contrast(1.03) brightness(1.05)', top: 'rgba(248,231,211,.10)', bottom: 'rgba(27,39,53,.23)', edge: 'rgba(255,245,226,.09)' }
  };
  function drawImageCrop(ctx, photo, rect, crop, unit) {
    const x = rect.x * unit, y = rect.y * unit, w = rect.w * unit, h = rect.h * unit;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = '#28293b'; ctx.fillRect(x, y, w, h);
    if (photo) {
      const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * (crop.zoom || 1);
      const dw = photo.naturalWidth * scale, dh = photo.naturalHeight * scale;
      const cx = x + w / 2 + (crop.x || 0) * unit, cy = y + h / 2 + (crop.y || 0) * unit;
      ctx.filter = crop.gradeFilter || 'none';
      ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.filter = 'none';
    } else {
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#28324a'); grad.addColorStop(.55, '#815474'); grad.addColorStop(1, '#ed9d73');
      ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#fff'; ctx.globalAlpha = .6;
      ctx.beginPath(); ctx.arc(x + w * .72, y + h * .3, Math.min(w, h) * .14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function drawCover(canvas, state, width, height) {
    const ctx = canvas.getContext('2d');
    const w = width || canvas.width, h = height || canvas.height;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#171525'; ctx.fillRect(0, 0, w, h);
    const unit = 1;
    const artW = BASE, artH = BASE;
    const ox = 0, oy = 0;
    ctx.save(); ctx.scale(w / BASE, h / BASE);
    const grade = GRADES[state.look] || GRADES.sunset;
    PANELS.forEach((rect, i) => {
      const crop = state.crops[i] || { x: 0, y: 0, zoom: 1 };
      const photo = state.panelPhotos[i] || state.photos[0] || null;
      drawImageCrop(ctx, photo && photo.image, rect, crop, unit);
      const px = rect.x * unit, py = rect.y * unit, pw = rect.w * unit, ph = rect.h * unit;
      ctx.save();
      const shade = ctx.createLinearGradient(0, py, 0, py + ph);
      shade.addColorStop(0, grade.top); shade.addColorStop(.55, 'rgba(8,11,23,0)'); shade.addColorStop(1, grade.bottom);
      ctx.fillStyle = shade; ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = grade.edge; ctx.fillRect(px, py, pw, ph);
      ctx.restore();
    });
    // Restrained print marks make the panel system feel like a collected street poster.
    ctx.fillStyle = 'rgba(10,12,22,.66)'; ctx.fillRect(17 * unit, 17 * unit, 159 * unit, 25 * unit);
    ctx.font = `700 ${11 * unit}px ui-sans-serif,system-ui`; ctx.textAlign = 'left'; ctx.fillStyle = '#fff3dd';
    ctx.fillText('AFTERGLOW  /  CITY STORIES', 25 * unit, 34 * unit);
    const title = String(state.caption || '').trim().toUpperCase();
    if (title) {
      let size = Math.min(95, 900 / Math.max(6, title.length) * 1.2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = `${size * unit}px Anton, Impact, sans-serif`;
      while (ctx.measureText(title).width > artW * .88 && size > 22) { size -= 2; ctx.font = `${size * unit}px Anton, Impact, sans-serif`; }
      const baseline = 827 * unit;
      ctx.save(); ctx.shadowColor = 'rgba(8,7,17,.85)'; ctx.shadowBlur = 14 * unit; ctx.shadowOffsetY = 4 * unit;
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, 5 * unit); ctx.strokeStyle = 'rgba(25,16,31,.92)';
      ctx.strokeText(title, artW / 2, baseline, artW * .9);
      ctx.fillStyle = state.captionColor || '#fff5df'; ctx.fillText(title, artW / 2, baseline, artW * .9);
      ctx.restore();
      ctx.fillStyle = state.captionColor || '#fff5df'; ctx.globalAlpha = .8;
      ctx.fillRect(artW * .38, 844 * unit, artW * .24, 2 * unit); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Gutter color and a narrow outer keyline keep panels crisp at every output size.
    ctx.strokeStyle = 'rgba(11,12,20,.9)'; ctx.lineWidth = GUTTER * unit; ctx.strokeRect(ox, oy, artW, artH);
    ctx.strokeStyle = 'rgba(255,241,220,.28)'; ctx.lineWidth = 1.2 * unit; ctx.strokeRect(ox + unit, oy + unit, artW - 2 * unit, artH - 2 * unit);
  }
  window.AfterglowCover = { drawCover, panels: PANELS, grades: GRADES };
})();
