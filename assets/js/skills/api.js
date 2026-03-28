
// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
}, { passive: true });
document.querySelectorAll('a,.demo-tab,.flow-btn,.method-btn,.cap-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='56px'; ring.style.height='56px'; ring.style.borderColor='rgba(16,185,129,0.7)'; }, { passive: true });
  el.addEventListener('mouseleave', () => { ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(16,185,129,0.5)'; }, { passive: true });
});

const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
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

// HERO — FLOWING DATA NODES ANIMATION
(function() {
  const canvas = document.getElementById('apiCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const services = [
    { x:210, y:60,  label:'Client',   icon:'💻', color:'#10b981' },
    { x:340, y:180, label:'Auth API', icon:'🔐', color:'#f59e0b' },
    { x:340, y:300, label:'REST API', icon:'⚡', color:'#10b981' },
    { x:210, y:360, label:'Database', icon:'🗄️', color:'#60a5fa' },
    { x:80,  y:300, label:'Cache',    icon:'⚡', color:'#a855f7' },
    { x:80,  y:180, label:'Webhook',  icon:'🔔', color:'#f87171' },
  ];

  const edges = [[0,1],[0,2],[1,2],[2,3],[2,4],[0,5],[4,3],[5,0]];
  const packets = [];

  function spawnPacket() {
    const edge = edges[Math.floor(Math.random()*edges.length)];
    const forward = Math.random() > 0.3;
    packets.push({
      from: forward ? edge[0] : edge[1],
      to: forward ? edge[1] : edge[0],
      t: 0,
      speed: 0.008 + Math.random()*0.012,
      color: services[forward?edge[0]:edge[1]].color,
      size: Math.random()*3+2,
    });
  }
  setInterval(spawnPacket, 400);

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(3,5,8,0.97)';
    ctx.fillRect(0,0,W,H);

    // edges
    edges.forEach(([a,b]) => {
      const sa = services[a], sb = services[b];
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.strokeStyle = 'rgba(16,185,129,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // packets
    for(let i=packets.length-1;i>=0;i--) {
      const p = packets[i];
      p.t += p.speed;
      if(p.t >= 1) { packets.splice(i,1); continue; }
      const s = services[p.from], e = services[p.to];
      const x = s.x + (e.x-s.x)*p.t;
      const y = s.y + (e.y-s.y)*p.t;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // service nodes
    services.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 28, 0, Math.PI*2);
      ctx.fillStyle = `${s.color}18`;
      ctx.strokeStyle = `${s.color}60`;
      ctx.lineWidth = 1.5;
      ctx.fill(); ctx.stroke();

      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.icon, s.x, s.y);

      ctx.font = '500 10px DM Mono, monospace';
      ctx.fillStyle = s.color;
      ctx.fillText(s.label, s.x, s.y+40);
    });

    ctx.fillStyle = 'rgba(16,185,129,0.3)';
    ctx.font = '11px DM Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// live data flow', 10, H-10);
    requestAnimationFrame(draw);
  }
  draw();
})();

// REQUEST BUILDER
let currentMethod = 'GET';
function setMethod(m, el) {
  currentMethod = m;
  document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('bodyField').style.display = (m==='GET'||m==='DELETE') ? 'none' : 'block';
}
setMethod('GET', document.querySelector('.method-btn.GET'));

const mockResponses = {
  GET: {
    'users': { status: 200, time: 142, body: `{\n  "data": [\n    { "id": 1, "name": "Nikola Titirinov", "role": "developer" },\n    { "id": 2, "name": "Alice Smith", "role": "designer" },\n    { "id": 3, "name": "Bob Jones", "role": "manager" }\n  ],\n  "total": 3,\n  "page": 1\n}` },
    'user': { status: 200, time: 89, body: `{\n  "id": 42,\n  "name": "Nikola Titirinov",\n  "role": "developer",\n  "skills": ["Python","AI","React"],\n  "available": true\n}` },
    'default': { status: 200, time: 112, body: `{\n  "status": "ok",\n  "message": "Request successful",\n  "timestamp": "${new Date().toISOString()}"\n}` },
  },
  POST: { status: 201, time: 203, body: `{\n  "id": 99,\n  "created": true,\n  "message": "Resource created successfully",\n  "timestamp": "${new Date().toISOString()}"\n}` },
  PUT: { status: 200, time: 178, body: `{\n  "id": 99,\n  "updated": true,\n  "message": "Resource updated successfully",\n  "changes": ["name","role"]\n}` },
  DELETE: { status: 204, time: 95, body: `{\n  "deleted": true,\n  "message": "Resource deleted",\n  "id": 99\n}` },
};

function sendRequest() {
  const body = document.getElementById('responseBody');
  const badge = document.getElementById('statusBadge');
  const timeEl = document.getElementById('respTime');
  const endpoint = document.getElementById('endpoint').value;

  body.textContent = '// Sending request...';
  badge.textContent = '⏳ Pending';
  badge.className = 'status-badge';

  const delay = 400 + Math.random()*600;
  setTimeout(() => {
    let resp;
    if(currentMethod === 'GET') {
      if(endpoint.includes('users')) resp = mockResponses.GET.users;
      else if(endpoint.includes('user')) resp = mockResponses.GET.user;
      else resp = mockResponses.GET.default;
    } else {
      resp = mockResponses[currentMethod];
    }

    const statusClass = resp.status < 300 ? 'status-200' : resp.status < 500 ? 'status-400' : 'status-500';
    badge.textContent = `${resp.status} ${resp.status===200?'OK':resp.status===201?'Created':resp.status===204?'No Content':'Error'}`;
    badge.className = `status-badge ${statusClass}`;
    timeEl.textContent = `${Math.round(delay)}ms`;
    body.textContent = resp.body;
  }, delay);
}

// FLOW VISUALIZER
const flowCanvas = document.getElementById('flowCanvas2');
const fctx = flowCanvas.getContext('2d');
let FW, FH;

function resizeFlow() {
  FW = flowCanvas.width = flowCanvas.offsetWidth;
  FH = flowCanvas.height = 380;
}
window.addEventListener('resize', resizeFlow);
setTimeout(resizeFlow, 100);

const flowScenarios = {
  auth: {
    nodes: ['Client','Login API','Token Service','Protected API','Database'],
    steps: [
      {from:0,to:1,label:'POST /login',color:'#60a5fa',type:'req'},
      {from:1,to:2,label:'Generate JWT',color:'#f59e0b',type:'req'},
      {from:2,to:1,label:'token: eyJh...',color:'#34d399',type:'res'},
      {from:1,to:0,label:'200 + token',color:'#34d399',type:'res'},
      {from:0,to:3,label:'GET /data + Bearer',color:'#60a5fa',type:'req'},
      {from:3,to:4,label:'SELECT * FROM...',color:'#a855f7',type:'req'},
      {from:4,to:3,label:'rows returned',color:'#34d399',type:'res'},
      {from:3,to:0,label:'200 + data',color:'#34d399',type:'res'},
    ],
    logs: ['POST /login → credentials sent','Token service generates JWT','200 OK — token returned to client','GET /data with Bearer token','Database query executed','200 OK — protected data returned']
  },
  crud: {
    nodes: ['Client','API Gateway','Business Logic','Database','Cache'],
    steps: [
      {from:0,to:1,label:'POST /items',color:'#60a5fa',type:'req'},
      {from:1,to:2,label:'Validate + Auth',color:'#f59e0b',type:'req'},
      {from:2,to:3,label:'INSERT INTO items',color:'#a855f7',type:'req'},
      {from:3,to:2,label:'id: 42',color:'#34d399',type:'res'},
      {from:2,to:4,label:'Cache invalidate',color:'#f59e0b',type:'req'},
      {from:2,to:1,label:'201 Created',color:'#34d399',type:'res'},
      {from:1,to:0,label:'{"id":42}',color:'#34d399',type:'res'},
    ],
    logs: ['POST /items — create new resource','Validation passed, user authorized','INSERT query executed','New ID: 42 returned','Cache invalidated for consistency','201 Created — resource returned']
  },
  webhook: {
    nodes: ['Stripe','Your Server','Database','Email Service','Slack'],
    steps: [
      {from:0,to:1,label:'POST payment.success',color:'#f59e0b',type:'req'},
      {from:1,to:1,label:'Verify signature',color:'#a855f7',type:'req'},
      {from:1,to:2,label:'UPDATE order SET paid',color:'#60a5fa',type:'req'},
      {from:2,to:1,label:'OK',color:'#34d399',type:'res'},
      {from:1,to:3,label:'Send receipt email',color:'#60a5fa',type:'req'},
      {from:1,to:4,label:'Notify #sales',color:'#a855f7',type:'req'},
      {from:1,to:0,label:'200 OK',color:'#34d399',type:'res'},
    ],
    logs: ['Stripe fires payment.success webhook','Signature verified — authentic event','Order marked as paid in database','Receipt email queued','Sales team notified in Slack','200 OK — webhook acknowledged']
  },
  chain: {
    nodes: ['App','Weather API','AI API','Storage API','Client'],
    steps: [
      {from:0,to:1,label:'GET /weather/Sofia',color:'#60a5fa',type:'req'},
      {from:1,to:0,label:'temp: 22°C',color:'#34d399',type:'res'},
      {from:0,to:2,label:'POST — summarize weather',color:'#a855f7',type:'req'},
      {from:2,to:0,label:'AI summary text',color:'#34d399',type:'res'},
      {from:0,to:3,label:'PUT /reports/today',color:'#f59e0b',type:'req'},
      {from:3,to:0,label:'saved: true',color:'#34d399',type:'res'},
      {from:0,to:4,label:'Full enriched report',color:'#10b981',type:'res'},
    ],
    logs: ['Fetch weather data for Sofia','22°C, partly cloudy — data received','Send to AI for natural language summary','AI summary generated','Store report in cloud storage','Saved successfully','Deliver final enriched report to client']
  },
  error: {
    nodes: ['Client','API','Retry Logic','Fallback API','Error Log'],
    steps: [
      {from:0,to:1,label:'GET /data',color:'#60a5fa',type:'req'},
      {from:1,to:0,label:'503 Service Unavailable',color:'#f87171',type:'err'},
      {from:0,to:2,label:'Retry attempt 1',color:'#f59e0b',type:'req'},
      {from:2,to:1,label:'GET /data (retry)',color:'#60a5fa',type:'req'},
      {from:1,to:2,label:'503 again',color:'#f87171',type:'err'},
      {from:2,to:3,label:'Switch to fallback',color:'#f59e0b',type:'req'},
      {from:3,to:0,label:'200 OK (fallback)',color:'#34d399',type:'res'},
      {from:2,to:4,label:'Log: primary API down',color:'#f87171',type:'err'},
    ],
    logs: ['GET /data — primary API called','503 Service Unavailable — error!','Retry logic triggered (attempt 1/3)','Retry failed — same error','Circuit breaker opens — switching fallback','Fallback API responds 200 OK','Error logged for monitoring']
  }
};

let flowAnimating = false;
let flowParticles = [];
let currentScenario = null;

function triggerFlow(type) {
  if(flowAnimating) return;
  currentScenario = flowScenarios[type];
  flowAnimating = true;
  flowParticles = [];

  const logEl = document.getElementById('flowLog');
  logEl.innerHTML = '';

  document.querySelectorAll('.flow-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  animateFlowSteps(0);
}

function getNodePositions(count) {
  const positions = [];
  const margin = 60;
  const spacing = (FW - margin*2) / (count-1);
  for(let i=0; i<count; i++) positions.push({ x: margin + i*spacing, y: FH/2 });
  return positions;
}

function animateFlowSteps(stepIdx) {
  if(!currentScenario || stepIdx >= currentScenario.steps.length) {
    flowAnimating = false;
    return;
  }

  const step = currentScenario.steps[stepIdx];
  const positions = getNodePositions(currentScenario.nodes.length);
  const from = positions[step.from];
  const to = positions[step.to];

  // Add log
  const logEl = document.getElementById('flowLog');
  const entry = document.createElement('div');
  entry.className = `flow-entry ${step.type}`;
  entry.textContent = `> ${currentScenario.logs[stepIdx] || step.label}`;
  logEl.prepend(entry);

  // Animate packet
  let t = 0;
  const interval = setInterval(() => {
    t += 0.04;
    if(t >= 1) {
      clearInterval(interval);
      setTimeout(() => animateFlowSteps(stepIdx+1), 200);
    }

    drawFlow(positions, step, Math.min(t,1));
  }, 16);
}

function drawFlow(positions, activeStep, t) {
  if(!FW) return;
  fctx.clearRect(0,0,FW,FH);
  fctx.fillStyle = 'rgba(3,5,8,0.98)';
  fctx.fillRect(0,0,FW,FH);

  if(!currentScenario) return;

  // Draw edges
  currentScenario.steps.forEach(s => {
    const a = positions[s.from], b = positions[s.to];
    fctx.beginPath();
    fctx.moveTo(a.x, a.y);
    fctx.lineTo(b.x, b.y);
    fctx.strokeStyle = 'rgba(16,185,129,0.08)';
    fctx.lineWidth = 1;
    fctx.stroke();
  });

  // Draw active packet
  const from = positions[activeStep.from];
  const to = positions[activeStep.to];
  const px = from.x + (to.x-from.x)*t;
  const py = from.y + (to.y-from.y)*t;

  // Trail
  fctx.beginPath();
  fctx.moveTo(from.x + (to.x-from.x)*Math.max(0,t-0.15), from.y + (to.y-from.y)*Math.max(0,t-0.15));
  fctx.lineTo(px, py);
  fctx.strokeStyle = activeStep.color + '60';
  fctx.lineWidth = 2;
  fctx.stroke();

  // Packet
  fctx.beginPath();
  fctx.arc(px, py, 6, 0, Math.PI*2);
  fctx.fillStyle = activeStep.color;
  fctx.shadowColor = activeStep.color;
  fctx.shadowBlur = 15;
  fctx.fill();
  fctx.shadowBlur = 0;

  // Label on packet
  fctx.font = '500 9px DM Mono, monospace';
  fctx.fillStyle = activeStep.color;
  fctx.textAlign = 'center';
  fctx.fillText(activeStep.label, px, py-14);

  // Draw nodes
  currentScenario.nodes.forEach((name, i) => {
    const p = positions[i];
    const isActive = i===activeStep.from || i===activeStep.to;
    fctx.beginPath();
    fctx.arc(p.x, p.y, isActive?22:18, 0, Math.PI*2);
    fctx.fillStyle = isActive ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.05)';
    fctx.strokeStyle = isActive ? 'rgba(16,185,129,0.6)' : 'rgba(16,185,129,0.2)';
    fctx.lineWidth = isActive ? 2 : 1;
    fctx.fill(); fctx.stroke();

    fctx.font = `${isActive?'700':'500'} 10px DM Mono, monospace`;
    fctx.fillStyle = isActive ? '#10b981' : '#5a6478';
    fctx.textAlign = 'center';
    fctx.fillText(name, p.x, p.y+36);
    fctx.font = '12px serif';
    fctx.fillText(['💻','🔐','⚡','🗄️','📦'][i % 5], p.x, p.y+4);
  });
}

function switchDemo(name, tabEl) {
  document.getElementById('demo-builder').style.display = name==='builder' ? 'block' : 'none';
  document.getElementById('demo-flow').style.display = name==='flow' ? 'block' : 'none';
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
  if(name==='flow') setTimeout(resizeFlow, 50);
}
