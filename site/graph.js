// A projected 3D layered computation graph. Geometry is mathematical, not an image asset.
export function startGraph(canvas) {
  const ctx=canvas.getContext('2d');if(!ctx)return()=>{};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=motion.matches, frame, t=0, pointerX=0, pointerY=0, visible=true;
  const button=document.querySelector('#motion-toggle');
  function label(){button.textContent=paused?'Play ▷':'Pause Ⅱ';button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.setAttribute('aria-pressed',String(paused));}
  const nodes=[];for(let layer=0;layer<4;layer++)for(let row=0;row<4;row++)for(let col=0;col<4;col++)nodes.push({x:(col-1.5)*44,y:(layer-1.5)*57,z:(row-1.5)*44,layer,row,col});
  function draw(){
    const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);
    const dark=document.documentElement.dataset.theme==='dark';const angle=.52+Math.sin(t*.22)*.14+pointerX*.12;const tilt=.48+pointerY*.09;const scale=Math.min(rect.width/350,rect.height/330)*.94;
    const points=nodes.map(n=>{const x=n.x*Math.cos(angle)+n.z*Math.sin(angle);const z=-n.x*Math.sin(angle)+n.z*Math.cos(angle);const y=n.y*Math.cos(tilt)-z*Math.sin(tilt);const depth=n.y*Math.sin(tilt)+z*Math.cos(tilt);const perspective=600/(600+depth);return{...n,x:rect.width/2+x*scale*perspective,y:rect.height/2+y*scale*perspective-15,depth};});
    for(let i=0;i<points.length;i++){const a=points[i];for(let j=i+1;j<points.length;j++){const b=points[j];if(Math.abs(a.layer-b.layer)+Math.abs(a.row-b.row)+Math.abs(a.col-b.col)!==1)continue;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=dark?'rgba(129,166,230,.25)':'rgba(60,96,162,.23)';ctx.lineWidth=.8;ctx.stroke();if(a.layer!==b.layer&&a.col===1&&a.row===1){const f=(t*.4+a.layer*.22)%1;ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,3,0,Math.PI*2);ctx.fillStyle=dark?'#b8d7ff':'#275adb';ctx.fill();}}}
    points.sort((a,b)=>b.depth-a.depth).forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.layer===1?3.5:2.6,0,Math.PI*2);ctx.fillStyle=dark?['#7395c5','#b5d2ff','#729ff1','#688bba'][p.layer]:['#92aac8','#315dbb','#587ebe','#91a9c5'][p.layer];ctx.fill();});
    // Dotted reference plane beneath the graph.
    ctx.fillStyle=dark?'#55637566':'#92a1b455';for(let i=0;i<15;i++)for(let j=0;j<5;j++){ctx.beginPath();ctx.arc(rect.width/2+(i-7)*17+(j-2)*11,rect.height-57+(j-2)*6, .7,0,Math.PI*2);ctx.fill();}
  }
  let last=0;function loop(now){if(!paused&&visible&&!document.hidden){t+=Math.min((now-last)/1000,.04);}last=now;draw();frame=requestAnimationFrame(loop);} // Keep theme and resize changes visible while paused.
  const pointer=e=>{if(motion.matches)return;const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;};const leave=()=>{pointerX=0;pointerY=0;};const toggle=()=>{paused=!paused;label();};const reduce=()=>{paused=motion.matches;label();};
  canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerleave',leave);button.addEventListener('click',toggle);motion.addEventListener('change',reduce);const observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observer.observe(canvas);label();frame=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointermove',pointer);canvas.removeEventListener('pointerleave',leave);button.removeEventListener('click',toggle);motion.removeEventListener('change',reduce);};
}
