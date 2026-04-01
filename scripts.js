/* THEME TOGGLE */
const toggle = document.getElementById("themeToggle");
toggle.onclick = () => {
  document.body.classList.toggle("light");
  toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
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
const particles = [];
for (let i = 0; i < 100; i++) {
  particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 1, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5 });
}
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(58,160,255,0.7)";
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

  // DRAGGING
  el.onmousedown = e => {
    e.preventDefault();
    const offsetX = e.clientX - el.getBoundingClientRect().left;
    const offsetY = e.clientY - el.getBoundingClientRect().top;
    function move(ev) {
      n.x = ev.clientX - offsetX;
      n.y = ev.clientY - offsetY;
      n.el.style.left = n.x + "px";
      n.el.style.top = n.y + "px";
      updateLinks();
    }
    function up() { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
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
    t: Math.random(), // randomized start
    el: document.createElement("div")
  });
  let pkt = packets[packets.length - 1];
  pkt.el.className = "link";
  pkt.el.style.background = "yellow";
  pkt.el.style.height = "4px";
  pkt.el.style.borderRadius = "2px";
  pkt.el.style.position = "absolute";
  net.appendChild(pkt.el);
}
links.forEach(l => {
  for (let i = 0; i < 3; i++) createPacket(l.a, l.b); // multiple packets per link
});

function animatePackets() {
  packets.forEach(p => {
    p.t += 0.005; if (p.t > 1) p.t = 0;
    // CURVED PATH USING QUADRATIC BEZIER
    const cx = (p.sx + p.ex) / 2; const cy = Math.min(p.sy, p.ey) - 50;
    const x = Math.pow(1 - p.t, 2) * p.sx + 2 * (1 - p.t) * p.t * cx + Math.pow(p.t, 2) * p.ex;
    const y = Math.pow(1 - p.t, 2) * p.sy + 2 * (1 - p.t) * p.t * cy + Math.pow(p.t, 2) * p.ey;
    p.el.style.left = x + "px";
    p.el.style.top = y + "px";
    p.el.style.width = "4px";
    p.el.style.background = "hsl(" + (p.t * 360) + ", 100%, 50%)"; // neon color
  });
  requestAnimationFrame(animatePackets);
}
animatePackets();

/* ZOOM + PAN */
let scale = 1, panX = 0, panY = 0;
let isPanning = false, start = { x: 0, y: 0 };
const wrapper = document.getElementById("networkWrapper");
wrapper.addEventListener("wheel", e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.min(Math.max(0.5, scale + delta), 2);
  net.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`;
});
wrapper.addEventListener("mousedown", e => { isPanning = true; start.x = e.clientX - panX; start.y = e.clientY - panY; });
wrapper.addEventListener("mousemove", e => { if (!isPanning) return; panX = e.clientX - start.x; panY = e.clientY - start.y; net.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`; });
wrapper.addEventListener("mouseup", () => { isPanning = false; });
wrapper.addEventListener("mouseleave", () => { isPanning = false; });
wrapper.addEventListener("touchstart", e => { isPanning = true; start.x = e.touches[0].clientX - panX; start.y = e.touches[0].clientY - panY; });
wrapper.addEventListener("touchmove", e => { if (!isPanning) return; panX = e.touches[0].clientX - start.x; panY = e.touches[0].clientY - start.y; net.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`; });
wrapper.addEventListener("touchend", () => { isPanning = false; });

/* TERMINAL */
const out = document.getElementById("terminalOutput");
const input = document.getElementById("terminalInput");
function log(m) { const d = document.createElement("div"); d.textContent = m; out.appendChild(d); out.scrollTop = out.scrollHeight; }
input.addEventListener("keydown", e => { if (e.key === "Enter") { runCommand(input.value); input.value = ""; } });
function runCommand(cmd) {
  if (cmd === "help") log("help, nodes, download resume");
  else if (cmd === "nodes") nodes.forEach(n => log(`${n.id} - active packets: ${packets.filter(p => (p.sx-40===n.x && p.sy-25===n.y)).length}`));
  else if (cmd === "download resume") { const a = document.createElement("a"); a.href = "resume.pdf"; a.download = "Ryan_Blackwood_Resume.pdf"; a.click(); log("Downloading..."); }
  else log("Unknown command");
}