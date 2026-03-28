
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

// HERO — SELF-DRAWING CHART
(function() {
  const canvas = document.getElementById('heroChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD = 50;
  const CW = W - PAD*2, CH = H - PAD*2;

  const datasets = [
    { label:'Revenue', color:'#f97316', data:[12,19,8,25,32,28,41,38,52,48,61,58] },
    { label:'Users', color:'#38bdf8', data:[5,8,6,12,18,15,22,20,28,25,34,32] },
    { label:'Profit', color:'#10b981', data:[3,5,2,8,11,9,15,13,20,18,24,22] },
  ];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  let progress = 0;
  let animatingSet = 0;
  const maxVal = 65;

  function drawHero() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(3,5,8,0.97)';
    ctx.fillRect(0,0,W,H);

    // Grid
    for(let i=0;i<=5;i++) {
      const y = PAD + CH - (i/5)*CH;
      ctx.beginPath(); ctx.moveTo(PAD,y); ctx.lineTo(PAD+CW,y);
      ctx.strokeStyle = 'rgba(249,115,22,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(249,115,22,0.3)'; ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'right'; ctx.fillText(Math.round(i/5*maxVal), PAD-8, y+4);
    }

    // X axis labels
    months.forEach((m,i) => {
      const x = PAD + (i/(months.length-1))*CW;
      ctx.fillStyle = 'rgba(249,115,22,0.3)'; ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'center'; ctx.fillText(m, x, H-PAD+18);
    });

    // Draw datasets up to progress
    datasets.forEach((ds, di) => {
      const pts = ds.data.length;
      const drawUpTo = Math.min(pts-1, progress - di*pts);
      if(drawUpTo < 0) return;

      ctx.beginPath();
      for(let i=0; i<=Math.floor(drawUpTo); i++) {
        const frac = i===Math.floor(drawUpTo) ? (drawUpTo%1||1) : 1;
        const x = PAD + (i/(pts-1))*CW;
        const nextX = PAD + ((i+1)/(pts-1))*CW;
        const y = PAD + CH - (ds.data[i]/maxVal)*CH;
        const nextY = i<pts-1 ? PAD + CH - (ds.data[i+1]/maxVal)*CH : y;
        if(i===0) ctx.moveTo(x,y);
        ctx.lineTo(x + (nextX-x)*frac, y + (nextY-y)*frac);
      }
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = ds.color; ctx.shadowBlur = 8;
      ctx.stroke(); ctx.shadowBlur = 0;

      // Dots
      for(let i=0; i<=Math.floor(drawUpTo); i++) {
        const x = PAD + (i/(pts-1))*CW;
        const y = PAD + CH - (ds.data[i]/maxVal)*CH;
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle = ds.color; ctx.shadowColor = ds.color; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });

    // Legend
    datasets.forEach((ds,i) => {
      const lx = PAD + i*110, ly = 20;
      ctx.beginPath(); ctx.arc(lx+6, ly, 5, 0, Math.PI*2);
      ctx.fillStyle = ds.color; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'left'; ctx.fillText(ds.label, lx+16, ly+4);
    });

    ctx.fillStyle = 'rgba(249,115,22,0.3)'; ctx.font = '11px DM Mono, monospace';
    ctx.textAlign = 'left'; ctx.fillText('// real-time chart', PAD, H-10);

    progress += 0.15;
    if(progress > datasets.length * datasets[0].data.length + 5) progress = 0;
    requestAnimationFrame(drawHero);
  }
  drawHero();
})();

// HELPERS
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// DEMO 1: CHART BUILDER
let chartType = 'line', chartColor = '#f97316';
const datasets = {
  revenue: { label:'Monthly Revenue ($k)', data:[42,58,51,67,73,89,82,95,88,102,97,115], labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  users: { label:'Active Users', data:[1200,1450,1380,1620,1890,2100,1980,2340,2200,2580,2450,2890], labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  performance: { label:'API Response Time (ms)', data:[145,132,158,121,109,134,118,98,125,112,95,108], labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  random: { label:'Random Data', data:Array.from({length:12},()=>Math.floor(Math.random()*100)+10), labels:['A','B','C','D','E','F','G','H','I','J','K','L'] },
};
let currentDataset = 'revenue';

function setChartType(t, el) {
  chartType = t;
  document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderChart();
}
function setDataset(d, el) {
  if(d==='random') datasets.random.data = Array.from({length:12},()=>Math.floor(Math.random()*100)+10);
  currentDataset = d;
  document.querySelectorAll('.dataset-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('chartTitle').textContent = d+'_data.csv';
  renderChart();
}
function setChartColor(c, el) {
  chartColor = c;
  document.querySelectorAll('.color-pick').forEach(p => p.style.borderColor = 'var(--glass-border)');
  el.style.borderColor = '#fff';
  renderChart();
}

function renderChart() {
  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  const W = canvas.width, H = canvas.height;
  const PAD = { top:30, right:20, bottom:40, left:55 };
  const CW = W - PAD.left - PAD.right, CH = H - PAD.top - PAD.bottom;
  const ds = datasets[currentDataset];
  const max = Math.max(...ds.data) * 1.15;
  const rgb = hexToRgb(chartColor);

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(3,5,8,0.98)'; ctx.fillRect(0,0,W,H);

  // Grid
  for(let i=0;i<=5;i++) {
    const y = PAD.top + CH - (i/5)*CH;
    ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+CW,y);
    ctx.strokeStyle = `rgba(${rgb},0.08)`; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle = `rgba(${rgb},0.4)`; ctx.font='11px DM Mono,monospace';
    ctx.textAlign='right'; ctx.fillText(Math.round(i/5*max), PAD.left-8, y+4);
  }

  // X labels
  ds.labels.forEach((l,i) => {
    const x = PAD.left + (i/(ds.labels.length-1))*CW;
    ctx.fillStyle=`rgba(${rgb},0.4)`; ctx.font='11px DM Mono,monospace';
    ctx.textAlign='center'; ctx.fillText(l, x, H-PAD.bottom+18);
  });

  const pts = ds.data.map((v,i) => ({ x: PAD.left+(i/(ds.data.length-1))*CW, y: PAD.top+CH-(v/max)*CH }));

  if(chartType==='area' || chartType==='line') {
    if(chartType==='area') {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, PAD.top+CH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length-1].x, PAD.top+CH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top+CH);
      grad.addColorStop(0, `rgba(${rgb},0.3)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = grad; ctx.fill();
    }
    ctx.beginPath();
    pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = chartColor; ctx.lineWidth=2.5;
    ctx.shadowColor=chartColor; ctx.shadowBlur=8; ctx.stroke(); ctx.shadowBlur=0;
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2);
      ctx.fillStyle=chartColor; ctx.shadowColor=chartColor; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
    });
  } else if(chartType==='bar') {
    const bw = CW/ds.data.length*0.6;
    ds.data.forEach((v,i) => {
      const x = PAD.left+(i/(ds.data.length-1))*CW-bw/2;
      const bh = (v/max)*CH;
      const y = PAD.top+CH-bh;
      const grad = ctx.createLinearGradient(0,y,0,y+bh);
      grad.addColorStop(0,chartColor); grad.addColorStop(1,`rgba(${rgb},0.3)`);
      ctx.fillStyle=grad;
      ctx.shadowColor=chartColor; ctx.shadowBlur=6;
      ctx.fillRect(x,y,bw,bh); ctx.shadowBlur=0;
    });
  } else if(chartType==='scatter') {
    ds.data.forEach((v,i) => {
      const x = PAD.left+(i/(ds.data.length-1))*CW;
      const y = PAD.top+CH-(v/max)*CH;
      const r = 4+Math.random()*4;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb},0.7)`;
      ctx.shadowColor=chartColor; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
    });
  }

  // Stats
  const vals = ds.data;
  const mean = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
  const sorted = [...vals].sort((a,b)=>a-b);
  const median = sorted.length%2===0 ? ((sorted[sorted.length/2-1]+sorted[sorted.length/2])/2).toFixed(1) : sorted[Math.floor(sorted.length/2)].toFixed(1);
  const stddev = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/vals.length).toFixed(1);
  document.getElementById('chartStats').innerHTML = `Mean: ${mean}<br>Median: ${median}<br>Std Dev: ${stddev}<br>Min: ${Math.min(...vals)}<br>Max: ${Math.max(...vals)}`;
}
window.addEventListener('resize', renderChart);
setTimeout(renderChart, 100);

// DEMO 2: CSV ANALYZER
function analyzeCSV() {
  const raw = document.getElementById('csvInput').value.trim();
  const lines = raw.split('\n').filter(l=>l.trim());
  const headers = lines[0].split(',').map(h=>h.trim());
  const rows = lines.slice(1).map(l=>l.split(',').map(v=>v.trim()));
  const body = document.getElementById('insightsBody');

  const numCols = headers.filter((_,i) => rows.every(r=>!isNaN(parseFloat(r[i]))));
  const catCols = headers.filter(h=>!numCols.includes(h));

  let html = `<div class="insight-card"><div class="insight-title">📋 Dataset Overview</div><div class="insight-value">Rows: ${rows.length} &nbsp;|&nbsp; Columns: ${headers.length}<br>Numeric: ${numCols.join(', ')}<br>Categorical: ${catCols.join(', ')}</div></div>`;

  numCols.forEach(col => {
    const i = headers.indexOf(col);
    const vals = rows.map(r=>parseFloat(r[i])).filter(v=>!isNaN(v));
    const mean = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
    const sorted = [...vals].sort((a,b)=>a-b);
    const median = sorted.length%2===0?((sorted[sorted.length/2-1]+sorted[sorted.length/2])/2).toFixed(1):sorted[Math.floor(sorted.length/2)].toFixed(1);
    const std = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/vals.length).toFixed(1);
    const pct = Math.min(100, Math.round((parseFloat(mean)/(Math.max(...vals)||1))*100));
    html += `<div class="insight-card"><div class="insight-title">📊 ${col}</div><div class="insight-value">Mean: ${mean} &nbsp; Median: ${median} &nbsp; Std: ${std}<br>Range: ${Math.min(...vals)} → ${Math.max(...vals)}</div><div class="insight-bar"><div class="insight-fill" style="width:${pct}%"></div></div></div>`;
  });

  catCols.forEach(col => {
    const i = headers.indexOf(col);
    const counts = {};
    rows.forEach(r=>{ counts[r[i]] = (counts[r[i]]||0)+1; });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}: ${v}`).join(', ');
    html += `<div class="insight-card"><div class="insight-title">🏷️ ${col}</div><div class="insight-value">Unique: ${Object.keys(counts).length}<br>Top: ${top}</div></div>`;
  });

  body.innerHTML = html;
}

// DEMO 3: STATS CALCULATOR
const presets = {
  normal: '12,15,14,16,13,15,14,13,16,15,14,13,15,16,14,13,15,14,16,13',
  skewed: '2,3,2,4,3,2,5,3,2,4,3,2,45,3,2,4,3,2,3,2',
  outlier: '20,22,21,23,20,22,21,23,20,22,21,23,85,20,22,21,23,20,22',
  uniform: '10,20,30,40,50,60,70,80,90,100,10,20,30,40,50,60,70,80,90,100',
};
function loadPreset(p) { document.getElementById('numbersInput').value = presets[p]; calcStats(); }

function calcStats() {
  const raw = document.getElementById('numbersInput').value;
  const vals = raw.split(/[,\n\s]+/).map(v=>parseFloat(v.trim())).filter(v=>!isNaN(v));
  if(vals.length < 2) return;

  const n = vals.length;
  const mean = vals.reduce((a,b)=>a+b,0)/n;
  const sorted = [...vals].sort((a,b)=>a-b);
  const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
  const variance = vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/n;
  const stddev = Math.sqrt(variance);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min;
  const q1 = sorted[Math.floor(n*0.25)], q3 = sorted[Math.floor(n*0.75)];
  const iqr = q3 - q1;
  const outliers = vals.filter(v => v < q1-1.5*iqr || v > q3+1.5*iqr);
  const skewness = vals.reduce((a,b)=>a+Math.pow((b-mean)/stddev,3),0)/n;

  document.getElementById('statsResults').innerHTML = `
    <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.85rem;margin-bottom:16px;color:var(--accent);">// Statistics (n=${n})</div>
    ${[['Mean',mean.toFixed(2)],['Median',median.toFixed(2)],['Std Deviation',stddev.toFixed(2)],['Variance',variance.toFixed(2)],['Min',min],['Max',max],['Range',range.toFixed(2)],['Q1',q1.toFixed(2)],['Q3',q3.toFixed(2)],['IQR',iqr.toFixed(2)],['Skewness',skewness.toFixed(3)],['Outliers',outliers.length > 0 ? outliers.join(', ') : 'None']].map(([k,v])=>`
    <div class="stat-row"><span class="stat-name">${k}</span><span class="stat-val">${v}</span></div>`).join('')}`;

  // Distribution histogram
  const dc = document.getElementById('distCanvas');
  dc.width = dc.offsetWidth;
  const dctx = dc.getContext('2d');
  const DW = dc.width, DH = dc.height;
  const bins = 10;
  const bsize = range/bins;
  const counts = Array(bins).fill(0);
  vals.forEach(v => { const bi = Math.min(bins-1, Math.floor((v-min)/bsize)); counts[bi]++; });
  const maxCount = Math.max(...counts);
  dctx.clearRect(0,0,DW,DH);
  dctx.fillStyle = 'rgba(3,5,8,0.9)'; dctx.fillRect(0,0,DW,DH);
  const bw = DW/bins;
  counts.forEach((c,i) => {
    const bh = (c/maxCount)*(DH-20);
    const grad = dctx.createLinearGradient(0,DH-20-bh,0,DH-20);
    grad.addColorStop(0,'#f97316'); grad.addColorStop(1,'rgba(249,115,22,0.3)');
    dctx.fillStyle=grad;
    dctx.fillRect(i*bw+2, DH-20-bh, bw-4, bh);
    dctx.fillStyle='rgba(249,115,22,0.4)'; dctx.font='9px DM Mono,monospace';
    dctx.textAlign='center'; dctx.fillText(c, i*bw+bw/2, DH-22-bh-2);
  });
}
setTimeout(calcStats, 200);

// DEMO 4: VIZ GALLERY
function drawGallery() {
  // PIE CHART
  const c1 = document.getElementById('gc1');
  c1.width = c1.offsetWidth;
  const ctx1 = c1.getContext('2d');
  const W1=c1.width, H1=c1.height, cx1=W1/2, cy1=H1/2, r1=Math.min(W1,H1)*0.35;
  ctx1.fillStyle='rgba(3,5,8,0.98)'; ctx1.fillRect(0,0,W1,H1);
  const pieData = [{v:35,c:'#f97316',l:'Python'},{v:28,c:'#38bdf8',l:'React'},{v:20,c:'#a855f7',l:'AI'},{v:17,c:'#10b981',l:'Other'}];
  let start = -Math.PI/2;
  pieData.forEach(d => {
    const end = start + (d.v/100)*Math.PI*2;
    ctx1.beginPath(); ctx1.moveTo(cx1,cy1); ctx1.arc(cx1,cy1,r1,start,end);
    ctx1.fillStyle=d.c; ctx1.shadowColor=d.c; ctx1.shadowBlur=10; ctx1.fill(); ctx1.shadowBlur=0;
    const mid = (start+end)/2;
    ctx1.fillStyle='rgba(255,255,255,0.7)'; ctx1.font='10px DM Mono,monospace'; ctx1.textAlign='center';
    ctx1.fillText(`${d.l} ${d.v}%`, cx1+Math.cos(mid)*(r1*0.65), cy1+Math.sin(mid)*(r1*0.65)+4);
    start = end;
  });

  // HEATMAP
  const c2 = document.getElementById('gc2');
  c2.width = c2.offsetWidth;
  const ctx2 = c2.getContext('2d');
  const W2=c2.width, H2=c2.height;
  ctx2.fillStyle='rgba(3,5,8,0.98)'; ctx2.fillRect(0,0,W2,H2);
  const rows2=7, cols2=12, cw=(W2-40)/cols2, ch=(H2-30)/rows2;
  const days=['M','T','W','T','F','S','S'];
  for(let r=0;r<rows2;r++) for(let c=0;c<cols2;c++) {
    const v=Math.random();
    const alpha=0.1+v*0.9;
    ctx2.fillStyle=`rgba(249,115,22,${alpha})`;
    ctx2.fillRect(20+c*cw+1,10+r*ch+1,cw-2,ch-2);
  }
  days.forEach((d,i)=>{ctx2.fillStyle='rgba(249,115,22,0.4)';ctx2.font='9px DM Mono,monospace';ctx2.textAlign='right';ctx2.fillText(d,16,10+i*ch+ch/2+4);});

  // BUBBLE CHART
  const c3 = document.getElementById('gc3');
  c3.width = c3.offsetWidth;
  const ctx3 = c3.getContext('2d');
  const W3=c3.width, H3=c3.height;
  ctx3.fillStyle='rgba(3,5,8,0.98)'; ctx3.fillRect(0,0,W3,H3);
  const colors3=['#f97316','#38bdf8','#a855f7','#10b981','#f87171'];
  for(let i=0;i<18;i++) {
    const x=40+Math.random()*(W3-80), y=20+Math.random()*(H3-40), r=6+Math.random()*22;
    ctx3.beginPath(); ctx3.arc(x,y,r,0,Math.PI*2);
    const c=colors3[i%5];
    ctx3.fillStyle=c+'55'; ctx3.strokeStyle=c; ctx3.lineWidth=1.5;
    ctx3.shadowColor=c; ctx3.shadowBlur=8; ctx3.fill(); ctx3.stroke(); ctx3.shadowBlur=0;
  }

  // RADAR CHART
  const c4 = document.getElementById('gc4');
  c4.width = c4.offsetWidth;
  const ctx4 = c4.getContext('2d');
  const W4=c4.width, H4=c4.height, cx4=W4/2, cy4=H4/2, r4=Math.min(W4,H4)*0.35;
  ctx4.fillStyle='rgba(3,5,8,0.98)'; ctx4.fillRect(0,0,W4,H4);
  const skills=['Python','AI','React','APIs','Data','DevOps'];
  const vals4=[9,9,7,8,8,6];
  const n=skills.length;
  // Grid
  for(let ring=1;ring<=3;ring++) {
    ctx4.beginPath();
    for(let i=0;i<n;i++) {
      const a=-Math.PI/2+(i/n)*Math.PI*2;
      const x=cx4+Math.cos(a)*(r4*ring/3), y=cy4+Math.sin(a)*(r4*ring/3);
      i===0?ctx4.moveTo(x,y):ctx4.lineTo(x,y);
    }
    ctx4.closePath(); ctx4.strokeStyle='rgba(249,115,22,0.1)'; ctx4.stroke();
  }
  // Data
  ctx4.beginPath();
  vals4.forEach((v,i) => {
    const a=-Math.PI/2+(i/n)*Math.PI*2;
    const x=cx4+Math.cos(a)*(r4*v/10), y=cy4+Math.sin(a)*(r4*v/10);
    i===0?ctx4.moveTo(x,y):ctx4.lineTo(x,y);
  });
  ctx4.closePath();
  ctx4.fillStyle='rgba(249,115,22,0.2)'; ctx4.strokeStyle='#f97316';
  ctx4.lineWidth=2; ctx4.shadowColor='#f97316'; ctx4.shadowBlur=8;
  ctx4.fill(); ctx4.stroke(); ctx4.shadowBlur=0;
  // Labels
  skills.forEach((s,i)=>{
    const a=-Math.PI/2+(i/n)*Math.PI*2;
    const x=cx4+Math.cos(a)*(r4+20), y=cy4+Math.sin(a)*(r4+20);
    ctx4.fillStyle='rgba(249,115,22,0.6)'; ctx4.font='10px DM Mono,monospace'; ctx4.textAlign='center';
    ctx4.fillText(s,x,y+4);
  });
}

function switchDemo(name, tabEl) {
  ['chart','csv','stats','gallery'].forEach(d => document.getElementById(`demo-${d}`).style.display='none');
  document.getElementById(`demo-${name}`).style.display='block';
  document.querySelectorAll('.demo-tab').forEach(t=>t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
  if(name==='chart') setTimeout(renderChart,50);
  if(name==='gallery') setTimeout(drawGallery,50);
  if(name==='stats') setTimeout(calcStats,50);
}
