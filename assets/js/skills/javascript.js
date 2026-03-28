
// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
}, { passive: true });
document.querySelectorAll('a,.demo-tab,.js-tab,.ctrl-opt,.color-opt,.dom-action,.cap-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='56px'; ring.style.height='56px'; ring.style.borderColor='rgba(245,158,11,0.7)'; }, { passive: true });
  el.addEventListener('mouseleave', () => { ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(245,158,11,0.5)'; }, { passive: true });
});

// SCROLL REVEAL
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

// PARTICLE FLOW ANIMATION
(function() {
  const canvas = document.getElementById('flowCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const particles = [];
  const NUM = 120;

  for(let i=0; i<NUM; i++) {
    particles.push({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*1.2,
      r: Math.random()*2+0.5,
      hue: Math.random()>0.6 ? 38 : 195,
      alpha: Math.random()*0.6+0.2,
      pulse: Math.random()*Math.PI*2,
    });
  }

  let frame = 0;
  function draw() {
    frame++;
    ctx.fillStyle = 'rgba(3,5,8,0.15)';
    ctx.fillRect(0,0,W,H);

    // Draw connections
    for(let i=0; i<particles.length; i++) {
      for(let j=i+1; j<particles.length; j++) {
        const dx = particles[i].x-particles[j].x;
        const dy = particles[i].y-particles[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 80) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1-dist/80)*0.15;
          ctx.strokeStyle = `rgba(245,158,11,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.pulse += 0.03;
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      const pulse = 0.7 + Math.sin(p.pulse)*0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*pulse, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha*pulse})`;
      ctx.shadowColor = p.hue===38 ? '#f59e0b' : '#61dafb';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // JS/React labels floating
    if(frame % 180 === 0) {
      const labels = ['const','useState','useEffect','=>','{...props}','async','await','map()','filter()','<Component/>'];
      const label = labels[Math.floor(Math.random()*labels.length)];
      ctx.fillStyle = `rgba(245,158,11,0.2)`;
      ctx.font = '12px DM Mono, monospace';
      ctx.fillText(label, Math.random()*(W-80)+10, Math.random()*(H-20)+10);
    }

    ctx.fillStyle = 'rgba(245,158,11,0.3)';
    ctx.font = '11px DM Mono, monospace';
    ctx.fillText('// particle flow', 10, H-10);

    requestAnimationFrame(draw);
  }
  draw();
})();

// ========================
// DEMO 1: JS PLAYGROUND
// ========================
const jsSnippets = [
  {
    title: 'array_methods.js',
    code: `// Modern JavaScript Array Methods
const developers = [
  { name: 'Nikola', skill: 'Python', level: 9 },
  { name: 'Alice', skill: 'React', level: 8 },
  { name: 'Bob', skill: 'Node', level: 7 },
  { name: 'Carol', skill: 'AI', level: 10 },
];

// Filter senior devs
const seniors = developers.filter(d => d.level >= 8);
console.log('Seniors:', seniors.map(d => d.name));

// Map to summary strings
const summaries = developers.map(d =>
  \`\${d.name} (\${d.skill}) — Level \${d.level}\`
);
summaries.forEach(s => console.log(s));

// Reduce to find average level
const avg = developers.reduce((sum, d) => sum + d.level, 0) / developers.length;
console.log('Average level:', avg.toFixed(1));`,
    run: () => {
      const devs = [{name:'Nikola',skill:'Python',level:9},{name:'Alice',skill:'React',level:8},{name:'Bob',skill:'Node',level:7},{name:'Carol',skill:'AI',level:10}];
      const seniors = devs.filter(d=>d.level>=8).map(d=>d.name);
      const summaries = devs.map(d=>`${d.name} (${d.skill}) — Level ${d.level}`);
      const avg = (devs.reduce((s,d)=>s+d.level,0)/devs.length).toFixed(1);
      return `Seniors: ['${seniors.join("', '")}']
${summaries.join('\n')}
Average level: ${avg}`;
    }
  },
  {
    title: 'async_await.js',
    code: `// Async/Await & Promise patterns
const fetchUser = async (id) => {
  // Simulating API call
  await new Promise(r => setTimeout(r, 500));
  return { id, name: 'Nikola', role: 'Developer' };
};

const fetchProjects = async (userId) => {
  await new Promise(r => setTimeout(r, 300));
  return ['Portfolio Site', 'AI Chatbot', 'Dashboard'];
};

// Parallel fetching with Promise.all
const loadDashboard = async () => {
  console.log('Loading dashboard...');
  const [user, projects] = await Promise.all([
    fetchUser(42),
    fetchProjects(42)
  ]);
  console.log('User:', JSON.stringify(user));
  console.log('Projects:', projects);
  console.log('Done!');
};

loadDashboard();`,
    run: () => {
      return `Loading dashboard...
User: {"id":42,"name":"Nikola","role":"Developer"}
Projects: ['Portfolio Site', 'AI Chatbot', 'Dashboard']
Done!`;
    }
  },
  {
    title: 'closures.js',
    code: `// JavaScript Closures & Higher-Order Functions
const createCounter = (start = 0, step = 1) => {
  let count = start;
  return {
    increment: () => (count += step),
    decrement: () => (count -= step),
    reset: () => (count = start),
    value: () => count,
  };
};

const counter = createCounter(10, 5);
console.log('Start:', counter.value());
counter.increment();
counter.increment();
console.log('After 2 increments:', counter.value());
counter.decrement();
console.log('After decrement:', counter.value());
counter.reset();
console.log('After reset:', counter.value());

// Memoization closure
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return \`[cached] \${cache.get(key)}\`;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const square = memoize(x => x * x);
console.log('square(4):', square(4));
console.log('square(4):', square(4));`,
    run: () => {
      return `Start: 10
After 2 increments: 20
After decrement: 15
After reset: 10
square(4): 16
square(4): [cached] 16`;
    }
  },
  {
    title: 'react_hooks.jsx',
    code: `// React Hooks — useState & useEffect
import { useState, useEffect } from 'react';

const useTimer = (initialTime) => {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);
    return () => clearInterval(interval); // cleanup
  }, [running]);

  return { time, start: () => setRunning(true),
           stop: () => setRunning(false),
           reset: () => { setRunning(false); setTime(initialTime); }};
};

// Simulated execution trace:
console.log('useState(60) → time: 60, running: false');
console.log('start() called → running: true');
console.log('useEffect fires → interval created');
console.log('1s tick → time: 59');
console.log('1s tick → time: 58');
console.log('stop() → running: false');
console.log('useEffect cleanup → interval cleared');`,
    run: () => {
      return `useState(60) → time: 60, running: false
start() called → running: true
useEffect fires → interval created
1s tick → time: 59
1s tick → time: 58
stop() → running: false
useEffect cleanup → interval cleared`;
    }
  }
];

let currentJS = 0;
function loadJS(idx, tabEl) {
  currentJS = idx;
  document.getElementById('jsCode').value = jsSnippets[idx].code;
  document.getElementById('jsOutput').textContent = '// Console output here...';
  document.querySelectorAll('.js-tab').forEach(t => t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
}
function runJS() {
  const out = document.getElementById('jsOutput');
  out.textContent = '// Running...\n';
  setTimeout(() => { out.textContent = jsSnippets[currentJS].run(); }, 300);
}
loadJS(0, document.querySelector('.js-tab'));

// ========================
// DEMO 2: COMPONENT BUILDER
// ========================
const compState = { type:'button', variant:'primary', size:'md', color:'#f59e0b' };
function setComp(key, val, el) {
  compState[key] = val;
  const group = el.closest('.control-group');
  group.querySelectorAll('.ctrl-opt, .color-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  renderComponent();
}

function renderComponent() {
  const label = document.getElementById('compLabel').value || 'Click me';
  const {type, variant, size, color} = compState;
  const preview = document.getElementById('previewWindow');
  const codeOut = document.getElementById('compCode');

  const sizes = {sm:'8px 16px;font-size:0.7rem', md:'12px 24px;font-size:0.85rem', lg:'16px 32px;font-size:1rem'};
  const pad = sizes[size];

  let html = '', code = '';

  if(type === 'button') {
    const styles = {
      primary: `background:${color};color:#000;border:none;`,
      outline: `background:transparent;color:${color};border:2px solid ${color};`,
      ghost: `background:transparent;color:${color};border:1px solid transparent;`
    };
    html = `<button style="padding:${pad};border-radius:8px;font-family:Syne,sans-serif;font-weight:700;letter-spacing:0.05em;cursor:pointer;transition:all 0.2s;${styles[variant]}">${label}</button>`;
    code = `<Button\n  variant="${variant}"\n  size="${size}"\n  color="${color}"\n>\n  ${label}\n</Button>`;
  } else if(type === 'card') {
    html = `<div style="background:rgba(255,255,255,0.04);border:1px solid ${color}33;border-radius:12px;padding:24px;max-width:220px;"><div style="color:${color};font-size:1.5rem;margin-bottom:8px;">📊</div><div style="font-family:Syne,sans-serif;font-weight:700;font-size:0.9rem;margin-bottom:6px;">${label}</div><div style="font-size:0.7rem;color:#5a6478;line-height:1.6;">A reusable card component with clean styling.</div></div>`;
    code = `<Card\n  title="${label}"\n  icon="📊"\n  color="${color}"\n/>`;
  } else if(type === 'badge') {
    const styles = {
      primary: `background:${color};color:#000;`,
      outline: `background:transparent;color:${color};border:1px solid ${color};`,
      ghost: `background:${color}22;color:${color};`
    };
    html = `<span style="padding:4px 12px;border-radius:20px;font-size:0.72rem;font-family:Syne,sans-serif;font-weight:600;letter-spacing:0.08em;${styles[variant]}">${label}</span>`;
    code = `<Badge variant="${variant}" color="${color}">\n  ${label}\n</Badge>`;
  } else if(type === 'input') {
    html = `<input style="background:rgba(255,255,255,0.04);border:1px solid ${color}44;border-radius:8px;padding:${pad};color:#e8edf5;font-family:'DM Mono',monospace;outline:none;width:200px;" placeholder="${label}" onfocus="this.style.borderColor='${color}'" onblur="this.style.borderColor='${color}44'">`;
    code = `<Input\n  placeholder="${label}"\n  size="${size}"\n  accentColor="${color}"\n/>`;
  }

  preview.innerHTML = html;
  codeOut.textContent = code;
}
renderComponent();

// ========================
// DEMO 3: DOM VISUALIZER
// ========================
let nodeCount = 1;
const nodeTypes = ['element','component','text'];
const nodeTags = {
  element: ['<div>','<section>','<article>','<header>','<main>'],
  component: ['<Button />','<Card />','<Modal />','<Input />','<Nav />'],
  text: ['"Hello World"','"Click here"','"Loading..."','"Welcome"']
};

function domLog(msg, type) {
  const log = document.getElementById('domLog');
  const entry = document.createElement('div');
  entry.className = `dom-log-entry ${type}`;
  entry.textContent = `> ${msg}`;
  log.prepend(entry);
  if(log.children.length > 8) log.removeChild(log.lastChild);
}

function domOp(op) {
  const stage = document.getElementById('domStage');
  if(op === 'addElement') {
    const tag = nodeTags.element[Math.floor(Math.random()*nodeTags.element.length)];
    addDomNode('element', tag);
    domLog(`createElement → appended ${tag}`, 'add');
  } else if(op === 'addComponent') {
    const tag = nodeTags.component[Math.floor(Math.random()*nodeTags.component.length)];
    addDomNode('component', tag);
    domLog(`React.createElement → rendered ${tag}`, 'add');
  } else if(op === 'addText') {
    const tag = nodeTags.text[Math.floor(Math.random()*nodeTags.text.length)];
    addDomNode('text', tag);
    domLog(`createTextNode → inserted ${tag}`, 'add');
  } else if(op === 'updateClass') {
    const nodes = stage.querySelectorAll('.dom-node:not(:first-child)');
    if(nodes.length === 0) { domLog('No nodes to update', 'update'); return; }
    const node = nodes[Math.floor(Math.random()*nodes.length)];
    node.classList.add('highlight');
    setTimeout(() => node.classList.remove('highlight'), 700);
    domLog('classList.toggle("active") → style updated', 'update');
  } else if(op === 'removeNode') {
    const nodes = stage.querySelectorAll('.dom-node:not(:first-child)');
    if(nodes.length === 0) { domLog('Nothing to remove', 'remove'); return; }
    const last = nodes[nodes.length-1];
    last.style.animation = 'none';
    last.style.opacity = '0';
    last.style.transform = 'translateX(20px)';
    last.style.transition = 'all 0.3s';
    setTimeout(() => last.remove(), 300);
    domLog('removeChild → node detached from DOM', 'remove');
  } else if(op === 'clearAll') {
    const nodes = stage.querySelectorAll('.dom-node:not(:first-child)');
    nodes.forEach(n => n.remove());
    domLog('innerHTML = "" → DOM cleared', 'remove');
  }
}

function addDomNode(type, tag) {
  const stage = document.getElementById('domStage');
  const node = document.createElement('div');
  node.className = `dom-node ${type}`;
  node.innerHTML = `<span class="node-tag">${tag}</span><span class="node-del" onclick="this.closest('.dom-node').remove();domLog('removeChild → manual removal','remove')">✕</span>`;
  stage.appendChild(node);
  nodeCount++;
}

function switchDemo(name, tabEl) {
  document.getElementById('demo-playground').style.display = 'none';
  document.getElementById('demo-component').style.display = 'none';
  document.getElementById('demo-dom').style.display = 'none';
  document.getElementById(`demo-${name}`).style.display = 'block';
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
}
