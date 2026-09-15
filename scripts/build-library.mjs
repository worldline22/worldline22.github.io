import { mkdir, writeFile } from 'node:fs/promises';
import { papers } from './library-content.mjs';

const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg = (label,body) => `<svg class="lib-svg" viewBox="0 0 440 260" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const text = (x,y,value,cls='',anchor='middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(value)}</text>`;
const box = (x,y,w,h,label,active=false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="${active?'sv-accent':'sv-box'}"/>${label?text(x+w/2,y+h/2+5,label):''}`;
const line = (x,y,x2,y2,dash=false) => `<path d="M${x} ${y} L${x2} ${y2}" class="${dash?'sv-dash':'sv-line'}"/>`;
const arrow = (x,y,x2,y2) => {
  const length=Math.hypot(x2-x,y2-y),dx=(x2-x)/length,dy=(y2-y)/length;
  const point=(px,py)=>`${px.toFixed(2)} ${py.toFixed(2)}`;
  return line(x,y,x2,y2)+`<path d="M${point(x2-6*dx-4*dy,y2-6*dy+4*dx)} L${x2} ${y2} L${point(x2-6*dx+4*dy,y2-6*dy-4*dx)}" class="sv-line"/>`;
};
function visual(id) {
  if(id==='tileloom') return svg('One off-chip tile fetch feeds four cores through on-chip sharing.',
    text(24,30,'PLACE TILES. SHARE INPUTS.','sv-label','start')+box(152,48,136,42,'Off-chip tile')+
    arrow(220,92,220,122)+box(152,126,136,40,'Fetch once',true)+
    [0,1,2,3].map(i=>arrow(220,168,60+i*106,196)+box(18+i*106,200,84,38,'Core '+i,true)).join(''));
  if(id==='nautilus') return svg('A running numerator and denominator incorporate another item and give a weighted average.',
    text(25,30,'KEEP A SMALL RUNNING STATE','sv-label','start')+
    box(25,56,162,50,'Total 10 / Weight 1')+box(252,56,163,50,'Add 2 × 20')+
    arrow(106,108,180,144)+arrow(334,108,258,144)+box(125,147,190,48,'Total 50 / Weight 3',true)+
    arrow(220,197,220,218)+text(220,242,'Weighted average ≈ 16.67','sv-small'));
  if(id==='set') return svg('Temporal choice: all four cores do A then B. Spatial choice: two cores do A while two do B.',
    text(25,30,'TWO WAYS TO SHARE FOUR CORES','sv-label','start')+
    text(25,65,'T · take turns','sv-small','start')+
    [0,1,2,3].map(i=>box(25+i*46,80,39,36,'A',true)+box(233+i*46,80,39,36,'B')).join('')+arrow(210,98,228,98)+
    text(25,158,'S · split the cores','sv-small','start')+
    [0,1,2,3].map(i=>box(25+i*97,175,88,42,i<2?'A':'B',i<2)).join('')+
    text(220,248,'The tree can nest both choices.','sv-small'));
  if(id==='stream') return svg('A transfer delayed by a busy link pushes back the start of the consumer.',
    text(25,30,'FOLLOW THE DATA, THEN THE CLOCK','sv-label','start')+
    text(25,66,'Free link: finish at tick 5','sv-small','start')+
    box(25,78,76,42,'A',true)+box(105,78,38,42,'→')+box(147,78,76,42,'B',true)+
    text(25,160,'Busy link: finish at tick 9','sv-small','start')+
    box(25,172,76,42,'A',true)+box(105,172,154,42,'Wait 4 ticks')+box(263,172,38,42,'→')+box(305,172,76,42,'B',true)+
    text(220,246,'Same arithmetic. Different waiting time.','sv-small'));
  if(id==='dato') return svg('A producer sends three tokens, a typed stream carries them, and the consumer doubles them.',
    text(25,30,'AGREE ON EVERY HAND-OFF','sv-label','start')+
    box(25,58,114,46,'Producer')+arrow(142,81,169,81)+box(173,58,92,46,'Stream',true)+arrow(268,81,295,81)+box(299,58,116,46,'Consumer')+
    text(81,136,'3 sends','sv-small')+text(356,136,'3 reads','sv-small')+
    [2,4,6].map((v,i)=>box(29+i*55,173,46,40,String(v),true)).join('')+arrow(194,193,240,193)+
    [4,8,12].map((v,i)=>box(248+i*55,173,46,40,String(v))).join('')+
    text(220,247,'A fourth read has no matching token.','sv-small'));
  if(id==='mirage') return svg('Nested graphs describe the GPU kernel, block, and thread levels with device memory, shared memory, and registers.',
    text(25,29,'SEARCH THROUGH THREE LEVELS','sv-label','start')+
    box(25,49,390,190,'')+text(45,76,'Kernel · device memory','sv-small','start')+
    box(53,94,334,126,'')+text(73,120,'Block · shared memory','sv-small','start')+
    box(82,141,276,59,'Thread · registers',true));
  if(id==='vtc') return svg('A virtual view points to three existing values, instead of storing a second copy.',
    text(30,35,'ONE ARRAY, MANY VIEWS','sv-label','start')+
    [10,20,30,40,50,60].map((v,i)=>box(30+i*64,62,54,48,String(v),i>=3)).join('')+
    [0,1,2].map(i=>line(254+i*64,110,174+i*64,168,true)).join('')+
    box(141,168,196,48,'A[i + 3]',true)+text(239,242,'The view stores a rule, not the values.','sv-small'));
  if(id==='fuseflow') return svg('Sparse values travel with their coordinates through a match, multiply, and reduce pipeline.',
    text(30,30,'POSITIONS + VALUES','sv-label','start')+
    box(22,52,115,43,'(0, 2)  (2, 3)')+box(22,112,115,43,'(1, 4)  (2, 5)')+
    arrow(138,74,170,105)+arrow(138,134,170,120)+box(173,76,102,75,'Match',true)+
    arrow(278,112,306,112)+box(310,76,107,75,'3 × 5',true)+text(225,175,'position 2','sv-small')+
    arrow(362,154,362,190)+box(309,194,108,40,'Σ = 15',true)+text(30,224,'Skip unmatched coordinates.','sv-small','start'));
  if(id==='graphturbo') return svg('Eight memory slots fit one large six-slot tile or two smaller three-slot tiles.',
    text(26,30,'SAME MEMORY. DIFFERENT STAGES.','sv-label','start')+text(28,66,'Early stage','sv-small','start')+
    Array.from({length:8},(_,i)=>box(28+i*48,82,41,42,i<6?'A':'',i<6)).join('')+
    text(28,151,'Later stage','sv-small','start')+Array.from({length:8},(_,i)=>box(28+i*48,167,41,42,i<3?'A':i<6?'B':'',i<6)).join('')+
    text(220,244,'Smaller working sets make room for more work.','sv-small'));
  if(id==='tensor-seeks-layout') return svg('A locally preferred layout plan costs seven units; keeping a common layout costs three in this toy example.',
    text(25,30,'COUNT THE CONVERSION TOO','sv-label','start')+
    box(25,65,88,46,'A · row')+arrow(115,88,136,88)+box(140,65,125,46,'Convert',true)+arrow(268,88,290,88)+box(293,65,122,46,'B · column')+
    text(69,138,'1','sv-small')+text(203,138,'+ 5','sv-small')+text(353,138,'+ 1 = 7','sv-small')+
    box(25,173,144,46,'A · column',true)+arrow(172,196,245,196)+box(249,173,166,46,'B · column',true)+
    text(97,244,'2','sv-small')+text(331,244,'+ 1 = 3','sv-small'));
  if(id==='fast-and-fusiest') return svg('Three plans plotted by memory and time. Plan C is dominated; plans A and B have a useful trade-off.',
    text(27,28,'KEEP THE USEFUL TRADE-OFFS','sv-label','start')+arrow(60,215,408,215)+line(60,215,60,53)+
    text(35,132,'Time','sv-small')+text(241,250,'Memory →','sv-small')+
    `<path d="M145 135 L315 182" class="sv-dash"/><circle cx="145" cy="135" r="8" fill="var(--blue)"/><circle cx="315" cy="182" r="8" fill="var(--blue)"/><circle cx="330" cy="88" r="8" fill="var(--lib-gold)"/>`+
    text(135,115,'B: keep','sv-small')+text(310,207,'A: keep','sv-small')+text(332,66,'C: discard','sv-small')+
    `<path d="M320 78 L340 98 M340 78 L320 98" class="sv-line"/>`);
  if(id==='t10') return svg('Two cores compute on their local half of the weights, exchange halves, and compute again.',
    text(25,30,'COMPUTE → SHIFT → COMPUTE','sv-label','start')+
    box(30,58,150,141,'')+box(260,58,150,141,'')+text(105,85,'Core 0','sv-small')+text(335,85,'Core 1','sv-small')+
    box(55,105,100,58,'W₀',true)+box(285,105,100,58,'W₁',true)+
    arrow(184,114,254,114)+line(185,151,255,151)+`<path d="M191 147 L185 151 L191 155" class="sv-line"/>`+
    text(105,184,'Local input row','sv-small')+text(335,184,'Local input row','sv-small')+text(220,235,'Two weight pieces, shared over time.','sv-small'));
  const nodes=[['Copies',29,45],['Fusion',290,45],['Memory',10,126],['Layouts',309,126],['Search',35,208],['Cores',284,208]];
  return svg('Six connected ideas surround a compiler: copies, fusion, memory, layouts, search, and cores.',
    nodes.map(([,x,y])=>line(x+60,y+17,220,132,true)).join('')+
    `<circle cx="220" cy="132" r="52" class="sv-accent"/>`+text(220,129,'Move less.')+text(220,149,'Compute more.','sv-small')+
    nodes.map(([label,x,y])=>box(x,y,120,34,label)).join(''));
}

function shell({title,description,depth=2,body}) {
  const root='../'.repeat(depth);
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="${esc(description)}"><title>${esc(title)} · Library · Yuchao Qin</title><link rel="icon" href="${root}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${root}style.css"><link rel="stylesheet" href="${root}experience.css"><link rel="stylesheet" href="${root}library.css"><script src="${root}theme.js"></script></head>
<body data-page="library"><a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="${root}index.html#/" aria-label="Yuchao Qin home">yq<span>.</span></a><nav aria-label="Main navigation"><a href="${root}index.html#/">About</a><a href="${root}index.html#/papers">Papers</a><a href="${root}index.html#/projects">Projects</a><a href="${root}library/index.html" aria-current="page">Library</a><a href="${root}index.html#/notes">Notes</a><a href="${root}assets/yuchaoCV.pdf" target="_blank" rel="noopener">CV ↗</a></nav><button class="icon-button" id="theme-toggle" aria-label="Switch color theme" title="Switch color theme">◐</button></header>
<main class="library-main" id="main" tabindex="-1">${body}</main><footer><a class="footer-name" href="${root}index.html#/">Yuchao Qin</a><span>Research, one idea at a time.</span><a href="${root}library/index.html">Back to Library ↑</a><span>© <span id="year">2026</span></span></footer><script src="${root}library.js" type="module"></script></body></html>\n`;
}
const heroArt = (id,heading,foot='Conceptual illustration') => `<div class="hero-art"><div class="art-label"><span>${heading}</span><span>↗</span></div>${visual(id)}<div class="art-label"><span>${foot}</span><span>YQ / Library</span></div></div>`;
const bread = (current,isPaper=false) => `<div class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Library</a><span aria-hidden="true">/</span>${isPaper?'<a href="./index.html">Torch-Helion</a><span aria-hidden="true">/</span>':''}<span>${esc(current)}</span></div>`;
const collectionTabs = current => `<div class="reading-route" aria-label="Project collections"><a href="../torch-helion/index.html" ${current==='torch'?'aria-current="page"':''}>Torch-Helion · ${papers.length} papers</a><a href="../abcd/index.html" ${current==='abcd'?'aria-current="page"':''}>ABCD · 0 papers</a></div>`;

const library = shell({title:'Ideas worth building on',description:'A visual research library connecting papers to the ABCD and Torch-Helion projects.',depth:1,body:`
<section class="library-hero library-overview"><div><span class="kicker">The research library / 01</span><h1>Ideas worth<br><em>building on.</em></h1><p>Papers connected to the projects I’m building. Explore the big idea, play with a small example, and follow the trail back to the source.</p><div class="lib-meta"><span><b>02</b> project shelves</span><span><b>${String(papers.length).padStart(2,'0')}</b> visual explainers</span><span>Start with curiosity</span></div></div></section>
<div class="shelf-heading"><h2>Choose a project.</h2><small>A home for the ideas behind the work</small></div>
<section class="collection-grid" aria-label="Project shelves"><a class="collection" href="./torch-helion/index.html"><span class="collection-number">01 / Compiler systems</span><h3>Torch-Helion</h3><p>Move less data. Find better schedules. Explore the decisions that make tensor programs efficient.</p><div class="mini-map">${visual('vtc')}</div><div class="collection-footer"><span>${papers.length} papers · Diagrams + interactive examples</span><span>Explore shelf ↗</span></div></a><a class="collection quiet" href="./abcd/index.html"><span class="collection-number">02 / Project collection</span><h3>ABCD</h3><p>A dedicated shelf for the ABCD project. The first reading collection is still to come.</p><div class="empty-mark" aria-hidden="true">[ &nbsp; ]</div><div class="collection-footer"><span>0 papers · Collection in preparation</span><span>Visit shelf ↗</span></div></a></section>
<section class="primer"><div><span class="kicker">How to read this library</span><h2>Start with the picture.</h2><p>No compiler background required.</p></div><dl class="primer-terms"><div><dt>01 · Get the idea</dt><dd>One plain-language takeaway and a before/after diagram.</dd></div><div><dt>02 · Try it yourself</dt><dd>A small interactive example with visible numbers.</dd></div><div><dt>03 · Connect the dots</dt><dd>The contribution, a project connection, and evidence with its limits.</dd></div></dl></section>`});

const glossary=`<section class="primer" id="basics"><div><span class="kicker">A 60-second starting point</span><h2>Moving numbers can cost more than calculating.</h2><p>These papers attack different parts of that problem.</p></div><dl class="primer-terms"><div><dt>Tensor</dt><dd>An array of numbers. A matrix is a 2D tensor.</dd></div><div><dt>Operator / kernel</dt><dd>The mathematical task / the program that executes it.</dd></div><div><dt>Fusion</dt><dd>Connect operations so intermediate results can be reused.</dd></div><div><dt>Tile</dt><dd>A smaller piece of a tensor processed at a time.</dd></div><div><dt>Layout</dt><dd>The arrangement of tensor elements in memory.</dd></div><div><dt>Cost model</dt><dd>An estimate of execution time, energy, or resource use.</dd></div></dl></section>`;
const card = (p,i) => `<a class="reading-card" data-paper data-category="${p.category}" data-search="${esc([p.name,p.title,p.topic,p.category,p.hook].join(' ').toLowerCase())}" href="./${p.id}.html"><div class="card-art">${visual(p.id)}</div><div class="reading-copy"><span class="kicker">${String(i+1).padStart(2,'0')} / ${p.topic}</span><h3>${p.name}</h3><p class="paper-hook">${p.hook}</p><div class="card-end"><span>${p.venue}<br>${p.time} min · Interactive example</span><b aria-hidden="true">↗</b></div></div></a>`;
const torch = shell({title:'Torch-Helion',description:'Beginner-friendly visual guides to tensor compilers, data movement, fusion, layouts, and scheduling.',body:`
${bread('Torch-Helion')}${collectionTabs('torch')}<section class="library-hero"><div><span class="kicker">Project shelf 01 / Visual reading guides</span><h1>Torch-Helion<span style="color:var(--blue)">.</span></h1><p>Explore how tensor compilers avoid unnecessary work and map calculations onto hardware. Small examples first; compiler ideas follow.</p><div class="lib-meta"><span><b>${String(papers.length).padStart(2,'0')}</b> papers</span><span><b>${String(papers.length).padStart(2,'0')}</b> interactive examples</span><span>Beginner friendly</span></div></div>${heroArt('overview','The shared question','Where does the data go?')}</section>
${glossary}<section aria-labelledby="reading-order"><span class="kicker" id="reading-order">Suggested path · from concrete ideas to planning</span><div class="reading-route">${['vtc','tensor-seeks-layout','graphturbo','fuseflow','fast-and-fusiest','t10'].map((id,i)=>`${i?'<span aria-hidden="true">→</span>':''}<a href="./${id}.html">${papers.find(p=>p.id===id).name}</a>`).join('')}</div><span class="kicker">Next · from programming models to automatic planning</span><div class="reading-route">${['dato','tileloom','set','stream','nautilus','mirage'].map((id,i)=>`${i?'<span aria-hidden="true">→</span>':''}<a href="./${id}.html">${papers.find(p=>p.id===id).name}</a>`).join('')}</div></section>
<div class="shelf-heading"><h2>On the reading desk.</h2><small>Open a paper to explore</small></div><div class="shelf-tools" data-enhanced hidden><label>Find a paper or idea<input type="search" id="paper-search" placeholder="Try “layout”, “memory”, or “fusion”…" autocomplete="off"></label><div class="shelf-filters" role="group" aria-label="Filter papers by idea">${[['all','All ideas'],['movement','Data movement'],['fusion','Fusion'],['planning','Planning']].map(([id,label])=>`<button data-category-filter="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div></div><p class="search-status" id="search-status" aria-live="polite">${papers.length} papers in this collection</p><section class="paper-grid" aria-label="Torch-Helion papers">${papers.map(card).join('')}</section><p id="no-results" class="notice" hidden>No matching papers. Try a broader term or select All ideas.</p>
<section class="connections"><div class="shelf-heading"><h2>From reading to building.</h2><small>Possible connections to Torch-Helion</small></div><div class="connection-grid">${papers.map(p=>`<a href="./${p.id}.html#project"><strong>${p.name} ↗</strong><span>${p.bridge[0]} → ${p.bridge[1]}</span></a>`).join('')}</div><p style="font-size:12px;margin-top:17px">These are research directions to explore, not claims that Torch-Helion implements or reproduces the papers.</p></section>`});

const abcd = shell({title:'ABCD',description:'The ABCD project reading collection. Papers will be added here as the collection develops.',body:`${bread('ABCD')}${collectionTabs('abcd')}<section class="library-hero"><div><span class="kicker">Project shelf 02</span><h1>ABCD<span style="color:var(--blue)">.</span></h1><p>A place for the papers and ideas connected to the ABCD project.</p><div class="lib-meta"><span><b>00</b> papers</span><span>Collection in preparation</span></div></div></section><section class="empty-shelf"><div class="shelf-icon" aria-hidden="true">[ &nbsp; ]</div><h2>The first page is still ahead.</h2><p>No papers have been added to this collection yet. In the meantime, explore the visual explainers on the Torch-Helion shelf.</p><a class="button primary" href="../torch-helion/index.html">Explore Torch-Helion ↗</a></section>`});

function controls(p) {
  const common='class="demo-controls" data-enhanced hidden';
  if(p.demoModes) return `<div ${common}><div class="segmented" role="group" aria-label="${esc(p.demoTitle)}">${p.demoModes.map(([mode,label],i)=>`<button data-choice="${mode}" aria-pressed="${i===0}">${label}</button>`).join('')}</div></div>`;
  switch(p.id) {
    case 'vtc':return `<div ${common}><div class="segmented" role="group" aria-label="Array representation"><button data-mode="copy" aria-pressed="true">Physical copy</button><button data-mode="virtual" aria-pressed="false">Virtual view</button></div></div>`;
    case 'fuseflow':return `<div ${common}><button class="button primary" data-next>Advance streams →</button><button class="button" data-reset>Reset</button></div>`;
    case 'graphturbo':return `<div ${common}><label>Stage<select id="memory-stage"><option value="6">Early stage · 6 slots per tile</option><option value="3">Later stage · 3 slots per tile</option></select></label><label>Image tiles: <output id="tile-count" for="memory-tiles">1</output><input id="memory-tiles" type="range" min="1" max="3" value="1" step="1"></label></div>`;
    case 'tensor-seeks-layout':return `<div ${common}><label>Conversion cost: <output id="conversion-value" for="conversion-cost">5</output> time units<input id="conversion-cost" type="range" min="0" max="8" step="1" value="5"></label></div>`;
    case 'fast-and-fusiest':return `<div ${common}><label>Memory budget: <output id="budget-value" for="plan-budget">8</output> units<input id="plan-budget" type="range" min="2" max="9" step="1" value="8"></label><button class="button primary" data-prune>Prune dominated plan</button><button class="button" data-reset>Reset</button></div>`;
    case 't10':return `<div ${common}><button class="button primary" data-next>Compute first pieces →</button><button class="button" data-reset>Reset</button></div>`;
  }
}
function fallback(p) {
  const examples={
    vtc:'A = [10, 20, 30, 40, 50, 60]. A copied slice stores [40, 50, 60] in 3 extra slots. A virtual slice uses the rule view[i] = A[i + 3] and stores no extra values.',
    fuseflow:'Match coordinates, not positions in the compressed lists: A has (0, 2), (2, 3); B has (1, 4), (2, 5). Only coordinate 2 matches. Result = 3 × 5 = 15.',
    graphturbo:'Early stage: 1 × 6 = 6 of 8 slots, so one tile fits. Later stage: 2 × 3 = 6 of 8 slots, so two tiles fit. Three later-stage tiles require 9 slots and exceed capacity.',
    'tensor-seeks-layout':'With conversion cost 5: local favorites cost 1 + 5 + 1 = 7; a common layout costs 2 + 1 = 3. At conversion cost 0, the local-favorite plan wins, 2 versus 3.',
    'fast-and-fusiest':'Plan A: time 2, memory 8. Plan B: time 3, memory 3. Plan C: time 4, memory 9. C is dominated by A and B. A wins with budget 8; B wins with budget 3; neither fits budget 2.',
    t10:'Core 0 has input [1, 2], core 1 has [3, 4]. W₀ = [1, 0], W₁ = [0, 2]. Compute local pieces; exchange W₀ and W₁; compute the remaining columns. Outputs: core 0 [1, 4], core 1 [3, 8].'
  };
  return `<p>${p.exampleFallback || examples[p.id]}</p>`;
}
const sectionHeading=(n,id,title)=>`<div class="lesson-heading"><span>${n}</span><h2 id="${id}">${title}</h2></div>`;
const flow=nodes=>`<div class="flow-stack">${nodes.map(([title,caption,cls],i)=>`${i?'<span class="flow-arrow" aria-hidden="true">↓</span>':''}<div class="flow-node ${cls||''}">${title}<small>${caption}</small></div>`).join('')}</div>`;
function article(p,index) {
  const pdf=p.pdfUrl;
  const related=papers.find(x=>x.id===p.related);
  const previous=papers[(index+papers.length-1)%papers.length];
  const next=papers[(index+1)%papers.length];
  return shell({title:p.name,description:p.takeaway,body:`${bread(p.name,true)}
  <article><header class="library-hero article-hero"><div><span class="kicker">${String(index+1).padStart(2,'0')} / ${p.name} / ${p.topic}</span><h1>${p.headline.split('\n').map(esc).join('<br>')}</h1><p class="paper-title">${p.title}</p><p class="takeaway"><strong>${p.takeaway}</strong></p><div class="lib-meta"><span>${p.venue}</span><span>${p.time} min read</span><span>Beginner friendly</span></div><div class="article-actions"><a class="button primary" href="#example">Try the example ↓</a><a class="button" href="${p.sourceUrl}" target="_blank" rel="noopener">Paper on ${p.sourceLabel} ↗</a><a class="button" href="${pdf}" target="_blank" rel="noopener">PDF ↗</a></div></div>${heroArt(p.id,p.name+' / The idea','Illustrative · not benchmark data')}</header>
  <div class="article-layout"><aside class="article-rail" aria-label="Reading navigation"><div class="rail-group"><p class="rail-title">Torch-Helion / ${papers.length} papers</p>${papers.map((item,i)=>`<a href="./${item.id}.html" ${p.id===item.id?'aria-current="page"':''}>${String(i+1).padStart(2,'0')} &nbsp; ${item.name}</a>`).join('')}<a href="./index.html">← Back to the shelf</a></div><div class="rail-group"><p class="rail-title">In this explainer</p><div><a href="#intuition">01 · The intuition</a><a href="#example">02 · Try an example</a><a href="#contribution">03 · The contribution</a><a href="#project">04 · Project connection</a><a href="#evidence">05 · The evidence</a><a href="#sources">Source notes ↗</a></div></div></aside>
  <div class="article-content"><section class="lesson" aria-labelledby="intuition">${sectionHeading('01','intuition','First, picture the problem.')}<p class="lesson-intro">${p.problem}</p><div class="analogy"><span class="analogy-icon" aria-hidden="true">↳</span><span>${p.analogy}</span></div><div class="comparison"><figure class="compare-panel"><span class="panel-label">Before / the friction</span>${flow(p.before)}<figcaption>${p.beforeCaption}</figcaption></figure><figure class="compare-panel improved"><span class="panel-label">After / the key idea</span>${flow(p.after)}<figcaption>${p.afterCaption}</figcaption></figure></div></section>
  <section class="lesson" aria-labelledby="example">${sectionHeading('02','example','Make it concrete.')}<div class="demo" data-demo="${p.id}"><div class="demo-heading"><h3>${p.demoTitle}</h3><span class="toy-label">Interactive · toy example</span></div><p>${p.demoIntro}</p>${controls(p)}<div class="demo-output" data-output aria-live="polite" aria-atomic="true">${fallback(p)}</div><p class="demo-footnote">Invented teaching example. Values and costs here are not measurements from the paper.</p><noscript><p class="demo-footnote">Enable JavaScript to change the example; the worked example above is available without it.</p></noscript></div></section>
  <section class="lesson" aria-labelledby="contribution">${sectionHeading('03','contribution','What did the paper add?')}<div class="method-grid">${p.methods.map(([title,body],i)=>`<div class="method-card"><span class="step-number">${String(i+1).padStart(2,'0')}</span><h3>${title}</h3><p>${body}</p></div>`).join('')}</div><p class="contribution"><strong>The contribution:</strong> ${p.contribution}</p><a class="inline-link" style="font-size:12px" href="${pdf}#page=${p.sourceSections[0][1]}" target="_blank" rel="noopener">Follow the idea in the source paper ↗</a></section>
  <section class="lesson" aria-labelledby="project">${sectionHeading('04','project','Bring the idea to Torch-Helion.')}<div class="project-bridge"><span class="kicker">A possible research direction</span><div class="bridge-path">${p.bridge.map((part,i)=>`${i?'<b aria-hidden="true">→</b>':''}<span>${part}</span>`).join('')}</div><p>${p.connection}</p><p><strong>Small experiment:</strong> ${p.experiment}</p><p><strong>Keep in mind:</strong> ${p.caution}</p></div><p style="font-size:12px;margin-top:15px">This connection is an interpretation for the project, not an implementation or performance claim by the paper.</p></section>
  <section class="lesson" aria-labelledby="evidence">${sectionHeading('05','evidence','Read the result in context.')}<div class="evidence-grid">${p.evidence.map(([number,label,body])=>`<div><span class="kicker">${label}</span><div class="evidence-number" ${number.length>12?'style="font-size:36px"':''}>${number}</div><p>${body}</p></div>`).join('')}</div><div class="evidence-note"><strong>Scope matters.</strong> ${p.limitation}</div><a class="source-ref" href="${pdf}#page=${p.evidencePage}" target="_blank" rel="noopener">Source: ${p.evidenceSections} ↗</a>${p.id==='tensor-seeks-layout'?`<figure class="compare-panel" style="margin-top:22px"><span class="panel-label">ResNet-50 · AWS Trainium · millions of cycles · lower is better</span><div class="cost-row"><span>Rule-based</span><div class="cost-track"><span class="cost-segment" style="width:32.71%"></span></div><span class="cost-value">20.9</span></div><div class="cost-row"><span>Solver-based</span><div class="cost-track"><span class="cost-segment copy" style="width:100%"></span></div><span class="cost-value">63.9</span></div><figcaption>Actual execution can disagree with the optimization objective. Source: Table 1.</figcaption></figure>`:''}</section>
  <section class="sources" id="sources"><details><summary>Source notes &amp; further reading</summary><p class="full-title">${p.title}</p><p>${p.authors}. ${p.venue}.</p><p><a href="${p.sourceUrl}" target="_blank" rel="noopener">Public paper page on ${p.sourceLabel} ↗</a></p><ul>${p.sourceSections.map(([label,page])=>`<li><a href="${pdf}#page=${page}" target="_blank" rel="noopener">${label} · PDF page ${page} ↗</a></li>`).join('')}</ul><p>Based on the source paper. Diagrams and toy examples are original teaching illustrations; they simplify the method. PDF links use viewer page numbers, which may differ from printed proceedings numbers.</p>${p.id==='fast-and-fusiest'?'<p>The supplied manuscript labels itself MICRO 2026 and contains a placeholder DOI. This page cites that supplied version.</p>':''}${p.sourceNote?`<p>${p.sourceNote}</p>`:''}<p><a href="./${related.id}.html">Connect this to ${related.name} ↗</a> ${p.relatedReason}</p></details></section><div class="next-papers"><a href="./${previous.id}.html"><small>← Previous on the shelf</small>${previous.name}</a><a href="./${next.id}.html"><small>Next on the shelf →</small>${next.name}</a></div></div></div></article>`});
}

await mkdir('site/library/torch-helion',{recursive:true});
await mkdir('site/library/abcd',{recursive:true});
await writeFile('site/library/index.html',library);
await writeFile('site/library/torch-helion/index.html',torch);
await writeFile('site/library/abcd/index.html',abcd);
for(const [index,paper] of papers.entries()) await writeFile(`site/library/torch-helion/${paper.id}.html`,article(paper,index));
console.log(`Generated Library, two project shelves, and ${papers.length} standalone paper explainers.`);
