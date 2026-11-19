/* Original six-panel cover renderer. All photo decoding and drawing stays in this browser. */
(function () {
  'use strict';
  const PANEL_LAYOUTS = {
    square: [
      [.035,.035,.30,.39], [.345,.035,.30,.245], [.655,.035,.31,.245],
      [.345,.29,.30,.31], [.655,.29,.31,.31], [.035,.435,.30,.53],
      [.345,.61,.30,.355], [.655,.61,.31,.355]
    ],
    portrait: [
      [.035,.025,.30,.30], [.345,.025,.30,.20], [.655,.025,.31,.20],
      [.345,.235,.30,.265], [.655,.235,.31,.265], [.035,.335,.30,.40],
      [.345,.51,.30,.465], [.655,.51,.31,.465]
    ],
    landscape: [
      [.025,.035,.29,.42], [.325,.035,.31,.265], [.645,.035,.33,.265],
      [.325,.315,.31,.37], [.645,.315,.33,.37], [.025,.465,.29,.50],
      [.325,.695,.31,.27], [.645,.695,.33,.27]
    ]
  };
  const GRADES = {
    vice: { filter:'saturate(1.18) contrast(1.06)', top:'#ffbb7550', bottom:'#f341764c', accent:'#ff714f' },
    neon: { filter:'saturate(1.32) contrast(1.12) hue-rotate(10deg)', top:'#22d8e456', bottom:'#6626ca62', accent:'#53f2db' },
    clean:{ filter:'saturate(.91) contrast(1.02)', top:'#ffe8b020', bottom:'#332c361f', accent:'#f0c76d' }
  };
  function panelRects(width,height,layout) {
    return (PANEL_LAYOUTS[layout] || PANEL_LAYOUTS.square).map((r,i)=>({id:i,x:r[0]*width,y:r[1]*height,w:r[2]*width,h:r[3]*height}));
  }
  function drawPhoto(ctx, photo, rect, crop, grade) {
    if (!photo) {
      ctx.fillStyle='#242632'; ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
      ctx.strokeStyle='#454754';ctx.lineWidth=2;ctx.strokeRect(rect.x+5,rect.y+5,rect.w-10,rect.h-10);
      ctx.fillStyle='#aaa8b0';ctx.font='700 18px system-ui';ctx.textAlign='center';ctx.fillText('ADD PHOTO',rect.x+rect.w/2,rect.y+rect.h/2);
      return;
    }
    const image=photo.image!==undefined?photo.image:photo;
    const iw=image.naturalWidth||image.width, ih=image.naturalHeight||image.height;
    const scale=Math.max(rect.w/iw,rect.h/ih)*(crop.zoom||1), dw=iw*scale, dh=ih*scale;
    const cx=rect.x+rect.w/2+(crop.x||0)*rect.w, cy=rect.y+rect.h/2+(crop.y||0)*rect.h;
    ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.w,rect.h);ctx.clip();ctx.filter=grade.filter;
    ctx.drawImage(image,cx-dw/2,cy-dh/2,dw,dh);ctx.filter='none';
    const tint=ctx.createLinearGradient(0,rect.y,0,rect.y+rect.h);tint.addColorStop(0,grade.top);tint.addColorStop(.48,'#f15e7a12');tint.addColorStop(1,grade.bottom);ctx.fillStyle=tint;ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
    ctx.restore();
  }
  function drawCaption(ctx,caption,w,h,color) {
    const words=(caption||'').trim().toUpperCase(); if(!words)return;
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    let size=Math.min(h*.19,w*.14);ctx.font=`${size}px Anton, Impact, sans-serif`;
    while(ctx.measureText(words).width>w*.84&&size>18){size-=2;ctx.font=`${size}px Anton, Impact, sans-serif`;}
    const y=h*.77;ctx.shadowColor='#130d1bdd';ctx.shadowBlur=size*.22;ctx.shadowOffsetY=size*.065;
    ctx.lineWidth=Math.max(3,size*.045);ctx.strokeStyle='#19121be8';ctx.strokeText(words,w/2,y,w*.88);
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    const grad=ctx.createLinearGradient(0,y-size/2,0,y+size/2);grad.addColorStop(0,'#fff9e8');grad.addColorStop(.46,color);grad.addColorStop(1,color);
    ctx.fillStyle=grad;ctx.fillText(words,w/2,y,w*.88);
    ctx.font='700 '+Math.max(10,size*.105)+'px system-ui';ctx.letterSpacing='0.34em';ctx.fillStyle='#fff4dbd9';ctx.fillText('A NIGHT IN THE CITY',w/2,h*.875,w*.8);
    ctx.restore();
  }
  function drawCover(canvas,state) {
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,grade=GRADES[state.grade]||GRADES.vice,panels=panelRects(w,h,state.layout);
    ctx.fillStyle='#171722';ctx.fillRect(0,0,w,h);
    const gap=Math.max(5,Math.round(w*.009));
    panels.forEach((r,i)=>{const photo=state.panels[i]&&state.photos[state.panels[i].photo];drawPhoto(ctx,photo,{x:r.x+gap/2,y:r.y+gap/2,w:r.w-gap,h:r.h-gap},state.panels[i]||{zoom:1},grade);});
    // Deliberate irregular hairline dividers and a restrained frame unify the photo mosaic.
    ctx.strokeStyle='#17151bf0';ctx.lineWidth=gap;panels.forEach(r=>ctx.strokeRect(r.x,r.y,r.w,r.h));
    const edge=ctx.createLinearGradient(0,0,0,h);edge.addColorStop(0,'#11131a22');edge.addColorStop(.58,'#11131a08');edge.addColorStop(1,'#14101cbb');ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#f9d5a65c';ctx.lineWidth=Math.max(2,w*.002);ctx.strokeRect(w*.018,h*.018,w*.964,h*.964);
    // Small original edition mark in the upper-left panel.
    ctx.save();ctx.fillStyle='#16141bcc';ctx.fillRect(w*.056,h*.065,w*.19,h*.06);ctx.fillStyle='#f8ecda';ctx.font=`${Math.max(12,w*.018)}px Anton, sans-serif`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('FRAME / CITY',w*.07,h*.095);ctx.restore();
    drawCaption(ctx,state.caption,w,h,state.captionColor);
  }
  window.CoverArt={PANEL_LAYOUTS,GRADES,panelRects,drawCover};
})();
