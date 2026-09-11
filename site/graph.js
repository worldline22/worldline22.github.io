// Animated parametric toroidal surface. No images, video, or WebGL are required.
export function startGraph(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('#motion-toggle');
  const hero = canvas.closest('.hero');
  let paused = motion.matches, frame = 0, visible = true, time = 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, last = 0;
  let width = 0, height = 0, dirty = true;
  const bands = 36, steps = 112, surface = [];
  for (let i = 0; i < bands; i++) {
    const v = i / bands * Math.PI * 2;
    const line = [];
    for (let j = 0; j <= steps; j++) {
      const u = j / steps * Math.PI * 2;
      const radius = 1.35 + .45 * Math.cos(v + u * 2);
      line.push([radius * Math.cos(u), radius * Math.sin(u), .45 * Math.sin(v + u * 2) + .13 * Math.sin(u * 3)]);
    }
    surface.push(line);
  }
  // Deterministic, quiet particles give the mathematical form depth.
  const stars = Array.from({length:85}, (_,i) => ({x:((i*137.508)%997)/997, y:((i*233.719)%991)/991, r:i%9===0?1.25:.55, phase:i*1.7}));
  function label() {
    button.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.setAttribute('aria-pressed',String(paused));
  }
  function draw() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const small = width < 720;
    const cx = width * (small ? .56 : .64) + smoothX * 18;
    const cy = height * (small ? .46 : .55) + smoothY * 13;
    const scale = Math.min(width * (small ? .43 : .28),height * .29);
    const a = .62 + time * .075 + smoothX * .15;
    const b = .9 + Math.sin(time * .15) * .13 + smoothY * .12;
    ctx.clearRect(0,0,width,height);
    const glow = ctx.createRadialGradient(cx,cy,5,cx,cy,scale*2.3);
    glow.addColorStop(0,dark?'rgba(32,169,195,.10)':'rgba(52,169,179,.06)');
    glow.addColorStop(.5,dark?'rgba(28,137,168,.065)':'rgba(75,170,180,.025)');
    glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for (const star of stars) {
      const alpha = (dark?.24:.13) * (.7+.3*Math.sin(time*.4+star.phase));
      ctx.fillStyle=dark?`rgba(151,223,232,${alpha})`:`rgba(34,106,123,${alpha})`;
      ctx.beginPath();ctx.arc(star.x*width,star.y*height,star.r,0,Math.PI*2);ctx.fill();
    }
    function project(p) {
      const x=p[0]*Math.cos(a)+p[2]*Math.sin(a);
      const z=-p[0]*Math.sin(a)+p[2]*Math.cos(a);
      const y=p[1]*Math.cos(b)-z*Math.sin(b);
      const depth=p[1]*Math.sin(b)+z*Math.cos(b);
      const perspective=5.5/(5.5+depth);
      return {x:cx+x*scale*perspective,y:cy+y*scale*perspective,z:depth,p:perspective};
    }
    const points=[];
    surface.forEach((line,index)=>{
      const projected=line.map(project);
      ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=dark?`rgba(73,186,217,${index%4===0?.25:.10})`:`rgba(13,100,135,${index%4===0?.27:.12})`;
      ctx.lineWidth=index%4===0?.9:.55;ctx.stroke();
      projected.forEach((p,j)=>{if(j%2===0 && j<steps)points.push({...p,index,j});});
      // Moving signals run along selected lines on the surface.
      if(index%6===0){const k=Math.floor((time*.065+index/bands)%1*steps);const p=projected[k];ctx.beginPath();ctx.arc(p.x,p.y,1.9*p.p,0,Math.PI*2);ctx.fillStyle=dark?'#d9ffff':'#02677e';ctx.shadowBlur=dark?11:0;ctx.shadowColor='#4feeff';ctx.fill();ctx.shadowBlur=0;}
    });
    points.sort((a,b)=>b.z-a.z).forEach(p=>{
      const light=Math.max(.15,Math.min(1,(1.8-p.z)/3.6));
      const highlight=p.index%6===0;
      ctx.fillStyle=dark?`rgba(${highlight?'167,238,249':'65,168,208'},${.16+light*.7})`:`rgba(${highlight?'8,88,117':'29,125,149'},${.16+light*.64})`;
      ctx.beginPath();ctx.arc(p.x,p.y,(highlight?.95:.65)*p.p,0,Math.PI*2);ctx.fill();
    });
    // A low, receding coordinate field visually anchors the floating surface.
    const base=height*.79;
    for(let row=0;row<13;row++){
      ctx.beginPath();
      for(let col=0;col<=70;col++){
        const x=col/70*width;
        const wave=Math.sin(col*.11+time*.18+row*.11)*8;
        const y=base+row*row*.73+wave*(row/13);
        col?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=dark?`rgba(67,150,170,${.012+row*.004})`:`rgba(44,112,128,${.012+row*.003})`;
      ctx.lineWidth=.6;ctx.stroke();
    }
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
