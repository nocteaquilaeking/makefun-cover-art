/* Draw and export the nine-frame cover canvas. */
const CAPTION_LIMIT = 44;
(() => {
  'use strict';
  const formats = { square: [1080, 1080], portrait: [1080, 1350], landscape: [1920, 1080] };
  const grades = {
    vice: { filter: 'saturate(1.13) contrast(1.06) sepia(.13)', top: 'rgba(255,184,82,.13)', bottom: 'rgba(191,38,99,.28)', darkness: .14 },
    neon: { filter: 'saturate(1.5) contrast(1.14) hue-rotate(-8deg)', top: 'rgba(0,225,233,.19)', bottom: 'rgba(151,22,205,.37)', darkness: .2 },
    clean: { filter: 'saturate(.92) contrast(1.02) brightness(1.03)', top: 'rgba(255,249,225,.04)', bottom: 'rgba(27,28,42,.13)', darkness: .12 }
  };
  const boundedCaption = (value) => {
    const chars = Array.from(String(value || '').trim());
    return chars.length <= CAPTION_LIMIT ? chars.join('') : `${chars.slice(0, CAPTION_LIMIT - 1).join('').trimEnd()}…`;
  };
  function cells(width, height) {
    const gap = 9 * Math.min(width / 1080, height / 1080);
    const cw = (width - gap * 4) / 3, ch = (height - gap * 4) / 3;
    return Array.from({ length: 9 }, (_, n) => ({ n, x: gap + n % 3 * (cw + gap), y: gap + Math.floor(n / 3) * (ch + gap), w: cw, h: ch }));
  }
  function blank(ctx, cell) {
    const gradient = ctx.createLinearGradient(cell.x, cell.y, cell.x + cell.w, cell.y + cell.h);
    gradient.addColorStop(0, '#34303a'); gradient.addColorStop(1, '#24242c');
    ctx.fillStyle = gradient; ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    ctx.fillStyle = 'rgba(245,226,206,.12)'; ctx.font = `700 ${Math.min(cell.w, cell.h) * .11}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(cell.n + 1).padStart(2, '0'), cell.x + cell.w / 2, cell.y + cell.h / 2);
  }
  function paintCell(ctx, cell, photo, grade) {
    ctx.save(); ctx.beginPath(); ctx.rect(cell.x, cell.y, cell.w, cell.h); ctx.clip();
    if (!photo || !photo.image) blank(ctx, cell);
    else {
      const image = photo.image;
      const scale = Math.max(cell.w / image.naturalWidth, cell.h / image.naturalHeight) * (photo.zoom || 1);
      const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
      const cx = cell.x + cell.w / 2 + (photo.panX || 0) * cell.w, cy = cell.y + cell.h / 2 + (photo.panY || 0) * cell.h;
      ctx.filter = grade.filter; ctx.drawImage(image, cx - dw / 2, cy - dh / 2, dw, dh); ctx.filter = 'none';
    }
    const tint = ctx.createLinearGradient(0, cell.y, 0, cell.y + cell.h);
    tint.addColorStop(0, grade.top); tint.addColorStop(.48, 'rgba(8,8,18,0)'); tint.addColorStop(1, grade.bottom);
    ctx.fillStyle = tint; ctx.fillRect(cell.x, cell.y, cell.w, cell.h); ctx.restore();
  }
  function paintTitle(ctx, width, height, caption, ink, grade) {
    const title = boundedCaption(caption).toLocaleUpperCase(); if (!title) return;
    const margin = width * .055, room = width - margin * 2;
    let size = Math.min(height * .115, width * .12);
    ctx.save(); ctx.font = `400 ${size}px Anton, Impact, sans-serif`;
    while (ctx.measureText(title).width > room && size > 22) { size -= Math.max(1, size * .035); ctx.font = `400 ${size}px Anton, Impact, sans-serif`; }
    const base = height * .885, shade = ctx.createLinearGradient(0, base - size * 1.45, 0, height);
    shade.addColorStop(0, 'rgba(12,10,19,0)'); shade.addColorStop(1, `rgba(12,10,19,${grade.darkness + .4})`);
    ctx.fillStyle = shade; ctx.fillRect(0, base - size * 1.45, width, height - base + size * 1.45);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(15,8,18,.72)'; ctx.shadowBlur = size * .16; ctx.shadowOffsetY = size * .075;
    ctx.strokeStyle = '#281b20'; ctx.lineWidth = Math.max(3, size * .075); ctx.strokeText(title, width / 2, base, room);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillStyle = ink || '#fff4dc'; ctx.fillText(title, width / 2, base, room); ctx.restore();
  }
  function render(canvas, photos, settings) {
    const format = formats[settings.format] ? settings.format : 'square', [width, height] = formats[format];
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const ctx = canvas.getContext('2d'), grade = grades[settings.grade] || grades.vice;
    ctx.fillStyle = '#16151d'; ctx.fillRect(0, 0, width, height);
    const frames = cells(width, height);
    frames.forEach((cell, index) => paintCell(ctx, cell, photos[index], grade));
    if (settings.selected >= 0 && settings.outline && frames[settings.selected]) {
      const cell = frames[settings.selected]; ctx.save(); ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = Math.max(2, width / 540);
      ctx.strokeRect(cell.x + 1, cell.y + 1, cell.w - 2, cell.h - 2); ctx.restore();
    }
    paintTitle(ctx, width, height, settings.caption, settings.ink, grade); canvas.dataset.coverRendered = 'true';
  }
  function exportPng(canvas, photos, settings, done) {
    if (canvas.dataset.coverRendered !== 'true') render(canvas, photos, settings);
    canvas.toBlob(done, 'image/png');
  }
  function frameAt(canvas, clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const x = (clientX - box.left) * canvas.width / box.width, y = (clientY - box.top) * canvas.height / box.height;
    return cells(canvas.width, canvas.height).findIndex((cell) => x >= cell.x && x <= cell.x + cell.w && y >= cell.y && y <= cell.y + cell.h);
  }
  window.CoverArt = { render, exportPng, frameAt, layouts: Object.fromEntries(Object.entries(formats).map(([name, size]) => [name, { w: size[0], h: size[1] }])) };
})();
