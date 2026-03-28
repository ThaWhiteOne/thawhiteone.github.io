
// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
}, { passive: true });
document.querySelectorAll('a,.demo-tab,.comp-btn,.step-option,.builder-step,.cap-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='56px'; ring.style.height='56px'; ring.style.borderColor='rgba(168,85,247,0.7)'; }, { passive: true });
  el.addEventListener('mouseleave', () => { ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(168,85,247,0.5)'; }, { passive: true });
});

// SCROLL REVEAL
const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// PARALLAX — rAF throttled, cached refs
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

// PULSING BRAIN ANIMATION
(function() {
  const canvas = document.getElementById('brainCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;

  // Brain nodes
  const nodeCount = 60;
  const nodes = [];
  const connections = [];

  // Generate nodes in brain-like clusters
  const regions = [
    {x:cx, y:cy-80, r:90, count:15},
    {x:cx-70, y:cy+30, r:70, count:12},
    {x:cx+70, y:cy+30, r:70, count:12},
    {x:cx, y:cy+80, r:60, count:10},
    {x:cx-110, y:cy-40, r:50, count:6},
    {x:cx+110, y:cy-40, r:50, count:6},
  ];

  regions.forEach(reg => {
    for(let i=0; i<reg.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * reg.r;
      nodes.push({
        x: reg.x + Math.cos(angle)*dist,
        y: reg.y + Math.sin(angle)*dist,
        baseX: reg.x + Math.cos(angle)*dist,
        baseY: reg.y + Math.sin(angle)*dist,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        r: Math.random()*3+1.5,
        pulse: Math.random()*Math.PI*2,
        pulseSpeed: 0.02+Math.random()*0.03,
        active: false,
        activeFade: 0,
      });
    }
  });

  // Connect nearby nodes
  for(let i=0; i<nodes.length; i++) {
    for(let j=i+1; j<nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 80) connections.push({a:i, b:j, dist, strength: 1-dist/80});
    }
  }

  // Signal pulses traveling along connections
  const signals = [];
  function spawnSignal() {
    const conn = connections[Math.floor(Math.random()*connections.length)];
    signals.push({ conn, t: 0, speed: 0.008+Math.random()*0.012, forward: Math.random()>0.5 });
  }
  setInterval(spawnSignal, 300);

  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(3,5,8,0.95)';
    ctx.fillRect(0,0,W,H);
    frame++;

    // Update nodes
    nodes.forEach(n => {
      n.pulse += n.pulseSpeed;
      n.x += n.vx; n.y += n.vy;
      if(Math.abs(n.x-n.baseX)>15) n.vx*=-1;
      if(Math.abs(n.y-n.baseY)>15) n.vy*=-1;
      if(n.activeFade > 0) n.activeFade -= 0.02;
    });

    // Draw connections
    connections.forEach(c => {
      const a = nodes[c.a], b = nodes[c.b];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(168,85,247,${c.strength*0.15})`;
      ctx.lineWidth = c.strength;
      ctx.stroke();
    });

    // Draw signals
    for(let i=signals.length-1; i>=0; i--) {
      const s = signals[i];
      s.t += s.speed;
      if(s.t >= 1) { signals.splice(i,1); continue; }
      const t = s.forward ? s.t : 1-s.t;
      const a = nodes[s.conn.a], b = nodes[s.conn.b];
      const x = a.x + (b.x-a.x)*t;
      const y = a.y + (b.y-a.y)*t;
      // Activate nearby node
      if(s.t > 0.9) { nodes[s.forward?s.conn.b:s.conn.a].activeFade = 1; }

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      const alpha = Math.sin(s.t*Math.PI);
      ctx.fillStyle = `rgba(0,245,196,${alpha*0.9})`;
      ctx.shadowColor = '#00f5c4';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Trail
      ctx.beginPath();
      ctx.moveTo(a.x+(b.x-a.x)*Math.max(0,t-0.08), a.y+(b.y-a.y)*Math.max(0,t-0.08));
      ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(0,245,196,${alpha*0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulse = 0.6 + Math.sin(n.pulse)*0.4;
      const isActive = n.activeFade > 0;
      const color = isActive ? `rgba(0,245,196,${0.5+n.activeFade*0.5})` : `rgba(168,85,247,${pulse*0.8})`;
      const glow = isActive ? '#00f5c4' : '#a855f7';

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r*(isActive?1.5:1), 0, Math.PI*2);
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = isActive ? 16 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw brain outline (soft)
    ctx.beginPath();
    ctx.ellipse(cx, cy-10, 145, 130, 0, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(168,85,247,${0.06+Math.sin(frame*0.02)*0.03})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(168,85,247,0.4)';
    ctx.font = '500 11px DM Mono, monospace';
    ctx.fillText('// neural activity', 10, H-10);
    ctx.fillText(`signals: ${signals.length}`, W-100, H-10);

    requestAnimationFrame(draw);
  }
  draw();
})();

// =====================
// DEMO 1: LIVE TESTER
// =====================
const responses = {
  default: [
    "Prompt engineering is the art of crafting precise instructions to guide AI models toward desired outputs. It involves understanding how language models interpret context, constraints, and examples to produce accurate, useful responses.",
    "I understand your request. Prompt engineering is essentially the skill of communicating effectively with AI systems — choosing the right words, structure, and context to get the best possible output from a language model.",
    "Great question! Think of prompt engineering as learning the language that AI thinks in. By providing clear roles, specific constraints, and good examples, you can dramatically improve the quality and reliability of AI responses."
  ],
  code: [
    "```python\ndef greet(name: str) -> str:\n    \"\"\"Return a personalized greeting.\"\"\"\n    return f\"Hello, {name}! Welcome.\"\n\n# Example usage\nprint(greet('Nikola'))  # Hello, Nikola! Welcome.\n```",
    "Here's a clean implementation:\n```javascript\nconst greet = (name) => `Hello, ${name}! Welcome.`;\nconsole.log(greet('Nikola')); // Hello, Nikola! Welcome.\n```",
  ],
  creative: [
    "The prompt drifted through silicon dreams,\nA whisper to the neural machine.\nNot code, but craft — the art of asking right,\nTo turn a model's darkness into light.",
    "In the space between human and machine,\nPrompt engineering builds the bridge unseen.\nEvery word a key, every structure a door —\nThe better you ask, the more you explore."
  ]
};

async function runLiveTester() {
  const system = document.getElementById('systemPrompt').value;
  const user = document.getElementById('userPrompt').value;
  const output = document.getElementById('testerOutput');
  const startTime = Date.now();

  output.classList.add('typing-cursor');
  output.textContent = '';

  // Pick response based on content
  let pool = responses.default;
  if(user.toLowerCase().includes('code')||user.toLowerCase().includes('python')||user.toLowerCase().includes('function')) pool = responses.code;
  if(user.toLowerCase().includes('poem')||user.toLowerCase().includes('creative')||user.toLowerCase().includes('story')) pool = responses.creative;

  const response = pool[Math.floor(Math.random()*pool.length)];

  // Simulate typing
  let i = 0;
  const interval = setInterval(() => {
    output.textContent = response.slice(0, i);
    i += Math.floor(Math.random()*3)+1;
    if(i >= response.length) {
      output.textContent = response;
      output.classList.remove('typing-cursor');
      clearInterval(interval);
      const elapsed = ((Date.now()-startTime)/1000).toFixed(1);
      document.getElementById('tokenCount').textContent = `Tokens: ~${Math.floor(response.split(' ').length * 1.3)}`;
      document.getElementById('responseTime').textContent = `Time: ${elapsed}s`;
    }
  }, 20);
}

// =====================
// DEMO 2: COMPARISON
// =====================
const comparisons = [
  {
    topic: "Writing Task",
    bad: { prompt: "write something about AI", output: "AI is a technology that is very important today. It can do many things like recognize images and process text. Many companies are using AI to improve their products and services. The future of AI looks bright.", issues: ["Too vague — no tone, length, or audience", "No context about purpose", "No format specified", "Result is generic and forgettable"] },
    good: { prompt: "Write a 3-sentence LinkedIn post for a developer audience about why prompt engineering is an underrated skill in 2025. Use a confident, direct tone. Start with a bold claim.", output: "Most developers are sleeping on prompt engineering. While everyone races to learn frameworks and tools, the ability to systematically guide AI toward precise outputs is quietly becoming the highest-leverage skill in tech. If you can make AI do exactly what you need, you multiply everything else you build.", issues: ["Clear format: 3 sentences, LinkedIn post", "Defined audience: developers", "Specified tone: confident, direct", "Clear starting instruction"] }
  },
  {
    topic: "Code Review",
    bad: { prompt: "check my code", output: "I'd be happy to check your code! Please share it and I'll take a look. What language is it in? What does it do? Are there any specific issues you're concerned about?", issues: ["No code provided", "No language specified", "No focus area given", "AI can only ask clarifying questions"] },
    good: { prompt: "Review this Python function for performance issues only. Ignore style. Return a bullet list of problems with fix suggestions:\n\ndef find_user(users, id):\n  for u in users:\n    if u['id'] == id: return u", output: "• O(n) linear scan — use a dict lookup instead: `{u['id']: u for u in users}`\n• No early exit optimization needed if dict used\n• Consider caching if called frequently with same dataset\n• Missing type hints reduce IDE optimization hints", issues: ["Code included in prompt", "Scope limited: performance only", "Output format specified: bullet list", "Clear, actionable results"] }
  },
  {
    topic: "Data Analysis",
    bad: { prompt: "analyze this data: [1,5,2,8,3,9,4,7,6,10]", output: "Sure! Here are some observations about your data: The numbers range from 1 to 10. There are 10 values. Some are odd and some are even. The data appears to be somewhat random.", issues: ["No analysis goal specified", "No output format requested", "No statistical depth asked for", "Vague, surface-level result"] },
    good: { prompt: "Analyze [1,5,2,8,3,9,4,7,6,10]. Return: mean, median, std dev, trend (is it random or patterned?), and 1 insight. Format as JSON.", output: '{\n  "mean": 5.5,\n  "median": 5.5,\n  "std_dev": 3.03,\n  "trend": "Shuffled sequence 1-10 — not random, deliberately unordered",\n  "insight": "Perfect uniform distribution suggests synthetic/test data"\n}', issues: ["Specific metrics requested", "Output format: JSON", "Asked for trend analysis", "Asked for actionable insight"] }
  },
  {
    topic: "Creative Task",
    bad: { prompt: "make a tagline for my app", output: "Here are some taglines:\n- Your app, your way\n- The best app for everything\n- Making life easier\n- Connect, create, collaborate\n- The future is here", issues: ["No app description provided", "No target audience defined", "No tone or style specified", "Generic, unusable results"] },
    good: { prompt: "Write 3 taglines for a portfolio website of a Bulgarian freelance developer who specializes in AI and Python. Audience: international clients on Upwork. Tone: confident, modern, slightly bold. Max 8 words each.", output: "1. \"Built with Python. Powered by AI. Delivered.\"\n2. \"Your idea. My code. Launched.\"\n3. \"AI-fluent developer. Results that speak.\"", issues: ["Product clearly described", "Audience defined: Upwork clients", "Tone specified: confident, bold", "Length constraint: 8 words"] }
  }
];

function loadComparison(idx, btn) {
  const c = comparisons[idx];
  document.querySelectorAll('.comp-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.getElementById('compGrid').innerHTML = `
    <div class="comp-panel bad">
      <div class="comp-header bad">
        <span class="comp-label bad">❌ Weak Prompt</span>
        <span class="comp-score bad">Poor</span>
      </div>
      <div class="comp-body">
        <div class="comp-prompt bad">"${c.bad.prompt}"</div>
        <div class="comp-output">${c.bad.output}</div>
        <div class="comp-issues">${c.bad.issues.map(i=>`<div class="issue bad">✗ ${i}</div>`).join('')}</div>
      </div>
    </div>
    <div class="comp-panel good">
      <div class="comp-header good">
        <span class="comp-label good">✅ Strong Prompt</span>
        <span class="comp-score good">Excellent</span>
      </div>
      <div class="comp-body">
        <div class="comp-prompt good">"${c.good.prompt}"</div>
        <div class="comp-output" style="white-space:pre-wrap">${c.good.output}</div>
        <div class="comp-issues">${c.good.issues.map(i=>`<div class="issue good">✓ ${i}</div>`).join('')}</div>
      </div>
    </div>`;
}
loadComparison(0, null);

// =====================
// DEMO 3: BUILDER
// =====================
const builderConfig = [
  { id:'role', title:'1. Assign a Role', options:['Senior Developer','Data Analyst','Creative Writer','Marketing Expert','Technical Reviewer','Business Consultant'] },
  { id:'task', title:'2. Define the Task', options:['Write a report','Review and fix code','Generate ideas','Analyze data','Create a plan','Explain a concept'] },
  { id:'audience', title:'3. Target Audience', options:['Technical developers','Non-technical clients','Startup founders','Students','General public','C-level executives'] },
  { id:'format', title:'4. Output Format', options:['Bullet points','JSON object','Numbered list','Markdown report','Single paragraph','Code with comments'] },
  { id:'tone', title:'5. Set the Tone', options:['Professional','Friendly & casual','Direct & concise','Detailed & thorough','Creative & bold','Academic'] },
  { id:'constraint', title:'6. Add a Constraint', options:['Max 3 sentences','Under 200 words','No jargon','Include examples','Start with a question','End with action items'] },
];

const builderSelections = {};

function renderBuilder() {
  const container = document.getElementById('builderSteps');
  container.innerHTML = builderConfig.map(step => `
    <div class="builder-step">
      <div class="step-num">// ${step.id.toUpperCase()}</div>
      <div class="step-title">${step.title}</div>
      <div class="step-options">
        ${step.options.map(opt => `
          <span class="step-option ${builderSelections[step.id]===opt?'selected':''}"
            onclick="selectOption('${step.id}','${opt}',this)">${opt}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
  updateBuilderOutput();
}

function selectOption(stepId, value, el) {
  builderSelections[stepId] = value;
  document.querySelectorAll('.step-option').forEach(o => {
    if(o.textContent === value && o.closest('.builder-step') === el.closest('.builder-step')) o.classList.add('selected');
    else if(o.closest('.builder-step') === el.closest('.builder-step')) o.classList.remove('selected');
  });
  updateBuilderOutput();
}

function updateBuilderOutput() {
  const s = builderSelections;
  const parts = [];
  if(s.role) parts.push(`You are a ${s.role}.`);
  if(s.task) parts.push(`Your task: ${s.task}.`);
  if(s.audience) parts.push(`Your audience is: ${s.audience}.`);
  if(s.tone) parts.push(`Use a ${s.tone.toLowerCase()} tone.`);
  if(s.format) parts.push(`Format your response as: ${s.format}.`);
  if(s.constraint) parts.push(`Constraint: ${s.constraint}.`);

  const result = document.getElementById('builderResult');
  if(parts.length === 0) { result.textContent = '// Select options on the left to build your prompt...'; return; }
  result.textContent = parts.join('\n\n');
}

function copyPrompt() {
  const text = document.getElementById('builderResult').textContent;
  if(text.startsWith('//')) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.builder-copy .explore-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Prompt', 2000);
  });
}

renderBuilder();

// SWITCH DEMO TABS
function switchDemo(name, tabEl) {
  document.getElementById('demo-tester').style.display = 'none';
  document.getElementById('demo-comparison').style.display = 'none';
  document.getElementById('demo-builder').style.display = 'none';
  document.getElementById(`demo-${name}`).style.display = 'block';
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
}
