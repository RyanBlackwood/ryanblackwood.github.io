/* THEME */
if(localStorage.getItem("theme")==="true") document.body.classList.add("light");
document.getElementById("themeToggle").onclick=()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light"));
};

/* SUBTITLE */
const text="Engineer | Mechanic | Tinkerer";
let i=0;
(function(){
  if(i<=text.length){
    subtitle.textContent=text.slice(0,i++);
    setTimeout(arguments.callee,50);
  }
})();

/* =========================
   CANVAS SETUP
========================= */
const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");
const wrapper = document.getElementById("networkWrapper");

function resizeCanvas(){
  canvas.width = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ===== PARTICLES ===== */
const pCanvas = document.getElementById("particles");
const pCtx = pCanvas.getContext("2d");

function resizeParticles(){
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
}
resizeParticles();
window.addEventListener("resize", resizeParticles);

let particles = Array.from({length:80},()=>({
  x:Math.random()*pCanvas.width,
  y:Math.random()*pCanvas.height,
  r:Math.random()*2
}));

function drawParticles(){
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);

  const glow = getComputedStyle(document.body).getPropertyValue('--glow');

  particles.forEach(p=>{
    pCtx.beginPath();
    pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    pCtx.fillStyle = glow + "55";
    pCtx.fill();

    p.y += 0.2;
    if(p.y > pCanvas.height) p.y = 0;
  });

  requestAnimationFrame(drawParticles);
}
drawParticles();

/* =========================
   CAMERA (WORLD → SCREEN)
========================= */
let camera = {
  x: 0,
  y: 0,
  scale: 1
};

function worldToScreen(x, y){
  return {
    x: (x - camera.x) * camera.scale,
    y: (y - camera.y) * camera.scale
  };
}

function screenToWorld(x, y){
  return {
    x: x / camera.scale + camera.x,
    y: y / camera.scale + camera.y
  };
}

/* =========================
   NODES (WORLD SPACE)
========================= */
let nodes = [
  {id:"Internet", x:100, y:200},
  {id:"Proxmox", x:400, y:200},
  {id:"OPNsense", x:650, y:120},
  {id:"Switch", x:850, y:250}
];

let links = [
  {a:"Internet", b:"Proxmox", load:0.6},
  {a:"Proxmox", b:"OPNsense", load:0.7},
  {a:"OPNsense", b:"Switch", load:0.8}
];

/* =========================
   INTERACTION STATE
========================= */
let activeNode = null;
let isDraggingNode = false;
let isPanning = false;

let lastX = 0;
let lastY = 0;

/* =========================
   MOUSE EVENTS
========================= */
canvas.addEventListener("mousedown", e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const world = screenToWorld(mx, my);

  // check node hit
  activeNode = nodes.find(n=>{
    return Math.hypot(n.x - world.x, n.y - world.y) < 20;
  });

  if(activeNode){
    isDraggingNode = true;
  } else {
    isPanning = true;
  }

  lastX = mx;
  lastY = my;
});

window.addEventListener("mousemove", e=>{
  if(!isDraggingNode && !isPanning) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const dx = mx - lastX;
  const dy = my - lastY;

  if(isDraggingNode && activeNode){
    const world = screenToWorld(mx, my);
    activeNode.x = world.x;
    activeNode.y = world.y;
  }

  if(isPanning){
    camera.x -= dx / camera.scale;
    camera.y -= dy / camera.scale;
  }

  lastX = mx;
  lastY = my;
});

window.addEventListener("mouseup", ()=>{
  isDraggingNode = false;
  isPanning = false;
});

/* =========================
   ZOOM (SCROLL)
========================= */
canvas.addEventListener("wheel", e=>{
  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const before = screenToWorld(mx, my);

  camera.scale *= zoom;
  camera.scale = Math.max(0.5, Math.min(2.5, camera.scale));

  const after = screenToWorld(mx, my);

  camera.x += before.x - after.x;
  camera.y += before.y - after.y;
});

/* =========================
   TOUCH SUPPORT (MOBILE)
========================= */
let lastDist = 0;

canvas.addEventListener("touchstart", e=>{
  const rect = canvas.getBoundingClientRect();

  if(e.touches.length === 1){
    const t = e.touches[0];
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;

    const world = screenToWorld(mx, my);

    activeNode = nodes.find(n=>{
      return Math.hypot(n.x - world.x, n.y - world.y) < 20;
    });

    if(activeNode){
      isDraggingNode = true;
    } else {
      isPanning = true;
    }

    lastX = mx;
    lastY = my;
  }

  if(e.touches.length === 2){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastDist = Math.sqrt(dx*dx + dy*dy);
  }
});

canvas.addEventListener("touchmove", e=>{
  const rect = canvas.getBoundingClientRect();

  if(e.touches.length === 1){
    const t = e.touches[0];
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;

    const dx = mx - lastX;
    const dy = my - lastY;

    if(isDraggingNode && activeNode){
      const world = screenToWorld(mx, my);
      activeNode.x = world.x;
      activeNode.y = world.y;
    }

    if(isPanning){
      camera.x -= dx / camera.scale;
      camera.y -= dy / camera.scale;
    }

    lastX = mx;
    lastY = my;
  }

  if(e.touches.length === 2){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    const zoom = dist / lastDist;
    camera.scale *= zoom;
    camera.scale = Math.max(0.5, Math.min(2.5, camera.scale));

    lastDist = dist;
  }
});

canvas.addEventListener("touchend", ()=>{
  isDraggingNode = false;
  isPanning = false;
});

/* =========================
   PACKETS (CAPPED)
========================= */
let packets = [];
const MAX_PACKETS = 100;

function spawnPackets(){
  links.forEach(l=>{
    if(Math.random() < l.load && packets.length < MAX_PACKETS){
      packets.push({
        link:l,
        t:Math.random(),
        speed:0.003 + Math.random()*0.01
      });
    }
  });
}
setInterval(spawnPackets, 200);

/* =========================
   DRAW LOOP
========================= */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const glow = getComputedStyle(document.body).getPropertyValue('--glow');

  // LINKS
  links.forEach(l=>{
    const a = nodes.find(n=>n.id===l.a);
    const b = nodes.find(n=>n.id===l.b);

    const p1 = worldToScreen(a.x, a.y);
    const p2 = worldToScreen(b.x, b.y);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = glow;
    ctx.lineWidth = 2 + l.load * 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = glow;
    ctx.stroke();
  });

  // PACKETS
  packets.forEach(p=>{
    const a = nodes.find(n=>n.id===p.link.a);
    const b = nodes.find(n=>n.id===p.link.b);

    const t = p.t;
    const wx = a.x + (b.x - a.x) * t;
    const wy = a.y + (b.y - a.y) * t;

    const pos = worldToScreen(wx, wy);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI*2);
    ctx.fillStyle = glow;
    ctx.fill();

    p.t += p.speed;
    if(p.t > 1) p.t = 0;
  });

  // NODES
  nodes.forEach(n=>{
    const p = worldToScreen(n.x, n.y);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
    ctx.fillStyle = "#111";
    ctx.fill();

    ctx.strokeStyle = glow;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.fillText(n.id, p.x + 14, p.y + 4);
  });

  requestAnimationFrame(draw);
}
draw();