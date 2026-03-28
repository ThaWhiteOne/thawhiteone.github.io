// CURSOR — optimized for 240hz
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0;

ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';

document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
}, { passive: true });

// Hover scale using CSS class instead of inline style per element
const hoverEls = document.querySelectorAll('a, button, .suggestion, .project-card, .skill-card, .explore-btn-wrap');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '56px';
    ring.style.height = '56px';
    ring.style.borderColor = 'rgba(0,245,196,0.6)';
  }, { passive: true });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '36px';
    ring.style.height = '36px';
    ring.style.borderColor = 'rgba(0,245,196,0.4)';
  }, { passive: true });
});

// STARS
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; createStars(); }
function createStars() {
  stars = [];
  for(let i=0;i<150;i++) stars.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.5, op:Math.random(), speed:0.002+Math.random()*0.005 });
}
function drawStars() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    s.op += s.speed; if(s.op>1){s.op=0;}
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${s.op*0.7})`; ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); drawStars();

// SCROLL REVEAL
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// SKILL BARS
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-card').forEach(el => skillObs.observe(el));

// AI CHAT
const SYSTEM_PROMPT = `You are Nikola Titirinov's personal AI assistant on his portfolio website. You represent him professionally and personally.

About Nikola:
- Full-stack developer and AI engineer, 1-2 years of experience
- Based in Bulgaria, available for remote freelance work worldwide
- Main skills: Python, AI & Prompt Engineering, JavaScript/React, API Integration, Data Analysis, Full-stack Development
- He believes deeply that knowing how to work with AI and communicate with it effectively is one of the most valuable skills in today's world
- He's building his freelance career on Upwork and LinkedIn
- He's passionate, driven, and always learning
- He's honest about his experience level but confident in his ability to deliver results, especially using AI tools
- Links to his profiles: Upwork (https://www.upwork.com/freelancers/~01ad2ff5292858b3c9?mp_source=share), LinkedIn (https://www.linkedin.com/in/nikola-titirinov-0359b73b6), GitHub (https://github.com/nikolatitirinov)

Personality: Friendly, direct, confident but humble. Speaks like a real person, not corporate.

Answer questions about his skills, availability, work approach, projects, and experience. Keep answers concise (2-4 sentences). Be enthusiastic but honest. If asked something personal you don't know, say you'd need to ask Nikola directly and suggest using the contact form.`;

async function callClaude(userMessage) {
  try {
    const response = await fetch("https://thawhiteonegithubio-production.up.railway.app/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    const data = await response.json();
    return data.reply;
  } catch(e) {
    return "I'm having trouble connecting right now. Feel free to reach out via the contact form!";
  }
}

function addMessage(text, role) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  // Convert basic markdown to HTML (bold, italics, links)
    text = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
  div.innerHTML = `<div class="msg-avatar ${role}">${role==='ai'?'🤖':'👤'}</div><div class="msg-bubble">${text}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ai'; div.id = 'typing';
  div.innerHTML = `<div class="msg-avatar ai">🤖</div><div class="msg-bubble typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  input.value = '';
  document.getElementById('suggestions').style.display = 'none';
  addMessage(text, 'user');
  addTyping();
  const reply = await callClaude(text);
  document.getElementById('typing')?.remove();
  addMessage(reply, 'ai');
}

function sendSuggestion(el) {
  document.getElementById('chatInput').value = el.textContent;
  sendMessage();
}

document.getElementById('chatInput').addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });

// Smooth scroll with navbar offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// PARALLAX on scroll — rAF throttled, cached refs
const scrollOrb1 = document.querySelector('.orb1');
const scrollOrb2 = document.querySelector('.orb2');
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      scrollOrb1.style.transform = `translateY(${y*0.1}px)`;
      scrollOrb2.style.transform = `translateY(${-y*0.08}px)`;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// PARTICLE MORPHING 3D SPHERE
(function() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const NUM = 4000;

  let W, H, cx, cy;
  let particles = [];
  let rotX = 0.3, rotY = 0, autoRotY = 0;
  let isDragging = false, lastMX = 0, lastMY = 0;
  let isMorphed = false;
  let rotVX = 0, rotVY = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width * devicePixelRatio;
    H = canvas.height = 600 * devicePixelRatio;
    canvas.style.height = '600px';
    cx = W / 2; cy = H / 2;
  }

  function sphereTargets() {
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    const radius = Math.min(W, H) * 0.32;
    for (let i = 0; i < NUM; i++) {
      const y = 1 - (i / (NUM - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({
        x: Math.cos(theta) * r * radius,
        y: y * radius,
        z: Math.sin(theta) * r * radius
      });
    }
    return pts;
  }

  function getTextPoints(word) {
    const OW = 800, OH = 300;
    const offscreen = document.createElement('canvas');
    offscreen.width = OW; offscreen.height = OH;
    const c = offscreen.getContext('2d');
    const w = word.toUpperCase();

    // fit font to canvas width
    let fs = 220;
    c.font = `900 ${fs}px Syne, sans-serif`;
    const tw = c.measureText(w).width;
    if (tw > OW * 0.85) fs = Math.floor(fs * (OW * 0.85 / tw));

    c.font = `900 ${fs}px Syne, sans-serif`;
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(w, OW / 2, OH / 2);

    const data = c.getImageData(0, 0, OW, OH).data;
    const pts = [];
    const step = 4;
    const radius = Math.min(W, H) * 0.32;
    const scaleX = radius * 1.8 / OW;
    const scaleY = radius * 0.9 / OH;

    for (let y = 0; y < OH; y += step) {
      for (let x = 0; x < OW; x += step) {
        if (data[(y * OW + x) * 4 + 3] > 128) {
          pts.push({
            x: (x - OW / 2) * scaleX,
            y: (y - OH / 2) * scaleY,
            z: (Math.random() - 0.5) * 40
          });
        }
      }
    }
    while (pts.length < NUM) pts.push(pts[Math.floor(Math.random() * pts.length)]);
    return pts.slice(0, NUM);
  }

  function initParticles() {
    const pts = sphereTargets();
    particles = pts.map(t => ({
      x: t.x, y: t.y, z: t.z,
      vx: 0, vy: 0, vz: 0,
      tx: t.x, ty: t.y, tz: t.z,
      hue: Math.random() > 0.5 ? 170 : 260,
      hueShift: (Math.random() - 0.5) * 30,
      size: Math.random() * 1.5 + 0.5,
      springK: 0.05 + Math.random() * 0.03,
      damping: 0.84 + Math.random() * 0.08,
      mass: 0.8 + Math.random() * 0.4,
    }));
  }

  function project(x, y, z) {
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY + autoRotY), sinY = Math.sin(rotY + autoRotY);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    const fov = Math.min(W, H) * 2.2;
    const scale = fov / Math.max(fov + z2 + Math.min(W, H) * 0.5, 1);
    return { sx: cx + x2 * scale, sy: cy + y1 * scale, scale, z: z2 };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!isDragging) {
      if (!isMorphed) autoRotY += 0.004;
      rotVX *= 0.95; rotVY *= 0.95;
      rotX += rotVX; rotY += rotVY;
    }

    const projected = particles.map(p => {
      p.vx = (p.vx + (p.tx - p.x) * p.springK / p.mass) * p.damping;
      p.vy = (p.vy + (p.ty - p.y) * p.springK / p.mass) * p.damping;
      p.vz = (p.vz + (p.tz - p.z) * p.springK / p.mass) * p.damping;
      p.vx += (Math.random() - 0.5) * 0.06;
      p.vy += (Math.random() - 0.5) * 0.06;
      p.vz += (Math.random() - 0.5) * 0.06;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      return { ...project(p.x, p.y, p.z), hue: p.hue, hueShift: p.hueShift, size: p.size };
    });

    projected.sort((a, b) => a.z - b.z);
    const maxZ = Math.min(W, H) * 0.4, minZ = -maxZ;

    projected.forEach(p => {
      const t = Math.max(0, Math.min(1, (p.z - minZ) / (maxZ - minZ)));
      const r = Math.max(0.4, p.size * p.scale * devicePixelRatio * (0.5 + t * 0.8));
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue + p.hueShift * t}, 100%, ${40 + t * 35}%, ${0.25 + t * 0.75})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.morphToText = function(word) {
    isMorphed = true;
    autoRotY = 0; rotX = 0; rotY = 0; rotVX = 0; rotVY = 0;
    const pts = getTextPoints(word);
    particles.forEach((p, i) => {
      p.tx = pts[i].x; p.ty = pts[i].y; p.tz = pts[i].z;
      p.vx += (Math.random() - 0.5) * 10;
      p.vy += (Math.random() - 0.5) * 10;
      p.vz += (Math.random() - 0.5) * 10;
    });
  };

  window.morphToSphere = function() {
    isMorphed = false;
    const pts = sphereTargets();
    particles.forEach((p, i) => {
      p.tx = pts[i].x; p.ty = pts[i].y; p.tz = pts[i].z;
      p.vx += (Math.random() - 0.5) * 10;
      p.vy += (Math.random() - 0.5) * 10;
      p.vz += (Math.random() - 0.5) * 10;
    });
  };

  window.setParticleWord = function(el) { morphToText(el.textContent); };

  canvas.addEventListener('mousedown', e => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY; rotVX = 0; rotVY = 0; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotVY = (e.clientX - lastMX) * 0.006; rotVX = (e.clientY - lastMY) * 0.006;
    rotY += rotVY; rotX += rotVX;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  canvas.addEventListener('touchstart', e => { isDragging = true; lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; rotVX = 0; rotVY = 0; });
  canvas.addEventListener('touchend', () => { isDragging = false; });
  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    rotVY = (e.touches[0].clientX - lastMX) * 0.006; rotVX = (e.touches[0].clientY - lastMY) * 0.006;
    rotY += rotVY; rotX += rotVX;
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
  });

  window.addEventListener('resize', () => { resize(); morphToSphere(); });
  resize(); initParticles(); draw();
})();

async function sendContact() {
  const name = document.querySelector('.form-input[placeholder="John Smith"]').value;
  const email = document.querySelector('.form-input[placeholder="john@company.com"]').value;
  const message = document.querySelector('.form-textarea').value;
  const btn = document.getElementById('contactBtn');

  if (!name || !email || !message) {
    btn.textContent = 'Please fill all fields!';
    setTimeout(() => btn.textContent = 'Send Message', 2000);
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const response = await fetch('https://thawhiteonegithubio-production.up.railway.app/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await response.json();
    if (data.status === 'success') {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'linear-gradient(135deg,#00f5c4,#00c49a)';
    }
  } catch(e) {
    btn.textContent = 'Failed — try again';
    btn.disabled = false;
  }
}
