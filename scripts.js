/* THEME TOGGLE */
const toggle = document.getElementById("themeToggle");
toggle.onclick = () => {
  document.body.classList.toggle("light");
  toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  updateParticleColor();
};

/* TYPING SUBTITLE */
const subtitle = "Engineer | Mechanic | Tinkerer";
let subIndex = 0;
function typeSubtitle() {
  if (subIndex <= subtitle.length) {
    document.getElementById("subtitle").textContent = subtitle.slice(0, subIndex);
    subIndex++;
    setTimeout(typeSubtitle, 80);
  }
}
typeSubtitle();

/* SCROLL AND ACTIVE TABS */
const tabs = document.querySelectorAll(".tab");
tabs.forEach(tab => {
  tab.onclick = () => {
    const el = document.getElementById(tab.dataset.target);
    window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  };
});
window.addEventListener("scroll", () => {
  tabs.forEach(tab => {
    const sec = document.getElementById(tab.dataset.target);
    const r = sec.getBoundingClientRect();
    r.top <= 80 && r.bottom > 80 ? tab.classList.add("active") : tab.classList.remove("active");
  });
});

/* PARTICLE BACKGROUND */
const canvas = document.getElementById("particles");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let particleColor = getComputedStyle(document.body).getPropertyValue("--glow") || "#3aa0ff";
function updateParticleColor() { particleColor = getComputedStyle(document.body).getPropertyValue("--glow"); }
const particles = [];
for (let i = 0; i < 120; i++) {
  particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 1, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5 });
}
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = particleColor + "88";
    ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x > canvas.width) p.x = 0; if (p.x < 0) p.x = canvas.width;
    if (p.y > canvas.height) p.y = 0; if (p.y < 0) p.y = canvas.height;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

/* HOMELAB NETWORK */
const net = document.getElementById("networkDiagram");
let nodes = [
  { id: "Internet", x: 50, y: 250 },
  { id: "Modem", x: 200, y: 250 },
  { id: "Proxmox", x: 350, y: 250 },
  { id: "OPNsense", x: 500, y: 250 },
  { id: "Switch", x: 650, y: 250 },
  { id: "PC", x: 900, y: 200 },
  { id: "Minecraft", x: 350, y: 150 },
  { id: "Rust", x: 320, y: 150 },
  { id: "Valheim", x: 380, y: 150 }
];
let nodesMap = {};
nodes.forEach(n => {
  const el = document.createElement("div");
  el.className = "node";
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  el.textContent = n.id;
  net.appendChild(el);
  n.el = el;
  nodesMap[n.id] = n;

  /* DRAGGING: Right click or tap-hold */
  let isDragging = false, offsetX = 0, offsetY = 0;
  el.oncontextmenu = e => e.preventDefault(); // disable context menu

  el.addEventListener("mousedown", e => {
    if (e.button !== 2) return; // right-click only
    isDragging = true; offsetX = e.clientX - el.getBoundingClientRect().left; offsetY = e.clientY - el.getBoundingClientRect().top;
  });
  el.addEventListener("touchstart", e => {
    isDragging = true;
    offsetX = e.touches[0].clientX - el.getBoundingClientRect().left;
    offsetY = e.touches[0].clientY - el.getBoundingClientRect().top;
  });

  const moveNode = e => {
    if (!isDragging) return;
    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;
    n.x = clientX - offsetX;
    n.y = clientY - offsetY;
    n.el.style.left = n.x + "px";
    n.el.style.top = n.y + "px";
    updateLinks();
  };
  const endDrag = () => { isDragging = false; };
  window.addEventListener("mousemove", moveNode);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchmove", moveNode);
  window.addEventListener("touchend", endDrag);
});

/* LINKS */
let linksData = [
  ["Internet", "Modem"], ["Modem", "Proxmox"], ["Proxmox", "OPNsense"], ["OPNsense", "Switch"], ["Switch", "PC"],
  ["Proxmox", "Minecraft"], ["Proxmox", "Rust"], ["Proxmox", "Valheim"]
];
let links = linksData.map(([a, b]) => {
  const el = document.createElement("div");
  el.className = "link";
  net.appendChild(el);
  return { a: nodesMap[a], b: nodesMap[b], el };
});

/* UPDATE LINK POSITIONS */
function updateLinks() {
  links.forEach(l => {
    const x1 = l.a.x + 40, y1 = l.a.y + 25;
    const x2 = l.b.x + 40, y2 = l.b.y + 25;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    l.el.style.width = len + "px";
    l.el.style.left = x1 + "px";
    l.el.style.top = y1 + "px";
    l.el.style.transform = `rotate(${ang}deg)`;
  });
}
setInterval(updateLinks, 16);

/* PACKETS */
const packets = [];
function createPacket(startNode, endNode) {
  packets.push({
    sx: startNode.x + 40,
    sy: startNode.y + 25,
    ex: endNode.x + 40,
    ey: endNode.y + 25,
    t: Math.random(),
    el: document.createElement("div")
  });
  let pkt = packets[packets.length - 1];
  pkt.el.className = "link";
  pkt.el.style.background = "linear-gradient(90deg, #00ffff, #ff00ff)";
  pkt.el.style.height = "4px";
  pkt.el.style.borderRadius = "2px";
  pkt.el.style.position = "absolute";
  pkt.el.style.opacity = 0.9;
  net.appendChild(pkt.el);
}
links.forEach(l => { for (let i = 0; i < 3; i++) createPacket(l.a, l.b); });

function animatePackets() {
  packets.forEach(p => {
    p.t += 0.005; if (p.t > 1) p.t = 0;
    const cx = (p.sx + p.ex) / 2; const cy = Math.min(p.sy, p.ey) - 50;
    const x = Math.pow(1 - p.t, 2) * p.sx + 2 * (1 - p.t) * p.t * cx + Math.pow(p.t, 2) * p.ex;
    const y = Math.pow(1 - p.t, 2) * p.sy + 2 * (1 - p.t) * p.t * cy + Math.pow(p.t, 2) * p.ey;
    p.el.style.left = x + "px";
    p.el.style.top = y + "px";
  });
  requestAnimationFrame(animatePackets);
}
animatePackets();

/* ZOOM + PAN: right-click / tap-hold */
let scale = 1, panX = 0, panY = 0;
let isPanning = false, panStart = { x: 0, y: 0 };
wrapper.addEventListener("wheel", e => { e.preventDefault(); const delta = e.deltaY > 0 ? -0.1 : 0.1; scale = Math.min(Math.max(0.5, scale + delta), 2); net.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`; });
wrapper.addEventListener("contextmenu", e => e.preventDefault());
wrapper.addEventListener("mousedown", e => { if(e.button===2){isPanning=true; panStart.x=e.clientX-panX; panStart.y=e.clientY-panY;} });
wrapper.addEventListener("mousemove", e => { if(!isPanning) return; panX=e.clientX-panStart.x; panY=e.clientY-panStart.y; net.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`; });
wrapper.addEventListener("mouseup", () => { isPanning=false; });
wrapper.addEventListener("mouseleave", () => { isPanning=false; });
wrapper.addEventListener("touchstart", e => { isPanning=true; panStart.x=e.touches[0].clientX-panX; panStart.y=e.touches[0].clientY-panY; });
wrapper.addEventListener("touchmove", e => { if(!isPanning) return; panX=e.touches[0].clientX-panStart.x; panY=e.touches[0].clientY-panStart.y; net.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`; });
wrapper.addEventListener("touchend", () => { isPanning=false; });

/* TERMINAL */
const out = document.getElementById("terminalOutput");
const input = document.getElementById("terminalInput");
function log(m) { const d = document.createElement("div"); d.textContent = m; out.appendChild(d); out.scrollTop = out.scrollHeight; }
input.addEventListener("keydown", e => { if (e.key === "Enter") { runCommand(input.value); input.value = ""; } });
function runCommand(cmd) {
  cmd = cmd.trim().toLowerCase();
  if (cmd === "help") log("help, nodes, download resume, clear");
  else if (cmd === "nodes") nodes.forEach(n => log(`${n.id} - active packets: ${packets.filter(p => (p.sx-40===n.x && p.sy-25===n.y)).length}`));
  else if (cmd === "download resume") { const a = document.createElement("a"); a.href = "resume.pdf"; a.download = "Ryan_Blackwood_Resume.pdf"; a.click(); log("Downloading..."); }
  else if (cmd === "clear") out.innerHTML = "";
  else log("Unknown command");
}