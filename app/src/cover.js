/* Paint the nine-frame cover and provide canvas helpers to the editor. */
(() => {
  'use strict';

  const sizes = {
    square: [1080, 1080],
    portrait: [1080, 1350],
    landscape: [1920, 1080]
  };
  const colorGrades = {
    vice: { filter: 'saturate(1.13) contrast(1.06) sepia(.13)', top: 'rgba(255,184,82,.13)', bottom: 'rgba(191,38,99,.28)', darkness: .14 },
    neon: { filter: 'saturate(1.5) contrast(1.14) hue-rotate(-8deg)', top: 'rgba(0,225,233,.19)', bottom: 'rgba(151,22,205,.37)', darkness: .2 },
    clean: { filter: 'saturate(.92) contrast(1.02) brightness(1.03)', top: 'rgba(255,249,225,.04)', bottom: 'rgba(27,28,42,.13)', darkness: .12 }
  };

  function makeCells(width, height) {
    const gutter = 9 * Math.min(width / 1080, height / 1080);
    const cellWidth = (width - gutter * 4) / 3;
    const cellHeight = (height - gutter * 4) / 3;
    return Array.from({ length: 9 }, (_, index) => ({
      index,
      x: gutter + (index % 3) * (cellWidth + gutter),
      y: gutter + Math.floor(index / 3) * (cellHeight + gutter),
      width: cellWidth,
      height: cellHeight
    }));
  }

  function paintPlaceholder(context, cell) {
    const fill = context.createLinearGradient(cell.x, cell.y, cell.x + cell.width, cell.y + cell.height);
    fill.addColorStop(0, '#34303a');
    fill.addColorStop(1, '#24242c');
    context.fillStyle = fill;
    context.fillRect(cell.x, cell.y, cell.width, cell.height);
    context.fillStyle = 'rgba(245,226,206,.12)';
    context.font = `700 ${Math.min(cell.width, cell.height) * .11}px system-ui`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(cell.index + 1).padStart(2, '0'), cell.x + cell.width / 2, cell.y + cell.height / 2);
  }

  function paintCell(context, cell, photo, grade) {
    context.save();
    context.beginPath();
    context.rect(cell.x, cell.y, cell.width, cell.height);
    context.clip();

    if (!photo || !photo.image) {
      paintPlaceholder(context, cell);
    } else {
      const image = photo.image;
      const scale = Math.max(cell.width / image.naturalWidth, cell.height / image.naturalHeight) * (photo.zoom || 1);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const centerX = cell.x + cell.width / 2 + (photo.panX || 0) * cell.width;
      const centerY = cell.y + cell.height / 2 + (photo.panY || 0) * cell.height;
      context.filter = grade.filter;
      context.drawImage(image, centerX - width / 2, centerY - height / 2, width, height);
      context.filter = 'none';
    }

    const overlay = context.createLinearGradient(0, cell.y, 0, cell.y + cell.height);
    overlay.addColorStop(0, grade.top);
    overlay.addColorStop(.48, 'rgba(8,8,18,0)');
    overlay.addColorStop(1, grade.bottom);
    context.fillStyle = overlay;
    context.fillRect(cell.x, cell.y, cell.width, cell.height);
    context.restore();
  }

  function paintCaption(context, width, height, caption, ink, grade) {
    if (!caption || !caption.trim()) return;
    const title = caption.trim().toLocaleUpperCase();
    const margin = width * .055;
    const availableWidth = width - margin * 2;
    let fontSize = Math.min(height * .115, width * .12);
    context.save();
    context.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
    while (context.measureText(title).width > availableWidth && fontSize > 22) {
      fontSize -= Math.max(1, fontSize * .035);
      context.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
    }

    const baseline = height * .885;
    const shade = context.createLinearGradient(0, baseline - fontSize * 1.45, 0, height);
    shade.addColorStop(0, 'rgba(12,10,19,0)');
    shade.addColorStop(1, `rgba(12,10,19,${grade.darkness + .4})`);
    context.fillStyle = shade;
    context.fillRect(0, baseline - fontSize * 1.45, width, height - baseline + fontSize * 1.45);
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.lineJoin = 'round';
    context.shadowColor = 'rgba(15,8,18,.72)';
    context.shadowBlur = fontSize * .16;
    context.shadowOffsetY = fontSize * .075;
    context.strokeStyle = '#281b20';
    context.lineWidth = Math.max(3, fontSize * .075);
    context.strokeText(title, width / 2, baseline, availableWidth);
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.fillStyle = ink || '#fff4dc';
    context.fillText(title, width / 2, baseline, availableWidth);
    context.restore();
  }

  function render(canvas, photos, settings) {
    const format = sizes[settings.format] ? settings.format : 'square';
    const [width, height] = sizes[format];
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d');
    const grade = colorGrades[settings.grade] || colorGrades.vice;
    context.fillStyle = '#16151d';
    context.fillRect(0, 0, width, height);
    const cells = makeCells(width, height);
    cells.forEach((cell, index) => paintCell(context, cell, photos[index], grade));

    if (settings.selected >= 0 && settings.outline) {
      const selected = cells[settings.selected];
      if (selected) {
        context.save();
        context.strokeStyle = '#fff3d8';
        context.lineWidth = Math.max(2, width / 540);
        context.strokeRect(selected.x + 1, selected.y + 1, selected.width - 2, selected.height - 2);
        context.restore();
      }
    }
    paintCaption(context, width, height, settings.caption, settings.ink, grade);
    canvas.dataset.coverRendered = 'true';
  }

  function exportPng(canvas, photos, settings, callback) {
    if (canvas.dataset.coverRendered !== 'true') render(canvas, photos, settings);
    canvas.toBlob(callback, 'image/png');
  }

  function frameAt(canvas, clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    const x = (clientX - bounds.left) * canvas.width / bounds.width;
    const y = (clientY - bounds.top) * canvas.height / bounds.height;
    return makeCells(canvas.width, canvas.height).findIndex((cell) =>
      x >= cell.x && x <= cell.x + cell.width && y >= cell.y && y <= cell.y + cell.height);
  }

  window.CoverArt = {
    render,
    exportPng,
    frameAt,
    layouts: Object.fromEntries(Object.entries(sizes).map(([name, size]) => [name, { w: size[0], h: size[1] }]))
  };
})();
