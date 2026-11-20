(function(){
  const canvas=document.getElementById('cover-canvas');
  const ctx=canvas.getContext('2d');
  const size=1080,gap=8,cell=(size-gap*2)/3;
  const CAPTION_LIMIT=40;
  function drawImageCover(image,x,y,w,h,zoom){
    const scale=Math.max(w/image.width,h/image.height)*zoom,sw=w/scale,sh=h/scale;
    ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,w,h);
  }
  function render(state){
    ctx.clearRect(0,0,size,size);ctx.fillStyle='#161719';ctx.fillRect(0,0,size,size);
    state.frames.forEach((image,index)=>{const col=index%3,row=Math.floor(index/3),x=col*(cell+gap),y=row*(cell+gap);ctx.fillStyle='#262829';ctx.fillRect(x,y,cell,cell);if(image&&image.complete&&image.naturalWidth)drawImageCover(image,x,y,cell,cell,index===state.selected?state.zoom:1);});
    const grade=window.CoverPalette.grades.find(item=>item.id===state.grade)||window.CoverPalette.grades[0];
    const caption=(state.caption||'').trim().toUpperCase();
    const title=Array.from(caption).length>CAPTION_LIMIT?Array.from(caption).slice(0,CAPTION_LIMIT).join('')+'…':caption;
    if(title){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='150px Anton, Impact, sans-serif';let font=150;while(ctx.measureText(title).width>1020&&font>48){font-=3;ctx.font=`${font}px Anton, Impact, sans-serif`;}ctx.lineJoin='round';ctx.strokeStyle='rgba(12,12,14,.78)';ctx.lineWidth=14;ctx.strokeText(title,540,920,1020);ctx.fillStyle=state.ink;ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;ctx.fillText(title,540,920,1020);ctx.restore();}
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.fillStyle=grade.overlay;ctx.fillRect(0,0,size,size);ctx.globalCompositeOperation='screen';ctx.fillStyle=grade.screen;ctx.fillRect(0,0,size,size);ctx.restore();
    if(state.onFrame&&!document.body.classList.contains('shot-cover')){ctx.save();ctx.strokeStyle='#c9f27a';ctx.lineWidth=5;const col=state.selected%3,row=Math.floor(state.selected/3);ctx.strokeRect(col*(cell+gap)+3,row*(cell+gap)+3,cell-6,cell-6);ctx.restore();}
  }
  function exportPng(){return new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}
  window.CoverRender={render,exportPng,canvas};
})();
