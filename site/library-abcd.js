// Small numerical and structural teaching models. No LLM, EDA, or compiler
// execution is implied by these deterministic browser interactions.
export function createAbcdDemos({choose,strip,result}) {
  const cards=items=>`<div class="lab-cards">${items.map(([label,value,note])=>`<div class="lab-card"><span>${label}</span><strong>${value}</strong>${note?`<small>${note}</small>`:''}</div>`).join('')}</div>`;
  const path=items=>`<div class="lab-path">${items.map((v,i)=>`${i?'<span aria-hidden="true">→</span>':''}<b>${v}</b>`).join('')}</div>`;
  const note=text=>`<p class="demo-footnote">${text}</p>`;
  const table=(headers,rows)=>`<div class="table-scroll"><table class="plan-table"><thead><tr>${headers.map(v=>`<th scope="col">${v}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i?`<td>${v}</td>`:`<th scope="row">${v}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const choices=(draw)=>(demo,output)=>choose(demo,mode=>{output.innerHTML=draw(mode);});
  return {
    mahl:choices(mode=>{
      const reuse=mode==='reuse';
      return cards([['Definitions to check',reuse?1:4,'Code reuse'],['Physical PE instances',4,'Hardware still exists']])+
        path(reuse?['Tested PE definition','Instantiate four times']:['PE₀ code','PE₁ code','PE₂ code','PE₃ code'])+
        strip('Array',['PE₀','PE₁','PE₂','PE₃'])+result(reuse?'1 reusable definition → 4 physical instances':'4 separately generated definitions → 4 physical instances')+
        note('Reusing a tested definition does not eliminate integration tests, parameter checks, or the area of its instances.');
    }),
    maco:choices(mode=>{
      const ready=mode==='supported';
      return strip('Kernel',['MUL','ADD'])+strip('Array',ready?['MUL','ADD']:['ADD','ADD'])+
        table(['Operation','Assignment'],[['MUL',ready?'Unit 0 · supported':'No unit supports MUL'],['ADD',ready?'Unit 1 · supported':'Unit 0 or 1']])+
        result(ready?'Operation-support check passes. Next: routing and scheduling.':'Rejected: no direct mapping for MUL in this toy array.')+
        note('This example checks only required operations. It does not rule out other implementations of multiplication or run a complete CGRA mapper.');
    }),
    'hsco-bench':choices(mode=>{
      const ok=mode==='fixed';
      return path(['Application','Driver: ID 7',`Device: ID ${ok?7:9}`])+
        cards([['Arithmetic test','PASS','Local block test'],['Interface check',ok?'MATCH':'MISMATCH','System connection']])+
        result(ok?'The call reaches device 7. Now check the application output.':'ID 7 has no matching target. A working block is unreachable.')+
        note('Real interfaces also include register addresses, data formats, synchronization, and memory ownership.');
    }),
    veriopt:choices(mode=>{
      const speed=mode==='speed',key=speed?'delay':'area',limit=speed?3:5;
      const plans=[{name:'A',area:8,delay:2},{name:'B',area:4,delay:5}];
      const selected=plans.find(p=>p[key]<=limit);
      return `<p><strong>Constraint: ${key} ≤ ${limit}</strong> · both candidates pass the same toy tests</p>`+
        table(['Circuit','Area','Delay','Constraint'],plans.map(p=>[p.name,p.area,p.delay,p[key]<=limit?'Fits ✓':'Over limit']))+
        result(`Choose circuit ${selected.name} for this ${key} constraint.`)+note('Neither circuit dominates the other. Physical costs come from tools, not from a language model’s confidence.');
    }),
    'hierarchical-irs':choices(mode=>mode==='topology'?
      path(['Input register','Adder','Sum register'])+'<div class="transfer-source">Sum register → old sum fed back to the adder ↶</div>'+result('Topology answers: which blocks connect?')+note('The connection diagram alone does not define reset, update, or hold behavior.'):
      table(['Event','Input','Sum after event'],[['Reset','—',0],['Valid',2,2],['Not valid',9,2],['Valid',3,5]])+result('Behavior answers: reset to 0; add valid inputs; otherwise hold.')+note('The value 9 is ignored because valid is false. Both representations must describe this same accumulator.')),
    rome:choices(mode=>{
      const local=mode==='leaf';
      return cards([['Decoder','PASS',local?'Keep definition':'Revisit definition'],['ALU','FAIL','Repair required'],['Register file','PASS',local?'Keep definition':'Revisit definition']])+
        path(local?['Repair ALU','Retest ALU','Integration test']:['Regenerate all 3','Retest modules','Integration test'])+
        result(local?'1 leaf revised; the complete design is still retested.':'3 module definitions revisited for one local failure.')+
        note('The toy assumes independent module interfaces stay fixed. Interface changes can require revisiting neighboring modules.');
    }),
    verigraphi:choices(mode=>{
      const width=mode==='match'?8:16;
      return cards([['Sender output','8 bits','data_out'],['Receiver input',width+' bits','data_in']])+
        `<div class="contract-counts"><b>8</b><span>${width===8?'=':'≠'}</span><b>${width}</b></div>`+
        result(width===8?'Width contract passes. Check direction, reset, timing, and behavior next.':'Width contract fails: an explicit conversion or interface repair is needed.')+
        note('Verilog may permit implicit extension in some contexts. This teaching contract deliberately requires explicit width agreement.');
    }),
    rtlrewriter:choices(mode=>{
      const shared=mode==='shared';
      return path(shared?['Select operand pair','One adder','Output']:['Two adders','Select a sum','Output'])+
        table(['Select','Operand pair','Output'],[[0,'2 + 3',5],[1,'7 + 4',11]])+
        cards([['Toy adder count',shared?1:2,'Ignore mux cost here'],['Output pair','5, 11','Same in both arrangements']])+
        result(shared?'One shared adder; synthesis decides the area and timing trade-off.':'Two adders compute both alternatives before selection.')+
        note('We assume equal arithmetic widths and semantics. This is not a general equivalence checker or a PPA predictor.');
    }),
    'ppa-rtl':choices(mode=>{
      const power=mode==='power';
      const plans=[{name:'A',power:2,delay:6},{name:'B',power:5,delay:2}],key=power?'power':'delay';
      const sorted=[...plans].sort((a,b)=>a[key]-b[key]);
      return table(['Candidate','Power','Delay','Preference'],plans.map(p=>[p.name,p.power,p.delay,p===sorted[0]?'Preferred':'Rejected for this pair']))+
        path([`Objective: ${key}`,`Prefer ${sorted[0].name}`,`Training pair: ${sorted[0].name} > ${sorted[1].name}`])+
        result(`For lower ${key}, prefer ${sorted[0].name}; change the goal and the pair reverses.`)+
        note('Both are assumed functionally valid. This illustrates preference construction; it neither trains a model nor reproduces the paper’s score.');
    }),
    chipseek:choices(mode=>{
      const stop=mode==='syntax'?1:mode==='wrong'?2:4;
      const stages=['Format','Compilation','Functional check','Synthesis + PPA'];
      return `<ol class="lab-checks">${stages.map((s,i)=>`<li class="${i<stop?'passed':i===stop?'failed':'pending'}"><span>${s}</span><b>${i<stop?'PASS':i===stop?'FAIL':'NOT RUN'}</b></li>`).join('')}</ol>`+
        result(stop===4?'All toy gates pass → evaluate PPA.':`Stop at ${stages[stop].toLowerCase()}; no PPA evaluation.`)+
        note('A finite functional test suite can miss bugs. The gates organize the reward pipeline; they do not make the test suite exhaustive.');
    }),
    autoppa:choices(mode=>{
      const parallel=mode==='parallel';
      return '<div class="transfer-source">Candidate rule: share an adder only when its uses do not overlap.</div>'+
        table(['Time slot','Required work'],parallel?[[1,'A and B together'],[2,'—']]:[[1,'A'],[2,'B']])+
        result(parallel?'Condition fails: one adder cannot satisfy both uses in slot 1.':'Condition holds in this toy: one adder can serve A, then B.')+
        note('A real rule also needs compatible widths, timing, control, and interfaces. Recheck the transformed implementation.');
    }),
    spatial:choices(mode=>{
      const banks=mode==='four'?4:1;
      return strip('Addresses',[0,1,2,3])+strip('Bank IDs',[0,1,2,3].map(i=>i%banks))+
        cards([['Banks',banks,'One read per bank per tick'],['Read ticks',4/banks,'Four consecutive elements']])+
        result(banks===4?'4 independent banks → 4 reads in 1 tick.':'1 bank → 4 reads over 4 ticks; lanes wait.')+
        note('Bank = address modulo bank count in this toy. Four addresses that land in the same bank would still conflict.');
    }),
    calyx:choices(mode=>{
      const parallel=mode==='par';
      return cards([['Adders',parallel?2:1,'Arithmetic resources'],['Completion tick',parallel?1:2,'One-tick toy addition']])+
        table(['Operation','Output','Tick'],[['2 + 3',5,1],['7 + 4',11,parallel?1:2]])+
        result(parallel?'Parallel: both sums finish at tick 1 using two adders.':'Sequential: reuse one adder; both sums finish by tick 2.')+
        note('Additional muxes, registers, and control logic are omitted. A real implementation must preserve completion and dependency behavior.');
    }),
    gemmini:choices(mode=>{
      const whole=mode==='system';
      const plans=[{name:'A',compute:8,overhead:2},{name:'B',compute:4,overhead:8}];
      const rows=plans.map(p=>`<div class="lab-bar-row"><b>${p.name}</b><div class="lab-bar"><span style="width:${p.compute/14*100}%">${p.compute}</span>${whole?`<span class="overhead" style="width:${p.overhead/14*100}%">${p.overhead}</span>`:''}</div><strong>${p.compute+(whole?p.overhead:0)}</strong></div>`).join('');
      return rows+'<div class="legend-row"><span>Compute</span><span class="copy">Transfers + software</span></div>'+
        result(whole?'Whole system: A wins, 10 < 12 ticks.':'Kernel only: B wins, 4 < 8 ticks.')+
        note('The invented timing model adds non-overlapping costs. Real systems may overlap work, and measurement boundaries must be consistent.');
    }),
    timeloop:choices(mode=>{
      const reuse=mode==='reuse';
      return strip('Weight fetches',reuse?['W']:['W','W','W','W'])+strip('Products',['x₀ × W','x₁ × W','x₂ × W','x₃ × W'])+
        cards([['Weight fetches',reuse?1:4,'Traffic at this boundary'],['Multiplications',4,'Unchanged arithmetic']])+
        result(reuse?'Retain W locally: 1 weight fetch, 4 uses.':'Reload W: 4 weight fetches, 4 uses.')+
        note('The toy leaves input/output traffic and local storage costs out. Real mapspace constraints decide whether reuse is feasible.');
    }),
    accelergy:choices(mode=>{
      const reads=mode==='one'?1:4,readEnergy=reads*10,computeEnergy=4*1;
      return table(['Action','Count','Energy each','Subtotal'],[['Memory read',reads,10,readEnergy],['Multiply',4,1,computeEnergy]])+
        cards([['Memory energy',readEnergy,'Toy units'],['Compute energy',computeEnergy,'Toy units']])+
        result(`Total = ${reads} × 10 + 4 × 1 = ${readEnergy+computeEnergy} energy units.`)+
        note('This is deliberately incomplete accounting. A full estimate also includes local access, leakage, clocking, interconnect, and other component actions.');
    }),
    asap:choices(mode=>{
      const bits=mode==='eight'?8:2,scale=2**bits,x=0.3,integer=Math.round(x*scale),value=integer/scale;
      return strip('Fractional bits',Array.from({length:bits},(_,i)=>String((integer>>(bits-i-1))&1)))+
        cards([['Quantized value',value,'round(0.3 × '+scale+') / '+scale],['Absolute error',Math.abs(value-x).toFixed(bits===2?2:8),'Compared with 0.3']])+
        result(`${bits} fractional bits → ${integer}/${scale} = ${value}.`)+
        note('No hardware cost is predicted here. A real precision choice must meet the application’s overall error limit and be evaluated in hardware.');
    })
  };
}
