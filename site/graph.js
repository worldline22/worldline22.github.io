// A 3D neural-network schematic with forward-propagating data and neuron activations.
export function startGraph(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('#motion-toggle');
  const hero = canvas.closest('.hero');
  let paused = motion.matches, frame = 0, visible = true, time = 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, last = 0;
  let width = 0, height = 0, dirty = true;
  // Neurons occupy five separate planes in 3D. Connections only join adjacent layers.
  const sizes = [4, 6, 8, 6, 3];
  const names = ['INPUT', 'HIDDEN 01', 'HIDDEN 02', 'HIDDEN 03', 'OUTPUT'];
  const layers = sizes.map((count,layer)=>Array.from({length:count},(_,i)=>({
    x:(layer-2)*1.12, y:(i-(count-1)/2)*.35,
    z:i%2===0?-.3:.3, layer, index:i
  })));
  const edges=[];
  for(let layer=0;layer<layers.length-1;layer++){
    for(const from of layers[layer])for(const to of layers[layer+1]){
      edges.push({from,to,layer,signal:(from.index+to.index)%3===0});
    }
  }
  function label() {
    button.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.setAttribute('aria-pressed',String(paused));
  }
  function draw() {
    const dark=document.documentElement.dataset.theme==='dark';
    const small=width<720;
    const cx=width*(small?.5:.715)+smoothX*9;
    const cy=height*(small?.46:.45)+smoothY*7;
    const scale=Math.min(width*(small?.16:.091),height*.16);
    // Small camera movement preserves the readable input-to-output direction.
    const yaw=-.28+Math.sin(time*.13)*.065+smoothX*.13;
    const tilt=.13+Math.cos(time*.16)*.025+smoothY*.08;
    const colors=dark?['99,207,220','106,183,237','144,160,241','134,198,225','113,229,203']:['14,126,146','28,106,165','82,97,175','28,119,155','14,137,110'];
    const cycle=(time*.56)%5;
    const project=p=>{
      const x=p.x*Math.cos(yaw)+p.z*Math.sin(yaw);
      const z=-p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
      const y=p.y*Math.cos(tilt)-z*Math.sin(tilt);
      const depth=p.y*Math.sin(tilt)+z*Math.cos(tilt);
      const perspective=7/(7+depth);
      return {x:cx+x*scale*perspective,y:cy+y*scale*perspective,z:depth,p:perspective};
    };
    ctx.clearRect(0,0,width,height);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*3.3);
    glow.addColorStop(0,dark?'rgba(35,148,181,.12)':'rgba(38,142,168,.06)');
    glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    // Faint layer planes make the depth visible without obscuring the neurons.
    layers.forEach((layer,index)=>{
      const x=layer[0].x, extent=(sizes[index]-1)*.175+.25;
      const corners=[{x,y:-extent,z:-.48},{x,y:-extent,z:.48},{x,y:extent,z:.48},{x,y:extent,z:-.48}].map(project);
      ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
      ctx.fillStyle=`rgba(${colors[index]},${dark?.025:.035})`;ctx.fill();
      ctx.strokeStyle=`rgba(${colors[index]},${dark?.14:.17})`;ctx.lineWidth=.65;ctx.stroke();
    });
    const projected=layers.map(layer=>layer.map(project));
    edges.forEach(edge=>{
      const from=projected[edge.layer][edge.from.index],to=projected[edge.layer+1][edge.to.index];
      ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);
      ctx.strokeStyle=`rgba(${colors[edge.layer]},${dark?.18:.19})`;ctx.lineWidth=.6;ctx.stroke();
      const progress=cycle-edge.layer;
      if(edge.signal&&progress>=0&&progress<1){
        const tail=Math.max(0,progress-.16);
        const sx=from.x+(to.x-from.x)*progress,sy=from.y+(to.y-from.y)*progress;
        ctx.beginPath();ctx.moveTo(from.x+(to.x-from.x)*tail,from.y+(to.y-from.y)*tail);ctx.lineTo(sx,sy);
        ctx.strokeStyle=`rgba(${colors[edge.layer]},.75)`;ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(sx,sy,small?1.7:2.2,0,Math.PI*2);
        ctx.fillStyle=dark?'#ddffff':'#087e98';ctx.shadowColor=`rgb(${colors[edge.layer]})`;ctx.shadowBlur=dark?10:0;ctx.fill();ctx.shadowBlur=0;
      }
    });
    projected.flatMap((layer,index)=>layer.map(p=>({...p,layer:index}))).sort((a,b)=>b.z-a.z).forEach(p=>{
      const distance=Math.abs(cycle-p.layer);
      const activation=Math.max(0,1-distance/.45);
      const radius=(small?3.5:4.8)*p.p;
      const halo=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*(3+activation));
      halo.addColorStop(0,`rgba(${colors[p.layer]},${.2+activation*.3})`);halo.addColorStop(1,'transparent');
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(p.x,p.y,radius*(3+activation),0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);
      ctx.fillStyle=dark?'#122d3c':'#e2f0f1';ctx.fill();
      ctx.strokeStyle=`rgba(${colors[p.layer]},${.7+activation*.3})`;ctx.lineWidth=1.1+activation;ctx.stroke();
      ctx.beginPath();ctx.arc(p.x,p.y,radius*.42,0,Math.PI*2);ctx.fillStyle=`rgba(${colors[p.layer]},${.75+activation*.25})`;ctx.fill();
    });
    // Clear stage labels describe the schematic rather than claiming a specific model.
    ctx.textAlign='center';ctx.font='12px "DM Sans", sans-serif';
    layers.forEach((layer,index)=>{
      if(small&&index>0&&index<4)return;
      const p=project({x:layer[0].x,y:1.72,z:0});
      ctx.fillStyle=dark?'#9dbfc9':'#446970';ctx.fillText(names[index],p.x,p.y);
    });
    const left=project({x:-2.24,y:2.04,z:0}),right=project({x:2.24,y:2.04,z:0});
    ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.lineTo(right.x-5,right.y-3);ctx.moveTo(right.x,right.y);ctx.lineTo(right.x-5,right.y+3);
    ctx.strokeStyle=dark?'rgba(135,194,213,.3)':'rgba(40,114,138,.35)';ctx.lineWidth=.8;ctx.stroke();
    dirty=false;
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true;
  }
  function loop(now) {
    frame=0;
    if(!visible||document.hidden)return;
    const delta=last?Math.min((now-last)/1000,.06):0;last=now;
    if(!paused){time+=delta;smoothX+=(pointerX-smoothX)*.06;smoothY+=(pointerY-smoothY)*.06;}
    if(dirty||!paused)draw();
    if(!paused)frame=requestAnimationFrame(loop);
  }
  function wake(){dirty=true;if(!frame){last=0;frame=requestAnimationFrame(loop);}}
  const move=e=>{if(paused||motion.matches)return;const r=hero.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;};
  const leave=()=>{pointerX=pointerY=0;};
  const toggle=()=>{paused=!paused;label();wake();};
  const reduced=()=>{paused=motion.matches;label();wake();};
  const visibility=()=>{if(!document.hidden)wake();};
  const sizeObserver=new ResizeObserver(()=>{resize();wake();});sizeObserver.observe(canvas);
  const viewObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();});viewObserver.observe(canvas);
  const themeObserver=new MutationObserver(wake);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',leave);button.addEventListener('click',toggle);motion.addEventListener('change',reduced);document.addEventListener('visibilitychange',visibility);
  resize();label();wake();
  return()=>{cancelAnimationFrame(frame);sizeObserver.disconnect();viewObserver.disconnect();themeObserver.disconnect();hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);button.removeEventListener('click',toggle);motion.removeEventListener('change',reduced);document.removeEventListener('visibilitychange',visibility);};
}
