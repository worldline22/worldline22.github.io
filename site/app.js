import { config } from './config.js';
import { startGraph } from './graph.js';
const main = document.querySelector('main');
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data = { projects: [], papers: [], notes: [] }, cleanup = () => {};
let loadError = false;
const projectCard = p => `<a class="project-card" href="#/projects/${encodeURIComponent(p.id)}"><div class="card-top"><span class="mini-diagram" aria-hidden="true">${esc(p.symbol || '⌘')}</span><span class="tag ${p.status === 'Ongoing' ? '' : 'neutral'}">${esc(p.status)}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><div class="card-bottom"><span>${esc(p.category)}</span><b aria-hidden="true">↗</b></div></a>`;
const heading = (n,title,link='',label='View all') => `<div class="section-heading"><span class="section-index">${n}</span><h2>${title}</h2>${link?`<a href="${link}">${label} ↗</a>`:''}</div>`;
const noteRow = n => `<a class="note-row" href="#/notes/${encodeURIComponent(n.id)}"><small>${esc(n.date)}${n.category?` <span class="tag neutral">${esc(n.category)}</span>`:''}</small><h3>${esc(n.title)} <span aria-hidden="true">↗</span></h3><p>${esc(n.summary)}</p></a>`;
const emptyNotes = `<div class="empty"><h3>A notebook in the making.</h3><p>Reading notes and reflections on AI systems, compilers, and computer architecture will appear here.</p></div>`;
const paperRow = p => `<article class="publication"><span class="venue">${esc(p.status)}</span><div><h3><a href="#/papers/${encodeURIComponent(p.id)}">${esc(p.title)}: ${esc(p.summary)}</a></h3><p>${esc(p.authors || p.organization)}</p></div><a href="#/papers/${encodeURIComponent(p.id)}">Read ↗</a></article>`;
function home() {
  return `<section class="hero hero-immersive" aria-labelledby="hero-title"><div class="hero-meta"><span>Yuchao Qin / Research portfolio</span><span>Singapore · NUS</span></div><h1 id="hero-title" class="hero-title"><span>Yuchao’s</span><span class="homepage-word">homepage<span class="name-period">.</span></span></h1><div class="visual"><canvas id="research-graph" role="img" aria-label="Three-dimensional neural network with data flowing from input through hidden layers to output"></canvas></div><div class="hero-intro"><p>Exploring the architecture<br>of intelligent computing.</p><a class="hero-cv" href="./assets/yuchaoCV.pdf" target="_blank" rel="noopener">Curriculum vitae <span aria-hidden="true">↗</span></a></div><div class="hero-affiliation"><span>Ph.D. student, Computer Science</span><strong>National University of Singapore</strong><span>Advised by Prof. Tulika Mitra</span></div><div class="hero-bottom"><a href="#research" class="scroll-cue" data-scroll="research"><span class="scroll-circle" aria-hidden="true">↓</span> Scroll to explore</a><span class="visual-label">NEURAL NETWORK / FORWARD PASS</span><button class="motion-button" id="motion-toggle" aria-label="Pause animation">Pause motion Ⅱ</button></div></section>
  <section class="profile-section" id="research"><div class="profile-label"><span class="section-index">01 / Research focus</span><span class="profile-cross" aria-hidden="true">✳</span></div><div class="profile-layout"><h2>Intelligent systems.<br>Thoughtful design.<br><em>Efficient computing.</em></h2><div class="profile-copy"><p>I work at the intersection of <strong>computer architecture, compilers, and AI systems</strong> — exploring how better hardware and software can make intelligent computing more efficient.</p><p>I’m a Ph.D. student at the National University of Singapore, advised by <strong>Prof. Tulika Mitra</strong>. I studied Applied Physics at Peking University, with research experience at Stanford and ByteDance Seed.</p><div class="links"><a href="mailto:qinyuchao@stu.pku.edu.cn">Email ↗</a><a href="https://github.com/worldline22" target="_blank" rel="noopener">GitHub ↗</a></div></div></div></section>
  <div class="interest-bar"><span class="section-index">Research interests</span><span>Computer architecture</span><i> / </i><span>Efficient AI systems</span><i> / </i><span>Compiler optimization</span></div>
  <section class="section home-papers">${heading('02','Selected papers','#/papers','All papers')}${data.papers.map(paperRow).join('') || '<p class="empty">Papers will appear here.</p>'}</section>
  <section class="section home-projects">${heading('03','Selected projects','#/projects','All projects')}<div class="project-grid">${data.projects.slice(0,3).map(projectCard).join('') || '<p class="empty">Projects will appear here.</p>'}</div></section>
  <div class="lower-grid"><section class="section">${heading('04','Education')}<div class="education-row"><span class="school-mark">NUS</span><div><h3>National University of Singapore</h3><p>Ph.D. in Computer Science</p><small>2026–Present · Advisor: Prof. Tulika Mitra</small></div></div><div class="education-row"><span class="school-mark">PKU</span><div><h3>Peking University</h3><p>B.S. in Applied Physics</p><small>2022–2026 · Department of EECS</small></div></div><p class="about-personal">Beyond research, I enjoy football. At Peking University, I captained the EECS soccer team.</p></section><section class="section">${heading('05','From the notebook','#/notes','All notes')}${data.notes.slice(0,2).map(noteRow).join('') || emptyNotes}</section></div>`;
}
function paragraphs(text) {
  return String(text||'').split(/\n\s*\n/).map(block=>block.startsWith('## ') ? `<h2>${esc(block.slice(3))}</h2>` : `<p>${esc(block)}</p>`).join('');
}
function render() {
  cleanup();
  const parts = location.hash.replace(/^#\/?/,'').split('/');
  const page = ['main','research'].includes(parts[0]) ? 'home' : parts[0] || 'home';
  document.body.dataset.page=page;
  let id; try { id = decodeURIComponent(parts[1] || ''); } catch { id=''; }
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.title = `${page === 'home' ? 'Yuchao’s homepage' : page[0].toUpperCase()+page.slice(1)+' · Yuchao Qin'} · Computer Architecture & AI Systems`;
  if (page==='home') main.innerHTML=home();
  else if((page==='projects'||page==='papers'||page==='notes')&&id){
    const item=data[page].find(p=>p.id===id);
    if(!item) main.innerHTML=`<section class="detail"><a class="back" href="#/${page}">← Back to ${page}</a><h1>Page not found.</h1><p>This entry is unavailable or is private.</p></section>`;
    else {
      document.title=`${item.title} · Yuchao Qin`;
      main.innerHTML=`<article class="detail"><a class="back" href="#/${page}">← All ${page}</a><div class="section-index">${esc(item.category)}</div><h1>${esc(item.title)}</h1><p class="lead">${esc(item.summary)}</p><div class="detail-meta"><span>${esc(item.date)}</span>${item.status?`<span class="tag">${esc(item.status)}</span>`:''}${item.organization?`<span>${esc(item.organization)}</span>`:''}</div><div class="prose">${item.authors?`<p>${esc(item.authors)}</p>`:''}${paragraphs(item.body)}</div>${/^https:\/\//.test(item.url||'')?`<a class="button" href="${esc(item.url)}" target="_blank" rel="noopener">${page==='notes'?'Source':page==='papers'?(item.id==='chronomem'?'Presentation':'Read paper'):'Project resource'} ↗</a>`:''}</article>`;
    }
  }
  else if(page==='projects') main.innerHTML=`<section class="page-header"><span class="section-index">Research & engineering</span><h1>Projects<span style="color:var(--blue)">.</span></h1><p>From model-training frameworks to specialized hardware. A selection of my research and engineering work.</p></section><section class="projects-page"><div class="filters" aria-label="Filter projects">${['All projects','AI systems','Computer architecture','Hardware design'].map((x,i)=>`<button class="filter" data-filter="${x}" aria-pressed="${i===0}">${x}</button>`).join('')}</div><div class="project-grid" id="project-results">${data.projects.map(projectCard).join('')}</div></section>`;
  else if(page==='papers') main.innerHTML=`<section class="page-header"><span class="section-index">Publications & presentations</span><h1>Papers<span style="color:var(--blue)">.</span></h1><p>Research on efficient architectures, lossless compression, and memory-aware computing.</p></section><section class="section">${data.papers.map(paperRow).join('') || '<p class="empty">Papers will appear here.</p>'}</section>`;
  else if(page==='notes') main.innerHTML=`<section class="page-header"><span class="section-index">The research notebook</span><h1>Notes<span style="color:var(--blue)">.</span></h1><p>A place for questions, reading notes, and ideas at the edges of what I understand.</p></section><section class="notes-list">${data.notes.map(noteRow).join('') || emptyNotes}</section>`;
  else if(page==='studio') main.innerHTML=`<section class="detail"><div class="section-index">Owner access</div><h1>Private workspace.</h1><p class="lead">A quiet space for work in progress.</p>${config.apiBase?`<p>Sign in with your personal access key to manage projects, papers, and notes.</p><a class="button primary" href="${esc(config.apiBase)}/signin">Open private workspace ↗</a>`:`<div class="notice">The private workspace is waiting for its Cloudflare connection. Private content is not available on this public site.</div>`}</section>`;
  else main.innerHTML='<section class="detail"><h1>Page not found.</h1><a class="button" href="#/">Return home</a></section>';
  if(loadError && ['projects','papers','notes'].includes(page)) main.insertAdjacentHTML('afterbegin','<p class="notice" role="status">Content could not be loaded. Please refresh to try again.</p>');
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const items=data.projects.filter(p=>button.dataset.filter==='All projects'||p.category===button.dataset.filter);document.querySelector('#project-results').innerHTML=items.map(projectCard).join('')||'<p class="empty">No projects in this category yet.</p>';}));
  const canvas=document.querySelector('canvas');const stopGraph=canvas?startGraph(canvas):()=>{};
  const stopReveal=startReveals();cleanup=()=>{stopGraph();stopReveal();};
  document.querySelector('[data-scroll]')?.addEventListener('click',event=>{event.preventDefault();document.querySelector('#research')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
}
function startReveals(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return()=>{};
  const elements=[...document.querySelectorAll('.profile-layout,.interest-bar,.section-heading,.publication,.project-card,.education-row,.note-row')];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08});
  elements.forEach(element=>{element.classList.add('reveal-ready');observer.observe(element);});
  return()=>observer.disconnect();
}
const themeButton=document.querySelector('#theme-toggle');
function themeLabel(){const dark=document.documentElement.dataset.theme==='dark';themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);themeButton.textContent=dark?'☼':'◐';}
themeButton.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('yq-theme',document.documentElement.dataset.theme);}catch{}themeLabel();});themeLabel();
document.querySelector('#year').textContent=new Date().getFullYear();
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);main.focus({preventScroll:true});});
try{const res=await fetch(config.apiBase?`${config.apiBase}/api/public/content`:'./content.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error('Content unavailable');const value=await res.json();data={projects:(value.projects||[]).filter(p=>p.visibility==='public'),papers:(value.papers||[]).filter(p=>p.visibility==='public'),notes:(value.notes||[]).filter(n=>n.visibility==='public')};}catch{loadError=true;}
render();
