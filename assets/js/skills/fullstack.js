
// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
}, { passive: true });
document.querySelectorAll('a,.demo-tab,.arch-btn,.layer-opt,.check-item,.cap-card,.stack-badge').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='56px'; ring.style.height='56px'; ring.style.borderColor='rgba(225,29,72,0.7)'; }, { passive: true });
  el.addEventListener('mouseleave', () => { ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(225,29,72,0.5)'; }, { passive: true });
});

// SCROLL REVEAL
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

const scrollOrb1 = document.querySelector('.orb1');
const scrollOrb2 = document.querySelector('.orb2');
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      scrollOrb1.style.transform = `translateY(${y*0.08}px)`;
      scrollOrb2.style.transform = `translateY(${-y*0.06}px)`;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// HERO — LIVE CODE TYPING ANIMATION
(function() {
  const lines = [
    {t:'cm', txt:'# Full-stack app — React + FastAPI + PostgreSQL'},
    {t:'', txt:''},
    {t:'kw', txt:'from', rest:' fastapi import FastAPI, Depends'},
    {t:'kw', txt:'from', rest:' sqlalchemy.orm import Session'},
    {t:'kw', txt:'from', rest:' anthropic import Anthropic'},
    {t:'', txt:''},
    {t:'fn', txt:'app', rest:' = FastAPI(title="TaskFlow API")'},
    {t:'fn', txt:'ai', rest:' = Anthropic()'},
    {t:'', txt:''},
    {t:'cm', txt:'# React frontend state'},
    {t:'kw', txt:'const', rest:' [tasks, setTasks] = useState([])'},
    {t:'kw', txt:'const', rest:' [loading, setLoading] = useState(false)'},
    {t:'', txt:''},
    {t:'cm', txt:'# FastAPI endpoint'},
    {t:'', txt:'@app.post(', color2:'str', rest2:'"/tasks")'},
    {t:'kw', txt:'async def', rest:' create_task(task: TaskSchema,'},
    {t:'', txt:'    db: Session = Depends(get_db)):'},
    {t:'kw', txt:'    ', rest:'db_task = Task(**task.dict())'},
    {t:'', txt:'    db.add(db_task)'},
    {t:'', txt:'    db.commit()'},
    {t:'kw', txt:'    return', rest:' {"status": "created", "id": db_task.id}'},
    {t:'', txt:''},
    {t:'cm', txt:'# AI integration'},
    {t:'kw', txt:'async def', rest:' ai_summarize(tasks):'},
    {t:'', txt:'    response = ai.messages.create('},
    {t:'', txt:'        model=', color2:'str', rest2:'"claude-sonnet-4-20250514"'},
    {t:'', txt:'    )'},
    {t:'kw', txt:'    return', rest:' response.content[0].text'},
  ];

  const body = document.getElementById('terminalBody');
  let lineIdx = 0, charIdx = 0;
  let currentEl = null;

  function type() {
    if(lineIdx >= lines.length) {
      setTimeout(() => { body.innerHTML=''; lineIdx=0; charIdx=0; type(); }, 2000);
      return;
    }
    const line = lines[lineIdx];
    if(charIdx === 0) {
      const div = document.createElement('div');
      div.className = 't-line';
      div.innerHTML = '<span class="t-prompt">❯</span>';
      const span = document.createElement('span');
      span.className = 't-code';
      div.appendChild(span);
      body.appendChild(div);
      currentEl = span;
      if(body.children.length > 18) body.removeChild(body.children[0]);
    }

    const fullText = line.txt + (line.rest||'') + (line.rest2||'');
    if(charIdx < fullText.length) {
      let display = '';
      if(line.t==='cm') display = `<span class="t-comment">${fullText.slice(0,charIdx+1)}</span>`;
      else if(line.t==='kw') display = `<span class="t-kw">${line.txt}</span><span>${(line.rest||'').slice(0, Math.max(0,charIdx-line.txt.length+1))}</span>`;
      else if(line.t==='fn') display = `<span class="t-fn">${line.txt}</span><span>${(line.rest||'').slice(0, Math.max(0,charIdx-line.txt.length+1))}</span>`;
      else display = fullText.slice(0, charIdx+1);
      currentEl.innerHTML = display + '<span class="t-cursor"></span>';
      charIdx++;
      setTimeout(type, 18+Math.random()*20);
    } else {
      if(line.t==='cm') currentEl.innerHTML = `<span class="t-comment">${fullText}</span>`;
      else if(line.t==='kw') currentEl.innerHTML = `<span class="t-kw">${line.txt}</span>${line.rest||''}`;
      else if(line.t==='fn') currentEl.innerHTML = `<span class="t-fn">${line.txt}</span>${line.rest||''}`;
      else currentEl.innerHTML = fullText;
      lineIdx++; charIdx=0;
      setTimeout(type, 60);
    }
  }
  setTimeout(type, 800);
})();

// DEMO 1: MINI APP
let tasks = [
  {id:1,text:'Build React frontend',priority:'high',done:true},
  {id:2,text:'Set up FastAPI backend',priority:'high',done:true},
  {id:3,text:'Connect PostgreSQL database',priority:'med',done:false},
  {id:4,text:'Add AI summarization',priority:'med',done:false},
  {id:5,text:'Deploy to Railway',priority:'low',done:false},
];
let nextId = 6;

function beLog(msg, type='info') {
  const log = document.getElementById('beLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${msg}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
  if(log.children.length > 20) log.removeChild(log.children[0]);
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const prioClass = {high:'p-high',med:'p-med',low:'p-low'};
  const prioLabel = {high:'High',med:'Medium',low:'Low'};
  list.innerHTML = tasks.map(t => `
    <div class="task-item ${t.done?'done':''}" id="task-${t.id}">
      <div class="task-check ${t.done?'checked':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div>
      <span class="task-text">${t.text}</span>
      <span class="task-priority ${prioClass[t.priority]}">${prioLabel[t.priority]}</span>
      <span class="task-del" onclick="deleteTask(${t.id})">✕</span>
    </div>`).join('');
  document.getElementById('statTotal').textContent = tasks.length;
  document.getElementById('statDone').textContent = tasks.filter(t=>t.done).length;
  document.getElementById('statPending').textContent = tasks.filter(t=>!t.done).length;
}

function addTask() {
  const input = document.getElementById('taskInput');
  const prio = document.getElementById('taskPriority').value;
  const text = input.value.trim();
  if(!text) return;
  const task = {id:nextId++, text, priority:prio, done:false};
  tasks.push(task);
  input.value = '';
  beLog(`POST /api/tasks — "${text}" created`, 'req');
  setTimeout(()=>beLog(`201 Created — task.id: ${task.id}, priority: ${prio}`, 'res'), 120);
  setTimeout(()=>beLog(`INSERT INTO tasks VALUES (${task.id}, '${text}', '${prio}')`, 'info'), 240);
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t=>t.id===id);
  t.done = !t.done;
  beLog(`PATCH /api/tasks/${id} — done: ${t.done}`, 'req');
  setTimeout(()=>beLog(`200 OK — task updated`, 'res'), 100);
  renderTasks();
}

function deleteTask(id) {
  const t = tasks.find(t=>t.id===id);
  tasks = tasks.filter(t=>t.id!==id);
  beLog(`DELETE /api/tasks/${id}`, 'req');
  setTimeout(()=>beLog(`204 No Content — task deleted`, 'res'), 100);
  setTimeout(()=>beLog(`DELETE FROM tasks WHERE id=${id}`, 'info'), 200);
  renderTasks();
}
renderTasks();

// DEMO 2: ARCHITECTURE BUILDER
const archNodes = [];
let archCanvas, archCtx, archW, archH;
let dragging = null, dragOffX = 0, dragOffY = 0;

const nodeTypes = {
  frontend: {label:'React Frontend', icon:'🖥️', color:'#61dafb', desc:'UI Layer'},
  backend:  {label:'FastAPI Backend', icon:'⚙️',  color:'#10b981', desc:'Business Logic'},
  database: {label:'PostgreSQL',      icon:'🗄️',  color:'#818cf8', desc:'Data Layer'},
  cache:    {label:'Redis Cache',     icon:'⚡',  color:'#ef4444', desc:'Performance'},
  ai:       {label:'AI Service',      icon:'🤖',  color:'#a855f7', desc:'Intelligence'},
  cdn:      {label:'CDN / Storage',   icon:'🌐',  color:'#38bdf8', desc:'Static Assets'},
  queue:    {label:'Message Queue',   icon:'📬',  color:'#f97316', desc:'Async Tasks'},
};

function initArch() {
  archCanvas = document.getElementById('archCanvas');
  archCtx = archCanvas.getContext('2d');
  archCanvas.width = archW = archCanvas.offsetWidth;
  archCanvas.height = archH = 420;
  archCanvas.addEventListener('mousedown', onArchDown);
  window.addEventListener('mousemove', onArchMove);
  window.addEventListener('mouseup', ()=>dragging=null);
  drawArch();
}

function addArchNode(type) {
  const nt = nodeTypes[type];
  archNodes.push({
    type, label:nt.label, icon:nt.icon, color:nt.color, desc:nt.desc,
    x: 80 + Math.random()*(archW-200), y: 60 + Math.random()*(archH-160),
    w:130, h:60
  });
  document.getElementById('archInfo').textContent = `// ${nt.label} added — drag to position. ${archNodes.length} component${archNodes.length>1?'s':''} in architecture.`;
  drawArch();
}

function clearArch() { archNodes.length=0; document.getElementById('archInfo').textContent='// Architecture cleared. Add components above.'; drawArch(); }

function onArchDown(e) {
  const rect = archCanvas.getBoundingClientRect();
  const mx = (e.clientX-rect.left)*(archCanvas.width/rect.width);
  const my = (e.clientY-rect.top)*(archCanvas.height/rect.height);
  for(let i=archNodes.length-1;i>=0;i--) {
    const n=archNodes[i];
    if(mx>=n.x&&mx<=n.x+n.w&&my>=n.y&&my<=n.y+n.h) { dragging=n; dragOffX=mx-n.x; dragOffY=my-n.y; break; }
  }
}

function onArchMove(e) {
  if(!dragging||!archCanvas) return;
  const rect = archCanvas.getBoundingClientRect();
  dragging.x = Math.max(0,Math.min(archW-dragging.w,(e.clientX-rect.left)*(archCanvas.width/rect.width)-dragOffX));
  dragging.y = Math.max(0,Math.min(archH-dragging.h,(e.clientY-rect.top)*(archCanvas.height/rect.height)-dragOffY));
  drawArch();
}

function drawArch() {
  if(!archCtx) return;
  archCtx.clearRect(0,0,archW,archH);
  archCtx.fillStyle='rgba(3,5,8,0.98)'; archCtx.fillRect(0,0,archW,archH);

  if(archNodes.length===0) {
    archCtx.fillStyle='rgba(225,29,72,0.2)'; archCtx.font='14px DM Mono,monospace';
    archCtx.textAlign='center'; archCtx.fillText('// Add components to build your architecture', archW/2, archH/2);
    return;
  }

  // Auto-connect sequential nodes
  for(let i=0;i<archNodes.length-1;i++) {
    const a=archNodes[i], b=archNodes[i+1];
    const ax=a.x+a.w/2, ay=a.y+a.h/2, bx=b.x+b.w/2, by=b.y+b.h/2;
    archCtx.beginPath(); archCtx.moveTo(ax,ay); archCtx.lineTo(bx,by);
    archCtx.strokeStyle='rgba(225,29,72,0.25)'; archCtx.lineWidth=1.5;
    archCtx.setLineDash([4,4]); archCtx.stroke(); archCtx.setLineDash([]);

    // Arrow
    const angle=Math.atan2(by-ay,bx-ax);
    const mx2=(ax+bx)/2, my2=(ay+by)/2;
    archCtx.beginPath();
    archCtx.moveTo(mx2,my2);
    archCtx.lineTo(mx2-10*Math.cos(angle-0.4),my2-10*Math.sin(angle-0.4));
    archCtx.lineTo(mx2-10*Math.cos(angle+0.4),my2-10*Math.sin(angle+0.4));
    archCtx.closePath(); archCtx.fillStyle='rgba(225,29,72,0.4)'; archCtx.fill();

    // Packet animation
    const t=(Date.now()%2000)/2000;
    const px=ax+(bx-ax)*t, py=ay+(by-ay)*t;
    archCtx.beginPath(); archCtx.arc(px,py,4,0,Math.PI*2);
    archCtx.fillStyle=a.color; archCtx.shadowColor=a.color; archCtx.shadowBlur=8;
    archCtx.fill(); archCtx.shadowBlur=0;
  }

  archNodes.forEach(n => {
    archCtx.fillStyle=`${n.color}18`;
    archCtx.strokeStyle=`${n.color}80`; archCtx.lineWidth=1.5;
    roundRect(archCtx, n.x, n.y, n.w, n.h, 10);
    archCtx.fill(); archCtx.stroke();
    archCtx.font='16px serif'; archCtx.textAlign='center';
    archCtx.fillText(n.icon, n.x+22, n.y+n.h/2+6);
    archCtx.fillStyle=n.color; archCtx.font='600 10px DM Mono,monospace';
    archCtx.fillText(n.label, n.x+n.w/2+8, n.y+n.h/2-4);
    archCtx.fillStyle='rgba(255,255,255,0.3)'; archCtx.font='9px DM Mono,monospace';
    archCtx.fillText(n.desc, n.x+n.w/2+8, n.y+n.h/2+10);
  });

  requestAnimationFrame(drawArch);
}

function roundRect(ctx,x,y,w,h,r) {
  ctx.beginPath(); ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

// DEMO 3: STACK SELECTOR
const stackState = { frontend:'React', backend:'FastAPI', database:'PostgreSQL', ai:'Claude API', deploy:'Docker + Railway' };

function setStack(layer, val, el) {
  stackState[layer] = val;
  el.closest('.layer-options').querySelectorAll('.layer-opt').forEach(o=>o.classList.remove('active'));
  el.classList.add('active');
  renderStack();
}

function renderStack() {
  const {frontend, backend, database, ai, deploy} = stackState;
  const haAI = ai !== 'None';
  const isNext = frontend === 'Next.js';
  const isPG = database === 'PostgreSQL' || database === 'Supabase';

  document.getElementById('stackFileName').textContent = `${backend.toLowerCase().replace('.','')}_app.py`;

  const code = `<span class="c-cm"># ============================================</span>
<span class="c-cm"># Stack: ${frontend} + ${backend} + ${database}${haAI?' + '+ai:''}</span>
<span class="c-cm"># Deploy: ${deploy}</span>
<span class="c-cm"># ============================================</span>

<span class="c-kw">from</span> ${backend==='FastAPI'?'fastapi':backend==='Django'?'django.http':backend==='Flask'?'flask':'express'} <span class="c-kw">import</span> ${backend==='FastAPI'?'FastAPI, HTTPException':backend==='Flask'?'Flask, jsonify':''}
${isPG?`<span class="c-kw">from</span> sqlalchemy <span class="c-kw">import</span> create_engine, Column, Integer, String`:'<span class="c-kw">from</span> pymongo <span class="c-kw">import</span> MongoClient'}
${haAI && ai==='Claude API'?`<span class="c-kw">from</span> anthropic <span class="c-kw">import</span> Anthropic`:''}
${haAI && ai==='OpenAI'?`<span class="c-kw">from</span> openai <span class="c-kw">import</span> OpenAI`:''}

<span class="c-cm"># Initialize app</span>
<span class="c-fn">app</span> = ${backend==='FastAPI'?'FastAPI()':backend==='Flask'?'Flask(__name__)':'express()'}
${haAI?`<span class="c-fn">ai_client</span> = ${ai==='Claude API'?'Anthropic()':'OpenAI()'}`:''}

<span class="c-cm"># Database connection</span>
<span class="c-fn">DATABASE_URL</span> = <span class="c-str">"${isPG?`postgresql://user:pass@localhost/${database.toLowerCase()}`:`mongodb://localhost:27017/${database.toLowerCase()}`}"</span>

<span class="c-cm"># Main endpoint</span>
${backend==='FastAPI'?`@app.get(<span class="c-str">"/"</span>)
<span class="c-kw">async def</span> <span class="c-fn">root</span>():
    <span class="c-kw">return</span> {<span class="c-str">"stack"</span>: <span class="c-str">"${frontend} + ${backend}"</span>, <span class="c-str">"status"</span>: <span class="c-str">"running"</span>}`:`@app.route(<span class="c-str">"/"</span>)
<span class="c-kw">def</span> <span class="c-fn">index</span>():
    <span class="c-kw">return</span> jsonify({<span class="c-str">"stack"</span>: <span class="c-str">"${frontend} + ${backend}"</span>})`}

${haAI?`<span class="c-cm"># AI endpoint</span>
${backend==='FastAPI'?`@app.post(<span class="c-str">"/ai/analyze"</span>)
<span class="c-kw">async def</span> <span class="c-fn">analyze</span>(prompt: str):
    response = ai_client.messages.create(
        model=<span class="c-str">"${ai==='Claude API'?'claude-sonnet-4-20250514':'gpt-4o'}"</span>,
        max_tokens=<span class="c-acc">1000</span>,
        messages=[{<span class="c-str">"role"</span>: <span class="c-str">"user"</span>, <span class="c-str">"content"</span>: prompt}]
    )
    <span class="c-kw">return</span> {<span class="c-str">"result"</span>: response.content[<span class="c-acc">0</span>].text}`:''}
`:''}
<span class="c-cm"># Deploy: ${deploy}</span>
${deploy.includes('Docker')?`<span class="c-cm"># Dockerfile included — run: docker-compose up</span>`:deploy.includes('Vercel')?`<span class="c-cm"># vercel.json configured for serverless</span>`:`<span class="c-cm"># Push to GitHub Pages branch</span>`}`;

  document.getElementById('stackCode').innerHTML = code;
}
renderStack();

// DEMO 4: CHECKLIST
const checklists = [
  {
    title: '⚡ Performance', items: [
      {name:'Lazy loading implemented',desc:'Routes and heavy components load on demand',tag:'high',checked:true},
      {name:'Images optimized & compressed',desc:'WebP format, proper sizing, lazy load attr',tag:'high',checked:true},
      {name:'Bundle size analyzed',desc:'< 200KB initial JS bundle target',tag:'high',checked:false},
      {name:'API response caching',desc:'Redis or browser cache for frequent queries',tag:'med',checked:false},
      {name:'Database queries optimized',desc:'Indexes on foreign keys and search columns',tag:'high',checked:true},
      {name:'Lighthouse score > 90',desc:'Run audit before deployment',tag:'med',checked:false},
    ]
  },
  {
    title: '🔐 Security', items: [
      {name:'Auth tokens validated server-side',desc:'Never trust client-side auth state alone',tag:'crit',checked:true},
      {name:'SQL injection prevention',desc:'Parameterized queries or ORM used throughout',tag:'crit',checked:true},
      {name:'CORS configured correctly',desc:'Whitelist only trusted origins in production',tag:'crit',checked:false},
      {name:'Secrets in environment variables',desc:'No API keys or passwords in source code',tag:'crit',checked:true},
      {name:'Rate limiting on API',desc:'Prevent abuse with per-IP request limits',tag:'high',checked:false},
      {name:'HTTPS enforced',desc:'Redirect all HTTP traffic to HTTPS',tag:'high',checked:true},
    ]
  },
  {
    title: '🚀 Pre-launch', items: [
      {name:'Error boundaries in React',desc:'Graceful fallback UI for component failures',tag:'high',checked:false},
      {name:'404 and error pages',desc:'Custom error pages for common HTTP errors',tag:'med',checked:true},
      {name:'Mobile responsive tested',desc:'Tested on iOS and Android devices',tag:'high',checked:true},
      {name:'Environment variables set',desc:'All prod env vars configured in deployment',tag:'crit',checked:false},
      {name:'Database backups configured',desc:'Automated daily backups with retention',tag:'high',checked:false},
      {name:'Monitoring & alerts set up',desc:'Error tracking and uptime monitoring active',tag:'high',checked:true},
    ]
  },
  {
    title: '🧪 Code Quality', items: [
      {name:'TypeScript or type hints used',desc:'Types catch bugs before runtime',tag:'med',checked:true},
      {name:'API endpoints documented',desc:'Swagger/OpenAPI docs auto-generated',tag:'med',checked:true},
      {name:'Functions under 50 lines',desc:'Single responsibility principle applied',tag:'med',checked:false},
      {name:'Error handling at every layer',desc:'No unhandled promise rejections or exceptions',tag:'high',checked:true},
      {name:'Git commits are atomic',desc:'Each commit is one logical change',tag:'med',checked:true},
      {name:'README updated',desc:'Setup instructions, env vars documented',tag:'low',checked:false},
    ]
  }
];

function renderChecklist() {
  const grid = document.getElementById('checklistGrid');
  grid.innerHTML = checklists.map((cl, ci) => {
    const total = cl.items.length;
    const done = cl.items.filter(i=>i.checked).length;
    const pct = Math.round(done/total*100);
    const scoreColor = pct>=80?'#34d399':pct>=50?'#fbbf24':'#f87171';
    return `<div class="checklist-panel">
      <div class="checklist-header">
        <span class="checklist-title">${cl.title}</span>
        <span class="score-badge" style="color:${scoreColor}">${pct}%</span>
      </div>
      <div class="checklist-body">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:0.62rem;color:var(--muted);margin-bottom:12px;">${done}/${total} completed</div>
        ${cl.items.map((item, ii) => `
        <div class="check-item" onclick="toggleCheck(${ci},${ii})">
          <div class="check-box ${item.checked?'checked':''}">${item.checked?'✓':''}</div>
          <div class="check-text">
            <div class="check-name" style="color:${item.checked?'var(--muted)':'var(--text)'}; ${item.checked?'text-decoration:line-through':''}">${item.name}</div>
            <div class="check-desc">${item.desc}</div>
          </div>
          <span class="check-tag tag-${item.tag}">${item.tag}</span>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleCheck(ci, ii) {
  checklists[ci].items[ii].checked = !checklists[ci].items[ii].checked;
  renderChecklist();
}
renderChecklist();

// SWITCH DEMOS
function switchDemo(name, tabEl) {
  ['app','arch','stack','check'].forEach(d => document.getElementById(`demo-${d}`).style.display='none');
  document.getElementById(`demo-${name}`).style.display='block';
  document.querySelectorAll('.demo-tab').forEach(t=>t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
  if(name==='arch') setTimeout(()=>{ initArch(); drawArch(); },50);
  if(name==='stack') setTimeout(renderStack,50);
}
