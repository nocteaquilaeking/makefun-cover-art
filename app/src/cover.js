/* Canvas primitives for the nine-window cover and PNG export. */
(() => {
  'use strict';

  const formats = { square: [1080, 1080], portrait: [1080, 1350], landscape: [1920, 1080] };
  const grades = {
    vice: { filter: 'saturate(1.13) contrast(1.06) sepia(.13)', top: 'rgba(255,184,82,.13)', bottom: 'rgba(191,38,99,.28)', darkness: .14 },
    neon: { filter: 'saturate(1.5) contrast(1.14) hue-rotate(-8deg)', top: 'rgba(0,225,233,.19)', bottom: 'rgba(151,22,205,.37)', darkness: .2 },
    clean: { filter: 'saturate(.92) contrast(1.02) brightness(1.03)', top: 'rgba(255,249,225,.04)', bottom: 'rgba(27,28,42,.13)', darkness: .12 }
  };
  const maxCaptionCharacters = 42;

  function clampCaption(value) {
    const caption = String(value || '').trim();
    const characters = Array.from(caption);
    if (characters.length <= maxCaptionCharacters) return caption;
    return `${characters.slice(0, maxCaptionCharacters - 1).join('').trimEnd()}…`;
  }

  function cellsFor(w, h) {
    const gap = 9 * Math.min(w / 1080, h / 1080);
    const cw = (w - gap * 4) / 3, ch = (h - gap * 4) / 3;
    return Array.from({ length: 9 }, (_, n) => ({ n, x: gap + n % 3 * (cw + gap), y: gap + Math.floor(n / 3) * (ch + gap), w: cw, h: ch }));
  }

  function emptyCell(ctx, cell) {
    const wash = ctx.createLinearGradient(cell.x, cell.y, cell.x + cell.w, cell.y + cell.h);
    wash.addColorStop(0, '#34303a'); wash.addColorStop(1, '#24242c');
    ctx.fillStyle = wash; ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    ctx.fillStyle = 'rgba(245,226,206,.12)'; ctx.font = `700 ${Math.min(cell.w, cell.h) * .11}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(cell.n + 1).padStart(2, '0'), cell.x + cell.w / 2, cell.y + cell.h / 2);
  }

  function drawWindow(ctx, cell, item, grade) {
    ctx.save(); ctx.beginPath(); ctx.rect(cell.x, cell.y, cell.w, cell.h); ctx.clip();
    if (!item || !item.image) emptyCell(ctx, cell);
    else {
      const photo = item.image;
      const scale = Math.max(cell.w / photo.naturalWidth, cell.h / photo.naturalHeight) * (item.zoom || 1);
      const dw = photo.naturalWidth * scale, dh = photo.naturalHeight * scale;
      const cx = cell.x + cell.w / 2 + (item.panX || 0) * cell.w;
      const cy = cell.y + cell.h / 2 + (item.panY || 0) * cell.h;
      ctx.filter = grade.filter; ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh); ctx.filter = 'none';
    }
    const tint = ctx.createLinearGradient(0, cell.y, 0, cell.y + cell.h);
    tint.addColorStop(0, grade.top); tint.addColorStop(.48, 'rgba(8,8,18,0)'); tint.addColorStop(1, grade.bottom);
    ctx.fillStyle = tint; ctx.fillRect(cell.x, cell.y, cell.w, cell.h); ctx.restore();
  }

  function drawTitle(ctx, w, h, text, ink, grade) {
    const title = clampCaption(text).toLocaleUpperCase();
    if (!title) return;
    const margin = w * .055, room = w - margin * 2;
    let px = Math.min(h * .115, w * .12);
    ctx.save(); ctx.font = `400 ${px}px Anton, Impact, sans-serif`;
    while (ctx.measureText(title).width > room && px > 22) { px -= Math.max(1, px * .035); ctx.font = `400 ${px}px Anton, Impact, sans-serif`; }
    const base = h * .885, shade = ctx.createLinearGradient(0, base - px * 1.45, 0, h);
    shade.addColorStop(0, 'rgba(12,10,19,0)'); shade.addColorStop(1, `rgba(12,10,19,${grade.darkness + .4})`);
    ctx.fillStyle = shade; ctx.fillRect(0, base - px * 1.45, w, h - base + px * 1.45);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(15,8,18,.72)'; ctx.shadowBlur = px * .16; ctx.shadowOffsetY = px * .075;
    ctx.strokeStyle = '#281b20'; ctx.lineWidth = Math.max(3, px * .075); ctx.strokeText(title, w / 2, base, room);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillStyle = ink || '#fff4dc'; ctx.fillText(title, w / 2, base, room); ctx.restore();
  }

  function render(canvas, photos, settings) {
    const chosen = formats[settings.format] ? settings.format : 'square', [w, h] = formats[chosen];
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d'), grade = grades[settings.grade] || grades.vice;
    ctx.fillStyle = '#16151d'; ctx.fillRect(0, 0, w, h);
    const windows = cellsFor(w, h);
    windows.forEach((cell, i) => drawWindow(ctx, cell, photos[i], grade));
    if (settings.selected >= 0 && settings.outline && windows[settings.selected]) {
      const c = windows[settings.selected]; ctx.save(); ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = Math.max(2, w / 540);
      ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2); ctx.restore();
    }
    drawTitle(ctx, w, h, settings.caption, settings.ink, grade);
    canvas.dataset.coverRendered = 'true';
  }

  function exportPng(canvas, photos, settings, done) {
    if (canvas.dataset.coverRendered !== 'true') render(canvas, photos, settings);
    canvas.toBlob(done, 'image/png');
  }

  function frameAt(canvas, clientX, clientY) {
    const box = canvas.getBoundingClientRect(), x = (clientX - box.left) * canvas.width / box.width, y = (clientY - box.top) * canvas.height / box.height;
    return cellsFor(canvas.width, canvas.height).findIndex((c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
  }

  window.CoverArt = { render, exportPng, frameAt, layouts: Object.fromEntries(Object.entries(formats).map(([name, s]) => [name, { w: s[0], h: s[1] }])) };
})();
