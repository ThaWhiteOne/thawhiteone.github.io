
// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0;
ring.style.transition = 'transform 0.08s linear, width 0.2s ease, height 0.2s ease, border-color 0.2s ease';
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
}, { passive: true });
document.querySelectorAll('a,button,.demo-tab,.cap-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='56px'; ring.style.height='56px'; ring.style.borderColor='rgba(59,130,246,0.7)'; }, { passive: true });
  el.addEventListener('mouseleave', () => { ring.style.width='36px'; ring.style.height='36px'; ring.style.borderColor='rgba(59,130,246,0.5)'; }, { passive: true });
});

// SCROLL REVEAL
const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// SNAKE ANIMATION (auto-playing, shows Python in action)
(function() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const CELL = 20, COLS = 21, ROWS = 21;
  let snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  let food = {x:15,y:10};
  let dir = {x:1,y:0}, nextDir = {x:1,y:0};
  let score = 0;

  function placeFood() {
    do { food = {x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
    while (snake.some(s => s.x===food.x && s.y===food.y));
  }

  function step() {
    dir = nextDir;
    const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};
    // wrap around
    head.x = (head.x+COLS)%COLS; head.y = (head.y+ROWS)%ROWS;
    // self collision — reset
    if (snake.some(s=>s.x===head.x&&s.y===head.y)) {
      snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
      dir={x:1,y:0}; nextDir={x:1,y:0}; score=0; placeFood(); return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) { score++; placeFood(); }
    else snake.pop();
  }

  // Simple AI — always move toward food
  function aiMove() {
    const h = snake[0];
    const dx = food.x - h.x, dy = food.y - h.y;
    const opts = [];
    if (dx > 0 && !(dir.x===-1)) opts.push({x:1,y:0});
    else if (dx < 0 && !(dir.x===1)) opts.push({x:-1,y:0});
    if (dy > 0 && !(dir.y===-1)) opts.push({x:0,y:1});
    else if (dy < 0 && !(dir.y===1)) opts.push({x:0,y:-1});
    if (opts.length > 0) nextDir = opts[0];
    else {
      const fallback = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
        .filter(d => !(d.x===-dir.x&&d.y===-dir.y));
      nextDir = fallback[Math.floor(Math.random()*fallback.length)] || dir;
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(3,5,8,0.95)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid
    ctx.strokeStyle = 'rgba(59,130,246,0.06)';
    ctx.lineWidth = 0.5;
    for(let i=0;i<=COLS;i++) { ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,ROWS*CELL); ctx.stroke(); }
    for(let i=0;i<=ROWS;i++) { ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(COLS*CELL,i*CELL); ctx.stroke(); }

    // food
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
    ctx.fillRect(food.x*CELL+3, food.y*CELL+3, CELL-6, CELL-6);
    ctx.shadowBlur = 0;

    // snake
    snake.forEach((s,i) => {
      const t = 1 - i/snake.length;
      ctx.fillStyle = `rgba(${Math.round(59+t*60)},${Math.round(130+t*60)},246,${0.5+t*0.5})`;
      ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = i===0 ? 16 : 0;
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
    ctx.shadowBlur = 0;

    // score
    ctx.fillStyle = 'rgba(59,130,246,0.6)';
    ctx.font = '500 11px DM Mono, monospace';
    ctx.fillText(`score: ${score}`, 10, canvas.height-10);
    ctx.fillText('// python ai snake', canvas.width-130, canvas.height-10);
  }

  setInterval(() => { aiMove(); step(); draw(); }, 80);
  draw();
})();

// DEMO PLAYGROUND
const demos = [
  {
    title: 'fibonacci.py',
    code: `# Fibonacci sequence generator
def fibonacci(n):
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

# Generate first 10 numbers
result = fibonacci(10)
print("Fibonacci sequence:")
print(result)

# Sum of the sequence
total = sum(result)
print(f"Sum: {total}")

# Find even numbers
evens = [x for x in result if x % 2 == 0]
print(f"Even numbers: {evens}")`,
    run: () => {
      const fib = (n) => { let s=[],a=0,b=1; for(let i=0;i<n;i++){s.push(a);[a,b]=[b,a+b];} return s; };
      const r = fib(10);
      return `Fibonacci sequence:\n[${r.join(', ')}]\nSum: ${r.reduce((a,b)=>a+b,0)}\nEven numbers: [${r.filter(x=>x%2===0).join(', ')}]`;
    }
  },
  {
    title: 'comprehensions.py',
    code: `# Python list comprehensions
numbers = range(1, 21)

# Squares of even numbers
squares = [x**2 for x in numbers if x % 2 == 0]
print("Squares of evens:", squares)

# Word lengths
words = ["python", "is", "amazing", "and", "powerful"]
lengths = {w: len(w) for w in words}
print("Word lengths:", lengths)

# Flatten nested list
matrix = [[1,2,3],[4,5,6],[7,8,9]]
flat = [n for row in matrix for n in row]
print("Flattened:", flat)`,
    run: () => {
      const nums = Array.from({length:20},(_,i)=>i+1);
      const sq = nums.filter(x=>x%2===0).map(x=>x*x);
      const words = ["python","is","amazing","and","powerful"];
      const lengths = Object.fromEntries(words.map(w=>[w,w.length]));
      const flat = [[1,2,3],[4,5,6],[7,8,9]].flat();
      return `Squares of evens: [${sq.join(', ')}]\nWord lengths: {${Object.entries(lengths).map(([k,v])=>`'${k}': ${v}`).join(', ')}}\nFlattened: [${flat.join(', ')}]`;
    }
  },
  {
    title: 'classes.py',
    code: `# Object-Oriented Python
class Developer:
    def __init__(self, name, skills):
        self.name = name
        self.skills = skills
        self.projects = []

    def add_project(self, project):
        self.projects.append(project)
        return self

    def introduce(self):
        return f"Hi, I'm {self.name}!"

    def summary(self):
        return {
            "name": self.name,
            "skills": len(self.skills),
            "projects": len(self.projects)
        }

# Create instance
dev = Developer("Nikola", ["Python", "AI", "React"])
dev.add_project("Portfolio Site").add_project("AI Chatbot")

print(dev.introduce())
print(dev.summary())`,
    run: () => {
      return `Hi, I'm Nikola!\n{'name': 'Nikola', 'skills': 3, 'projects': 2}`;
    }
  },
  {
    title: 'api_client.py',
    code: `# Simulated API client pattern
import json

class APIClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def get_user(self, user_id):
        # Simulated response
        return {
            "id": user_id,
            "name": "Nikola Titirinov",
            "role": "Developer",
            "skills": ["Python", "AI", "FastAPI"]
        }

    def post_message(self, content):
        return {"status": "sent", "content": content}

# Usage
client = APIClient("https://api.example.com", "sk-xxx")
user = client.get_user(42)
print(json.dumps(user, indent=2))

response = client.post_message("Hello from Python!")
print(response)`,
    run: () => {
      return `{\n  "id": 42,\n  "name": "Nikola Titirinov",\n  "role": "Developer",\n  "skills": [\n    "Python",\n    "AI",\n    "FastAPI"\n  ]\n}\n{'status': 'sent', 'content': 'Hello from Python!'}`;
    }
  }
];

let currentDemo = 0;

function loadDemo(idx, tabEl) {
  currentDemo = idx;
  document.getElementById('codeArea').value = demos[idx].code;
  document.getElementById('outputArea').textContent = '// Output will appear here...';
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
}

function runDemo() {
  const out = document.getElementById('outputArea');
  out.textContent = '// Running...\n';
  setTimeout(() => {
    try {
      const result = demos[currentDemo].run();
      out.textContent = result;
    } catch(e) {
      out.textContent = `Error: ${e.message}`;
    }
  }, 400);
}

loadDemo(0, document.querySelector('.demo-tab'));

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
