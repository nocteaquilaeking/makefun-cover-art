/* Canvas renderer for the original Afterglow panel cover. */
(function () {
  'use strict';
  const COLS = 3, ROWS = 3, GUTTER = 9;
  const layouts = {
    square: { w: 1080, h: 1080 },
    portrait: { w: 1080, h: 1350 },
    landscape: { w: 1920, h: 1080 }
  };
  const grades = {
    vice: { filter: 'saturate(1.13) contrast(1.06) sepia(.13)', top: 'rgba(255,184,82,.13)', bottom: 'rgba(191,38,99,.28)', shade: .14 },
    neon: { filter: 'saturate(1.5) contrast(1.14) hue-rotate(-8deg)', top: 'rgba(0,225,233,.19)', bottom: 'rgba(151,22,205,.37)', shade: .2 },
    clean: { filter: 'saturate(.92) contrast(1.02) brightness(1.03)', top: 'rgba(255,249,225,.04)', bottom: 'rgba(27,28,42,.13)', shade: .12 }
  };
  function rectangles(width, height) {
    const gap = GUTTER * Math.min(width / 1080, height / 1080);
    const cw = (width - gap * (COLS + 1)) / COLS;
    const ch = (height - gap * (ROWS + 1)) / ROWS;
    return Array.from({ length: 9 }, (_, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      return { x: gap + col * (cw + gap), y: gap + row * (ch + gap), w: cw, h: ch };
    });
  }
  function drawImageCover(ctx, frame, item, grade) {
    ctx.save();
    ctx.beginPath(); ctx.rect(frame.x, frame.y, frame.w, frame.h); ctx.clip();
    if (!item || !item.image) {
      const gradient = ctx.createLinearGradient(frame.x, frame.y, frame.x + frame.w, frame.y + frame.h);
      gradient.addColorStop(0, '#34303a'); gradient.addColorStop(1, '#24242c');
      ctx.fillStyle = gradient; ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
      ctx.fillStyle = 'rgba(245,226,206,.12)';
      ctx.font = `700 ${Math.min(frame.w, frame.h) * .11}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(frame.index + 1).padStart(2, '0'), frame.x + frame.w / 2, frame.y + frame.h / 2);
    } else {
      const img = item.image;
      const base = Math.max(frame.w / img.naturalWidth, frame.h / img.naturalHeight);
      const scale = base * (item.zoom || 1);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      const cx = frame.x + frame.w / 2 + (item.panX || 0) * frame.w;
      const cy = frame.y + frame.h / 2 + (item.panY || 0) * frame.h;
      ctx.filter = grade.filter;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.filter = 'none';
    }
    const shade = ctx.createLinearGradient(0, frame.y, 0, frame.y + frame.h);
    shade.addColorStop(0, grade.top); shade.addColorStop(.48, 'rgba(8,8,18,0)'); shade.addColorStop(1, grade.bottom);
    ctx.fillStyle = shade; ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
    ctx.restore();
  }
  function drawTitle(ctx, width, height, caption, ink, grade) {
    if (!caption || !caption.trim()) return;
    const text = caption.trim().toLocaleUpperCase();
    const pad = width * .055, maxWidth = width - pad * 2;
    let size = Math.min(height * .115, width * .12);
    ctx.save();
    ctx.font = `400 ${size}px Anton, Impact, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && size > 22) {
      size -= Math.max(1, size * .035);
      ctx.font = `400 ${size}px Anton, Impact, sans-serif`;
    }
    const baseline = height * .885;
    const band = ctx.createLinearGradient(0, baseline - size * 1.45, 0, height);
    band.addColorStop(0, 'rgba(12,10,19,0)'); band.addColorStop(1, `rgba(12,10,19,${grade.shade + .4})`);
    ctx.fillStyle = band; ctx.fillRect(0, baseline - size * 1.45, width, height - baseline + size * 1.45);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(15,8,18,.72)'; ctx.shadowBlur = size * .16; ctx.shadowOffsetY = size * .075;
    ctx.strokeStyle = '#281b20'; ctx.lineWidth = Math.max(3, size * .075); ctx.strokeText(text, width / 2, baseline, maxWidth);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = ink || '#fff4dc'; ctx.fillText(text, width / 2, baseline, maxWidth);
    ctx.restore();
  }
  function render(canvas, state, options) {
    const format = layouts[options.format] ? options.format : 'square';
    const size = layouts[format];
    if (canvas.width !== size.w || canvas.height !== size.h) { canvas.width = size.w; canvas.height = size.h; }
    const ctx = canvas.getContext('2d');
    const grade = grades[options.grade] || grades.vice;
    ctx.fillStyle = '#16151d'; ctx.fillRect(0, 0, size.w, size.h);
    const frames = rectangles(size.w, size.h);
    frames.forEach((rect, index) => drawImageCover(ctx, Object.assign({ index }, rect), state[index], grade));
    if (options.selected >= 0 && options.outline) {
      const r = frames[options.selected];
      ctx.save(); ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = Math.max(2, size.w / 540);
      ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2); ctx.restore();
    }
    drawTitle(ctx, size.w, size.h, options.caption, options.ink, grade);
  }
  function frameAt(canvas, x, y) {
    const rect = canvas.getBoundingClientRect();
    const px = (x - rect.left) * canvas.width / rect.width;
    const py = (y - rect.top) * canvas.height / rect.height;
    return rectangles(canvas.width, canvas.height).findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
  }
  window.CoverArt = { render, frameAt, layouts };
}());
