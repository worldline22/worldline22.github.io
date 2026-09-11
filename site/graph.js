// Conceptual accelerator: a projected 3D scene, independent of any specific chip.
export function startGraph(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const scene = canvas.closest('.motion-scene');
  const button = scene.querySelector('[data-motion]');
  const controls = [...scene.querySelectorAll('[data-component]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, visible = true, frame = 0, last = 0, time = 1.4;
  let width = 0, height = 0, dirty = true, pointerX = 0, pointerY = 0;
  let smoothX = 0, smoothY = 0, selected = '', hover = '', hitRegions = [];
  const tiles = Array.from({length:16}, (_,i) => ({x:(i%4-1.5)*.65,z:(Math.floor(i/4)-1.5)*.65,index:i}));
  const banks = [-1,1].flatMap(side=>[-1,0,1].map(z=>({x:side*2,z:z*.95})));
  function label() {
    button.textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.setAttribute('aria-pressed',String(paused));
    controls.forEach(b=>b.setAttribute('aria-pressed',String(selected===b.dataset.component)));
  }
  function draw() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const active = hover || selected;
    const scale = Math.min(width/6.3,height/4.2);
    const yaw = -.58 + smoothX*.12 + Math.sin(time*.09)*.025;
    const tilt = .58 + smoothY*.07;
    const cx = width*.5, cy = height*.56;
    const palette = dark ? {compute:'108,211,215',memory:'162,154,217',interconnect:'106,171,197'} : {compute:'16,119,127',memory:'104,83,155',interconnect:'53,117,148'};
    const ink = dark ? '#a5c4cb' : '#46656e';
    const project = p => {
      const x = p.x*Math.cos(yaw)+p.z*Math.sin(yaw);
      const z = -p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
      return {x:cx+x*scale,y:cy+(z*Math.sin(tilt)-(p.y||0)*Math.cos(tilt))*scale,depth:z};
    };
    const path = points => {ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));};
    const line = (points,color,alpha=.3,lineWidth=1) => {path(points.map(project));ctx.strokeStyle=`rgba(${color},${alpha})`;ctx.lineWidth=lineWidth;ctx.stroke();};
    const box = (x,z,w,d,y,h,type,activation=0) => {
      const color = palette[type] || palette.interconnect;
      const highlight = active===type ? .22 : 0;
      const corners = level => [{x:x-w/2,z:z-d/2,y:level},{x:x+w/2,z:z-d/2,y:level},{x:x+w/2,z:z+d/2,y:level},{x:x-w/2,z:z+d/2,y:level}].map(project);
      const bottom=corners(y),top=corners(y+h);
      for(const indices of [[1,2],[2,3]]) {
        const [a,b]=indices;path([bottom[a],bottom[b],top[b],top[a]]);ctx.closePath();
        ctx.fillStyle=dark?'#102630':'#dce8e9';ctx.fill();ctx.strokeStyle=`rgba(${color},.25)`;ctx.lineWidth=.7;ctx.stroke();
      }
      path(top);ctx.closePath();ctx.fillStyle=dark?'#142a34':'#edf3f2';ctx.fill();
      ctx.fillStyle=`rgba(${color},${.06+activation*.22+highlight})`;ctx.fill();
      ctx.strokeStyle=`rgba(${color},${.38+activation*.35+highlight})`;ctx.lineWidth=active===type?1.35:.8;ctx.stroke();
      if(type)hitRegions.push({type,points:top});
      return project({x,z,y:y+h});
    };
    ctx.clearRect(0,0,width,height);hitRegions=[];
    // A quiet grounding shadow, rather than a bright full-screen glow.
    ctx.save();ctx.translate(cx,cy+scale*.75);ctx.scale(1,.28);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,scale*2.7);
    shadow.addColorStop(0,dark?'rgba(0,0,0,.25)':'rgba(35,70,80,.08)');shadow.addColorStop(1,'transparent');
    ctx.fillStyle=shadow;ctx.fillRect(-scale*3,-scale*3,scale*6,scale*6);ctx.restore();
    box(0,0,5,3.5,-.24,.14,'');
    // Orthogonal routes connect memory to the tile mesh.
    for(const bank of banks)line([{x:bank.x,z:bank.z,y:.02},{x:bank.x*.67,z:bank.z,y:.02},{x:bank.x*.67,z:0,y:.02},{x:0,z:0,y:.02}],palette.interconnect,active==='interconnect'?.85:.28,active==='interconnect'?1.7:.85);
    for(let i=0;i<4;i++) {
      const offset=(i-1.5)*.65;
      line([{x:-1.32,z:offset,y:.035},{x:1.32,z:offset,y:.035}],palette.interconnect,active==='interconnect'?.8:.35);
      line([{x:offset,z:-1.32,y:.035},{x:offset,z:1.32,y:.035}],palette.interconnect,active==='interconnect'?.8:.35);
    }
    const objects=[...tiles.map(t=>({...t,kind:'compute'})),...banks.map(b=>({...b,kind:'memory'}))];
    objects.sort((a,b)=>project(b).depth-project(a).depth).reverse();
    for(const obj of objects) {
      if(obj.kind==='memory') {
        box(obj.x,obj.z,.46,.69,.01,.18,'memory');
        for(let j=0;j<3;j++)line([{x:obj.x-.13,z:obj.z-.19+j*.19,y:.20},{x:obj.x+.13,z:obj.z-.19+j*.19,y:.20}],palette.memory,.5,.7);
      } else {
        const wave=(time*.9)%7-(obj.index%4+Math.floor(obj.index/4))*.45;
        const activation=Math.max(0,1-Math.abs(wave-1)*1.4);
        const p=box(obj.x,obj.z,.49,.49,.015,.13,'compute',activation);
        ctx.fillStyle=`rgba(${palette.compute},${.24+activation*.65})`;ctx.fillRect(p.x-1.5,p.y-1.5,3,3);
      }
    }
    // Data packets enter from memory, cross the mesh, then return with results.
    banks.forEach((bank,index)=>{
      const progress=(time*.22+index*.17)%1;
      const destination=tiles[(index*3)%tiles.length];
      const route=[{x:bank.x,z:bank.z,y:.25},{x:bank.x*.66,z:bank.z,y:.25},{x:bank.x*.66,z:destination.z,y:.25},{x:destination.x,z:destination.z,y:.25}];
      const returning=progress>.5, t=returning?(1-progress)*2:progress*2;
      const segment=Math.min(2,Math.floor(t*3)),f=t*3-segment;
      const a=route[segment],b=route[segment+1];
      const p=project({x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,y:.25});
      ctx.fillStyle=dark?(returning?'#b1a4e7':'#a5e7e6'):(returning?'#7960aa':'#13898d');
      ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=dark?6:0;ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    });
    // Abstract operations descend onto compute resources: workload mapping.
    for(let i=0;i<3;i++) {
      const phase=(time*.14+i*.28)%1;
      const tile=tiles[[2,9,15][i]];
      const y=.2+(1-phase)*1.25;
      const opacity=Math.min(1,phase*6,(1-phase)*7)*.65;
      ctx.save();ctx.globalAlpha=opacity;
      line([{x:tile.x,z:tile.z,y:.18},{x:tile.x,z:tile.z,y}],palette.compute,.2,.65);
      box(tile.x,tile.z,.33,.33,y,.025,'compute',.15);
      ctx.restore();
    }
    const labelPoint=project({x:0,z:-1.1,y:2.0});
    ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='10px "DM Sans", sans-serif';
    ctx.fillText('WORKLOAD → EXECUTION',labelPoint.x,labelPoint.y);
    dirty=false;
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true;
  }
  function loop(now) {
    frame=0;if(!visible||document.hidden)return;
    const delta=last?Math.min((now-last)/1000,.06):0;last=now;
    if(!paused){time+=delta;smoothX+=(pointerX-smoothX)*.06;smoothY+=(pointerY-smoothY)*.06;}
    if(dirty||!paused)draw();if(!paused)frame=requestAnimationFrame(loop);
  }
  function wake(){dirty=true;if(!frame){last=0;frame=requestAnimationFrame(loop);}}
  function inside(x,y,points) {
    let result=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++) {
      const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)result=!result;
    }
    return result;
  }
  const move=e=>{const r=canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;pointerX=x/width-.5;pointerY=y/height-.5;hover=hitRegions.findLast(region=>inside(x,y,region.points))?.type||'';wake();};
  const leave=()=>{pointerX=pointerY=0;hover='';wake();};
  const choose=e=>{const type=e.currentTarget.dataset.component;selected=selected===type?'':type;label();wake();};
  const toggle=()=>{paused=!paused;label();wake();};
  const reduced=()=>{paused=motion.matches;label();wake();};
  const visibility=()=>{if(!document.hidden)wake();};
  const sizeObserver=new ResizeObserver(()=>{resize();wake();});sizeObserver.observe(canvas);
  const viewObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();});viewObserver.observe(canvas);
  const themeObserver=new MutationObserver(wake);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);button.addEventListener('click',toggle);controls.forEach(b=>b.addEventListener('click',choose));motion.addEventListener('change',reduced);document.addEventListener('visibilitychange',visibility);
  resize();label();wake();
  return()=>{cancelAnimationFrame(frame);sizeObserver.disconnect();viewObserver.disconnect();themeObserver.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);button.removeEventListener('click',toggle);controls.forEach(b=>b.removeEventListener('click',choose));motion.removeEventListener('change',reduced);document.removeEventListener('visibilitychange',visibility);};
}
