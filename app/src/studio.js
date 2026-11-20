(function(){
  const palette=window.CoverPalette,photos={};
  const state={selected:0,frames:Array(9).fill(null),grade:'vice',ink:palette.inks[0].hex,zoom:1,caption:'MIDNIGHT IN PARADISE',onFrame:true};
  let activeImage=null;
  const $=selector=>document.querySelector(selector), framePicker=$('.frame-picker'), gradePicker=$('.grade-options'), swatches=$('.ink-swatches');
  function announce(message){$('#status-line').textContent=message;}
  function paint(){window.CoverRender.render(state);}
  function addImage(name,src){const image=new Image();image.onload=()=>{photos[name]=image;activeImage=image;state.frames=state.frames.map(item=>item||image);paint();};image.src=src;}
  function selectFrame(index){state.selected=index;document.querySelectorAll('.frame-button').forEach((button,i)=>button.classList.toggle('selected',i===index));paint();}
  for(let i=0;i<9;i++){const button=document.createElement('button');button.className='frame-button';button.type='button';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label',`Select frame ${i+1}`);button.addEventListener('click',()=>selectFrame(i));framePicker.append(button);}
  palette.inks.forEach(ink=>{const button=document.createElement('button');button.type='button';button.className='swatch';button.title=ink.name;button.setAttribute('aria-label',ink.name);button.style.background=ink.hex;button.addEventListener('click',()=>{state.ink=ink.hex;swatches.querySelectorAll('.swatch').forEach(el=>el.classList.toggle('selected',el===button));paint();});swatches.append(button);});
  palette.grades.forEach(grade=>{const button=document.createElement('button');button.type='button';button.className='grade-button';button.innerHTML=`<span>${grade.name}</span><small>${grade.note}</small>`;button.addEventListener('click',()=>{state.grade=grade.id;gradePicker.querySelectorAll('button').forEach(el=>el.classList.toggle('selected',el===button));paint();announce(`${grade.name} colour story applied.`);});gradePicker.append(button);});
  document.querySelectorAll('.photo-card').forEach(button=>button.addEventListener('click',()=>{const image=photos[button.dataset.photo];if(!image)return;activeImage=image;state.frames[state.selected]=image;document.querySelectorAll('.photo-card').forEach(el=>el.classList.toggle('active',el===button));paint();announce(`${button.querySelector('b').textContent} placed in frame ${String(state.selected+1).padStart(2,'0')}.`);}));
  $('#fill-all').addEventListener('click',()=>{if(!activeImage)return;state.frames=Array(9).fill(activeImage);paint();announce('All nine frames filled with the selected photograph.');});
  $('#zoom-range').addEventListener('input',event=>{state.zoom=Number(event.target.value);$('#zoom-output').value=`${state.zoom.toFixed(1)}×`;paint();});
  $('#caption-input').addEventListener('input',event=>{state.caption=event.target.value;paint();});
  $('#photo-upload').addEventListener('change',event=>{const file=event.target.files[0];if(!file)return;const image=new Image();image.onload=()=>{activeImage=image;state.frames[state.selected]=image;paint();announce(`${file.name} loaded into frame ${String(state.selected+1).padStart(2,'0')}.`);};image.src=URL.createObjectURL(file);});
  $('#export-button').addEventListener('click',async()=>{const blob=await window.CoverRender.exportPng();if(!blob){announce('PNG export could not be created.');return;}const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='afterglow-cover.png';link.click();URL.revokeObjectURL(link.href);announce('Your square PNG has been exported.');});
  addImage('pier','samples/pier.jpg');addImage('boulevard','samples/boulevard.jpg');
  window.CoverStudio={applyShot(def){if(!def)return;if(def.photo&&photos[def.photo]){activeImage=photos[def.photo];state.frames=Array(9).fill(activeImage);document.querySelectorAll('.photo-card').forEach(el=>el.classList.toggle('active',el.dataset.photo===def.photo));}if(typeof def.caption==='string'){state.caption=def.caption;$('#caption-input').value=def.caption;}if(def.scene==='cover')document.body.classList.add('shot-cover');paint();},getState(){return state;}};
  const params=new URLSearchParams(location.search);if(params.has('shot')){const apply=()=>{if(params.get('photo')==='pier'&&!photos.pier||params.get('photo')==='boulevard'&&!photos.boulevard){requestAnimationFrame(apply);return;}window.CoverShots.run({scene:params.get('shot'),photo:params.get('photo'),caption:params.get('caption')});};requestAnimationFrame(apply);}
  window.addEventListener('load',()=>{document.fonts&&document.fonts.ready.then(paint);});
  paint();
})();
