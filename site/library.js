// Progressive enhancement: every guide, source link, and worked example is
// already in its HTML. This module only adds controls and shelf filtering.
const themeButton = document.querySelector('#theme-toggle');
function themeLabel() {
  const dark=document.documentElement.dataset.theme==='dark';
  themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);
  themeButton.textContent=dark?'☼':'◐';
}
themeButton?.addEventListener('click',()=>{
  document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  try { localStorage.setItem('yq-theme',document.documentElement.dataset.theme); } catch {}
  themeLabel();
});
if(themeButton) themeLabel();
document.querySelector('#year').textContent=new Date().getFullYear();

const search=document.querySelector('#paper-search');
if(search) {
  let category='all';
  const cards=[...document.querySelectorAll('[data-paper]')];
  const filters=[...document.querySelectorAll('[data-category-filter]')];
  function filterPapers() {
    const terms=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count=0;
    for(const card of cards) {
      card.hidden=!(category==='all'||category===card.dataset.category)||!terms.every(term=>card.dataset.search.includes(term));
      if(!card.hidden)count++;
    }
    document.querySelector('#search-status').textContent=`${count} of ${cards.length} papers shown`;
    document.querySelector('#no-results').hidden=count!==0;
  }
  search.addEventListener('input',filterPapers);
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.categoryFilter;
    filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    filterPapers();
  }));
}

const strip=(label,values,dim=false)=>`<div class="data-strip"><span class="strip-label">${label}</span>${values.map(v=>`<span class="cell ${dim?'dim':''}">${v}</span>`).join('')}</div>`;
const result=text=>`<output class="demo-result">${text}</output>`;
const costRow=(label,compute,copy,total)=>`<div class="cost-row"><span>${label}</span><div class="cost-track"><span class="cost-segment" style="width:${compute*10}%"></span><span class="cost-segment copy" style="width:${copy*10}%"></span></div><span class="cost-value">${total} units</span></div>`;
function choose(demo,draw) {
  const buttons=[...demo.querySelectorAll('[data-choice]')];
  buttons.forEach(button=>button.addEventListener('click',()=>{
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    draw(button.dataset.choice);
  }));
  draw(buttons[0].dataset.choice);
}

const demos={
  tileloom(demo,output) {
    choose(demo,mode=>{
      const shared=mode==='broadcast';
      output.innerHTML=`<div class="transfer-source">Off-chip memory · tile A</div><div class="core-grid">${[0,1,2,3].map(i=>`<div class="core"><h4>Core ${i}</h4><div class="weight-piece">Tile A</div><p>${shared&&i?'← On-chip delivery from core 0':'↓ Fetch from off-chip memory'}</p></div>`).join('')}</div>`+
        result(shared?'1 off-chip fetch + 3 on-chip deliveries':'4 off-chip fetches of the same tile')+
        '<p class="demo-footnote">Each core gets the same values. This counts logical tile transfers, not network packets or elapsed time. The broadcast needs network support and buffer space.</p>';
    });
  },
  nautilus(demo,output) {
    choose(demo,mode=>{
      const both=mode==='both',numerator=both?50:10,denominator=both?3:1;
      output.innerHTML=strip('Values',both?[10,20]:[10])+strip('Weights',both?[1,2]:[1])+
        `<div class="core-grid"><div class="core"><h4>Running numerator</h4><div class="weight-piece">${numerator}</div><p>${both?'10 + 2 × 20':'1 × 10'}</p></div><div class="core"><h4>Running denominator</h4><div class="weight-piece gold">${denominator}</div><p>${both?'1 + 2':'1'}</p></div></div>`+
        result(`Average = ${numerator} / ${denominator} = ${both?'16.67 (rounded)':'10'}`)+
        `<p class="demo-footnote">${both?'The second value has twice the weight, so a plain average of 10 and 20 would be wrong.':'Add the next item by updating both pieces of state.'} These two running quantities explain a reduction; this is not an implementation of stable attention.</p>`;
    });
  },
  set(demo,output) {
    choose(demo,mode=>{
      const spatial=mode==='spatial';
      output.innerHTML=`<div class="schedule-tree"><span class="tree-root">${spatial?'S':'T'} cut</span><div><span>Task A</span><span>Task B</span></div></div>`+
        (spatial?strip('Same time',['A<small>core 0</small>','A<small>core 1</small>','B<small>core 2</small>','B<small>core 3</small>']):
          strip('First',['A<small>core 0</small>','A<small>core 1</small>','A<small>core 2</small>','A<small>core 3</small>'])+strip('Then',['B<small>core 0</small>','B<small>core 1</small>','B<small>core 2</small>','B<small>core 3</small>']))+
        result(spatial?'Separate core groups: A and B may run together.':'Same core group: A runs, then B runs.')+
        '<p class="demo-footnote">This picture assigns resources, not durations. Fewer cores can make each task slower. If B depends on A, B must wait for the required data even with an S cut.</p>';
    });
  },
  stream(demo,output) {
    choose(demo,mode=>{
      const wait=mode==='busy'?4:0;
      const ticks=['A','A',...Array(wait).fill('wait'),'→','B','B'];
      output.innerHTML=`<p class="toy-label">Each box = 1 tick · time moves left to right →</p><div class="tick-timeline">${Array.from({length:9},(_,i)=>`<div class="tick ${ticks[i]==='wait'?'waiting':ticks[i]?'working':''}"><b>${ticks[i]==='wait'?'W':ticks[i]||'·'}</b><small>${i}–${i+1}</small></div>`).join('')}</div><div class="legend-row"><span>A / B: compute</span><span class="copy">W: wait for link</span><span>→: transfer</span></div>`+
        result(`Finish at tick ${ticks.length}: 2 + ${wait} wait + 1 transfer + 2 = ${ticks.length}`)+
        `<p class="demo-footnote">Core B starts at tick ${3+wait}, once its input arrives. Compute still takes 4 ticks total; the schedule also pays for movement and waiting.</p>`;
    });
  },
  dato(demo,output) {
    choose(demo,mode=>{
      const mismatch=mode==='mismatch';
      output.innerHTML=strip('Producer',[2,4,6])+`<div class="transfer-source">Typed stream → consumer doubles each value</div>`+
        strip('Consumer',mismatch?[4,8,12,'?<small>no token</small>']:[4,8,12])+
        `<div class="contract-counts"><span><b>3</b> sends</span><span aria-hidden="true">${mismatch?'≠':'='}</span><span><b>${mismatch?4:3}</b> reads</span></div>`+
        result(mismatch?'Mismatch: read 4 has no producer. The toy pipeline would stall.':'Matched: output = [4, 8, 12].')+
        '<p class="demo-footnote">This closed example assumes successful delivery and enough buffering. Matching counts alone does not establish that a larger task graph is deadlock-free.</p>';
    });
  },
  mirage(demo,output) {
    choose(demo,mode=>{
      const expr=mode==='valid'?'A × B + A × C':mode==='invalid'?'A × B + C':'A × (B + C)';
      const calculation=mode==='valid'?'2 × 3 + 2 × 4 = 6 + 8':mode==='invalid'?'2 × 3 + 4 = 6 + 4':'2 × (3 + 4) = 2 × 7';
      const value=mode==='invalid'?10:14;
      output.innerHTML=strip('Inputs',['A = 2','B = 3','C = 4'])+
        `<div class="expression-card"><span class="toy-label">Candidate expression</span><strong>${expr}</strong><span>${calculation} = ${value}</span></div><div class="core-grid"><div class="core"><h4>Reference output</h4><div class="weight-piece">14</div></div><div class="core"><h4>Candidate output</h4><div class="weight-piece ${value===14?'':'gold'}">${value}</div></div></div>`+
        result(value===14?'Matches this input. Equivalence still needs general reasoning.':'Reject: 10 ≠ 14. One counterexample is enough.')+
        '<p class="demo-footnote">Distributivity justifies the valid rewrite over exact real arithmetic. Floating-point rounding can differ. Mirage’s supported randomized algebraic checks do much more than this single scalar example.</p>';
    });
  },
  vtc(demo,output) {
    function draw(mode) {
      output.innerHTML=strip('Array A',[10,20,30,40,50,60])+
        (mode==='copy'?`<p>Copy the last 3 values into a newly allocated slice.</p>${strip('New slice',[40,50,60])}${result('3 extra value slots · 3 values read + 3 written to create the copy')}`:
          `<p><strong>Mapping rule:</strong> view[i] = A[i + 3]</p>${strip('Read view',['40<small>at A[3]</small>','50<small>at A[4]</small>','60<small>at A[5]</small>'])}${result('0 extra value slots · no value copies to create the view')}`)+
        '<p class="demo-footnote">Both reads return [40, 50, 60]. The view still needs metadata, address calculations, and reads when consumed. This example is read-only; writes require aliasing checks.</p>';
    }
    demo.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
      demo.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      draw(button.dataset.mode);
    }));
    draw('copy');
  },
  fuseflow(demo,output) {
    let step=0;
    const next=demo.querySelector('[data-next]');
    const stages=[
      {a:['0 : 2','2 : 3'],b:['1 : 4','2 : 5'],note:'A starts at coordinate 0; B starts at 1. Coordinate 0 cannot match, so advance A.',sum:0},
      {a:['2 : 3'],b:['1 : 4','2 : 5'],note:'Now A is at coordinate 2; B is at 1. Coordinate 1 cannot match, so advance B.',sum:0},
      {a:['2 : 3'],b:['2 : 5'],note:'Both streams reached coordinate 2. Multiply their values: 3 × 5 = 15.',sum:0},
      {a:['done'],b:['done'],note:'The reducer adds the product. A next operation can consume this completed result, with any required output coordinate.',sum:15}
    ];
    function draw() {
      const s=stages[step];
      output.innerHTML='<span class="toy-label">Each token is coordinate : value</span>'+strip('A stream',s.a)+strip('B stream',s.b)+`<p>${s.note}</p>`+result(`Step ${step+1} of 4 · accumulated result = ${s.sum}`);
      next.disabled=step===3;
      next.textContent=step===2?'Multiply + accumulate →':step===3?'Complete ✓':'Advance streams →';
    }
    next.addEventListener('click',()=>{step=Math.min(3,step+1);draw();});
    demo.querySelector('[data-reset]').addEventListener('click',()=>{step=0;draw();});draw();
  },
  graphturbo(demo,output) {
    const stage=demo.querySelector('#memory-stage');
    const tiles=demo.querySelector('#memory-tiles');
    function draw() {
      const size=Number(stage.value),count=Number(tiles.value),needed=size*count,capacity=8;
      demo.querySelector('#tile-count').value=String(count);
      output.innerHTML=`<p><strong>Fast memory: 8 slots</strong> · ${size} slots per image tile</p><div class="memory-slots">${Array.from({length:capacity},(_,i)=>`<div class="memory-slot ${i<needed?'used':''} ${i>=size&&i<needed?'second':''}">${i<needed?`Tile ${Math.floor(i/size)+1}`:'free'}</div>`).join('')}</div>`+
        result(`${count} × ${size} = ${needed} slots. ${needed<=capacity?`Fits, with ${capacity-needed} slots free.`:`Does not fit: ${needed-capacity} slots over capacity.`}`)+
        `<p class="demo-footnote">At this stage, at most ${Math.floor(capacity/size)} image tile${size===3?'s':''} fit at once. A real compiler must also budget other live buffers.</p>`;
    }
    stage.addEventListener('change',draw);tiles.addEventListener('input',draw);draw();
  },
  'tensor-seeks-layout'(demo,output) {
    const slider=demo.querySelector('#conversion-cost');
    function draw() {
      const c=Number(slider.value),a=2+c,b=3;
      demo.querySelector('#conversion-value').value=String(c);
      output.innerHTML=costRow('Local favorites',2,c,a)+costRow('Common layout',3,0,b)+
        '<div class="legend-row"><span>Operator work</span><span class="copy">Layout conversion</span></div>'+
        result(a===b?'Tie: both plans cost 3 units.':a<b?`Local favorites win: ${a} < ${b}. Conversion is cheap enough.`:`Common layout wins: ${b} < ${a}. Saving conversion outweighs slower A.`)+
        `<p class="demo-footnote">Local favorites: 1 + ${c} + 1 = ${a}. Common layout: 2 + 1 = 3. Both compute the same result; the threshold is conversion cost = 1.</p>`;
    }
    slider.addEventListener('input',draw);draw();
  },
  'fast-and-fusiest'(demo,output) {
    let pruned=false;
    const slider=demo.querySelector('#plan-budget');
    const pruneButton=demo.querySelector('[data-prune]');
    const plans=[{name:'A',time:2,memory:8},{name:'B',time:3,memory:3},{name:'C',time:4,memory:9}];
    const dominated=p=>plans.some(q=>q!==p&&q.time<=p.time&&q.memory<=p.memory&&(q.time<p.time||q.memory<p.memory));
    function draw() {
      const budget=Number(slider.value);
      demo.querySelector('#budget-value').value=String(budget);
      const eligible=plans.filter(p=>p.memory<=budget&&!(pruned&&dominated(p))).sort((a,b)=>a.time-b.time);
      output.innerHTML=`<div class="table-scroll"><table class="plan-table"><caption class="toy-label">Same interface · equal energy · equal memory-lifetime pattern</caption><thead><tr><th scope="col">Plan</th><th scope="col">Time</th><th scope="col">Memory</th><th scope="col">Decision</th></tr></thead><tbody>${plans.map(p=>`<tr class="${pruned&&dominated(p)?'pruned':''}"><th scope="row">${p.name}</th><td>${p.time}</td><td>${p.memory}</td><td class="plan-status">${pruned&&dominated(p)?'Dominated → discard':p.memory>budget?'Over this budget':eligible[0]===p?'Fastest feasible':'Feasible alternative'}</td></tr>`).join('')}</tbody></table></div>`+
        result(eligible.length?`With ${budget} memory units, choose plan ${eligible[0].name}: ${eligible[0].time} time units.`:'No plan fits. The planner must find a smaller-memory alternative.')+
        `<p class="demo-footnote">${pruned?'C is worse in both time and memory. A and B survive because A is faster but B needs less memory.':'Prune C to remove a plan that is slower and larger than both alternatives.'} An over-budget plan may be useful under another budget; it is not necessarily dominated.</p>`;
      pruneButton.disabled=pruned;pruneButton.textContent=pruned?'Plan C pruned ✓':'Prune dominated plan';
    }
    slider.addEventListener('input',draw);pruneButton.addEventListener('click',()=>{pruned=true;draw();});
    demo.querySelector('[data-reset]').addEventListener('click',()=>{pruned=false;slider.value='8';draw();});draw();
  },
  t10(demo,output) {
    let step=0;
    const next=demo.querySelector('[data-next]');
    const labels=['Place','Compute','Exchange','Compute again'];
    const notes=[
      'Each core holds one weight column and its own input row. The output entries have not been computed.',
      'Core 0: [1, 2] · [1, 0] = 1. Core 1: [3, 4] · [0, 2] = 8. Each has finished one output column.',
      'Exchange only the weight pieces. Input rows and partial outputs stay local. The exchange has a communication cost.',
      'Core 0 now computes [1, 2] · [0, 2] = 4. Core 1 computes [3, 4] · [1, 0] = 3. Both output rows are complete.'
    ];
    function draw() {
      const swapped=step>=2;
      const outputs=step===0?['[ ·, · ]','[ ·, · ]']:step<3?['[ 1, · ]','[ ·, 8 ]']:['[ 1, 4 ]','[ 3, 8 ]'];
      output.innerHTML=`<div class="step-track">${labels.map((s,i)=>`<span class="${i===step?'active':''}" ${i===step?'aria-current="step"':''}>${i+1}. ${s}</span>`).join('')}</div><div class="core-grid">${[0,1].map(i=>{const w=swapped?1-i:i;return `<div class="core"><h4>Core ${i} · input ${i?'[3, 4]':'[1, 2]'}</h4><div class="weight-piece ${w?'gold':''}">W${w?'₁':'₀'} = ${w?'[0, 2]':'[1, 0]'}</div><p>Output row: <strong>${outputs[i]}</strong></p></div>`;}).join('')}</div><p style="margin-top:18px">${notes[step]}</p>`+result(step===3?'Result: [[1, 4], [3, 8]] · same as ordinary matrix multiplication':'2 weight pieces stored across the cores; full replication would store 4.')+
        '<p class="demo-footnote">This toy counts weight storage only. T10 also plans input/output placement, temporary buffers, and idle-to-active setup.</p>';
      next.textContent=['Compute first pieces →','Exchange weight pieces ⇄','Compute remaining pieces →','Complete ✓'][step];next.disabled=step===3;
    }
    next.addEventListener('click',()=>{step=Math.min(3,step+1);draw();});demo.querySelector('[data-reset]').addEventListener('click',()=>{step=0;draw();});draw();
  }
};
document.querySelectorAll('[data-demo]').forEach(demo=>{
  const initialize=demos[demo.dataset.demo];
  if(initialize) initialize(demo,demo.querySelector('[data-output]'));
});
document.querySelectorAll('[data-enhanced]').forEach(element=>{element.hidden=false;});
