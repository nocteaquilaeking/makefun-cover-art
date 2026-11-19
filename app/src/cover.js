/* Nine-window poster painter and PNG dimensions. */
(() => {
  'use strict';
  const layouts = { square: [1080, 1080], portrait: [1080, 1350], landscape: [1920, 1080] };
  const moods = {
    vice: { filter: 'saturate(1.13) contrast(1.06) sepia(.13)', sky: 'rgba(255,184,82,.13)', dusk: 'rgba(191,38,99,.28)', shade: .14 },
    neon: { filter: 'saturate(1.5) contrast(1.14) hue-rotate(-8deg)', sky: 'rgba(0,225,233,.19)', dusk: 'rgba(151,22,205,.37)', shade: .2 },
    clean: { filter: 'saturate(.92) contrast(1.02) brightness(1.03)', sky: 'rgba(255,249,225,.04)', dusk: 'rgba(27,28,42,.13)', shade: .12 }
  };
  function tileMap(w, h) {
    const gap = 9 * Math.min(w / 1080, h / 1080), sideW = (w - gap * 4) / 3, sideH = (h - gap * 4) / 3;
    return Array.from({ length: 9 }, (_, n) => ({ x: gap + (n % 3) * (sideW + gap), y: gap + Math.floor(n / 3) * (sideH + gap), w: sideW, h: sideH, n }));
  }
  function paintPhoto(ctx, box, entry, mood) {
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    if (entry && entry.image) {
      const image = entry.image, scale = Math.max(box.w / image.naturalWidth, box.h / image.naturalHeight) * (entry.zoom || 1);
      const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
      const cx = box.x + box.w / 2 + (entry.panX || 0) * box.w, cy = box.y + box.h / 2 + (entry.panY || 0) * box.h;
      ctx.filter = mood.filter; ctx.drawImage(image, cx - dw / 2, cy - dh / 2, dw, dh); ctx.filter = 'none';
    } else {
      const fill = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
      fill.addColorStop(0, '#34303a'); fill.addColorStop(1, '#24242c'); ctx.fillStyle = fill; ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = 'rgba(245,226,206,.12)'; ctx.font = `700 ${Math.min(box.w, box.h) * .11}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(box.n + 1).padStart(2, '0'), box.x + box.w / 2, box.y + box.h / 2);
    }
    const veil = ctx.createLinearGradient(0, box.y, 0, box.y + box.h); veil.addColorStop(0, mood.sky); veil.addColorStop(.48, 'rgba(8,8,18,0)'); veil.addColorStop(1, mood.dusk);
    ctx.fillStyle = veil; ctx.fillRect(box.x, box.y, box.w, box.h); ctx.restore();
  }
  function paintCaption(ctx, w, h, words, ink, mood) {
    if (!words || !words.trim()) return;
    const phrase = words.trim().toLocaleUpperCase(), inset = w * .055, limit = w - inset * 2; let px = Math.min(h * .115, w * .12);
    ctx.save(); ctx.font = `400 ${px}px Anton, Impact, sans-serif`;
    while (ctx.measureText(phrase).width > limit && px > 22) { px -= Math.max(1, px * .035); ctx.font = `400 ${px}px Anton, Impact, sans-serif`; }
    const base = h * .885, tint = ctx.createLinearGradient(0, base - px * 1.45, 0, h); tint.addColorStop(0, 'rgba(12,10,19,0)'); tint.addColorStop(1, `rgba(12,10,19,${mood.shade + .4})`);
    ctx.fillStyle = tint; ctx.fillRect(0, base - px * 1.45, w, h - base + px * 1.45); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(15,8,18,.72)'; ctx.shadowBlur = px * .16; ctx.shadowOffsetY = px * .075; ctx.strokeStyle = '#281b20'; ctx.lineWidth = Math.max(3, px * .075); ctx.strokeText(phrase, w / 2, base, limit);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillStyle = ink || '#fff4dc'; ctx.fillText(phrase, w / 2, base, limit); ctx.restore();
  }
  function render(canvas, photos, settings) {
    const format = layouts[settings.format] ? settings.format : 'square', [w, h] = layouts[format];
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d'), mood = moods[settings.grade] || moods.vice; ctx.fillStyle = '#16151d'; ctx.fillRect(0, 0, w, h);
    const boxes = tileMap(w, h); boxes.forEach((box, n) => paintPhoto(ctx, box, photos[n], mood));
    if (settings.selected >= 0 && settings.outline) { const box = boxes[settings.selected]; if (box) { ctx.save(); ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = Math.max(2, w / 540); ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2); ctx.restore(); } }
    paintCaption(ctx, w, h, settings.caption, settings.ink, mood);
  }
  function frameAt(canvas, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect(), x = (clientX - bounds.left) * canvas.width / bounds.width, y = (clientY - bounds.top) * canvas.height / bounds.height;
    return tileMap(canvas.width, canvas.height).findIndex((box) => x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h);
  }
  window.CoverArt = { render, frameAt, layouts: Object.fromEntries(Object.entries(layouts).map(([key, size]) => [key, { w: size[0], h: size[1] }])) };
})();
