/* The cover is a six-frame city montage. Each frame keeps its own photo and crop. */
(function () {
  const PANELS = [
    { x: 0.035, y: 0.035, w: 0.455, h: 0.305, id: 0 },
    { x: 0.510, y: 0.035, w: 0.455, h: 0.305, id: 1 },
    { x: 0.035, y: 0.360, w: 0.285, h: 0.390, id: 2 },
    { x: 0.340, y: 0.360, w: 0.300, h: 0.390, id: 3 },
    { x: 0.660, y: 0.360, w: 0.305, h: 0.390, id: 4 },
    { x: 0.035, y: 0.770, w: 0.930, h: 0.195, id: 5 }
  ];
  const LOOKS = {
    vice: { filter: 'saturate(1.13) contrast(1.05)', wash: 'rgba(247,101,125,.20)', gradient: ['rgba(253,196,124,0)', 'rgba(205,65,130,.43)'], accent: '#ffc178' },
    neon: { filter: 'saturate(1.35) contrast(1.15) hue-rotate(13deg)', wash: 'rgba(25,33,118,.30)', gradient: ['rgba(20,221,223,0)', 'rgba(29,34,112,.66)'], accent: '#55e8df' },
    clean: { filter: 'saturate(.82) contrast(1.04)', wash: 'rgba(230,213,174,.09)', gradient: ['rgba(18,31,49,0)', 'rgba(14,22,39,.56)'], accent: '#f3dfb5' }
  };
  function cropRect(photo, panel, canvas, state) {
    const w = panel.w * canvas.width, h = panel.h * canvas.height;
    const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const scale = base * state.zoom;
    const dw = photo.naturalWidth * scale, dh = photo.naturalHeight * scale;
    const cx = w / 2 + state.x * w, cy = h / 2 + state.y * h;
    return { x: panel.x * canvas.width + cx - dw / 2, y: panel.y * canvas.height + cy - dh / 2, w: dw, h: dh };
  }
  function drawPanel(ctx, canvas, panel, state, look) {
    const x = panel.x * canvas.width, y = panel.y * canvas.height, w = panel.w * canvas.width, h = panel.h * canvas.height;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (state.photo) { ctx.filter = look.filter; const r = cropRect(state.photo, panel, canvas, state); ctx.drawImage(state.photo, r.x, r.y, r.w, r.h); ctx.filter = 'none'; }
    else { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#303549'); g.addColorStop(.55, '#9c526f'); g.addColorStop(1, '#e08e76'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
    ctx.fillStyle = look.wash; ctx.fillRect(x, y, w, h);
    const shade = ctx.createLinearGradient(0, y + h * .42, 0, y + h); shade.addColorStop(0, look.gradient[0]); shade.addColorStop(1, look.gradient[1]); ctx.fillStyle = shade; ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,240,220,.20)'; ctx.lineWidth = Math.max(1, canvas.width * .0012); ctx.strokeRect(x, y, w, h);
  }
  function drawHeadline(ctx, canvas, caption, color, look) {
    const w = canvas.width, h = canvas.height, text = (caption || '').trim().toUpperCase();
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(h * .105)}px Anton, Impact, sans-serif`;
    let size = h * .105;
    while (ctx.measureText(text).width > w * .85 && size > 24) { size -= 2; ctx.font = `${Math.round(size)}px Anton, Impact, sans-serif`; }
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size * .065); ctx.strokeStyle = 'rgba(25,17,34,.92)'; ctx.shadowColor = 'rgba(8,9,18,.55)'; ctx.shadowBlur = size * .17; ctx.shadowOffsetY = size * .055;
    ctx.strokeText(text, w * .5, h * .862); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillStyle = color || '#fff1d6'; ctx.fillText(text, w * .5, h * .862);
    ctx.font = `700 ${Math.round(h * .013)}px ui-sans-serif, sans-serif`; ctx.letterSpacing = `${h * .004}px`; ctx.fillStyle = look.accent; ctx.fillText('A CITY NEVER TELLS THE WHOLE STORY', w * .5, h * .934); ctx.restore();
  }
  function drawCover(canvas, panels, caption, color, lookName, selected, options) {
    const ctx = canvas.getContext('2d'), look = LOOKS[lookName] || LOOKS.vice, opts = options || {};
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#11111b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8eee0'; ctx.fillRect(canvas.width * .018, canvas.height * .018, canvas.width * .964, canvas.height * .964);
    PANELS.forEach((p) => drawPanel(ctx, canvas, p, panels[p.id], look));
    drawHeadline(ctx, canvas, caption, color, look);
    if (opts.selection) { const p = PANELS[selected], x = p.x * canvas.width, y = p.y * canvas.height, w = p.w * canvas.width, h = p.h * canvas.height; ctx.save(); ctx.strokeStyle = '#5ce3da'; ctx.lineWidth = Math.max(3, canvas.width * .004); ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.restore(); }
  }
  window.CoverArt = { panels: PANELS, looks: LOOKS, drawCover, cropRect };
})();
