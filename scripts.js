/* ===============================
   THEME & TERMINAL PERSISTENCE
   =============================== */
const themeToggle = document.getElementById("themeToggle");
const terminalToggle = document.getElementById("terminalToggle");
const terminal = document.getElementById("terminal");

function saveSettings(){
  localStorage.setItem("theme", document.body.classList.contains("light")?"light":"dark");
  localStorage.setItem("terminalVisible", terminal.style.display!=="none");
}

function loadSettings(){
  if(localStorage.getItem("theme")==="light") document.body.classList.add("light");
  themeToggle.textContent = document.body.classList.contains("light")?"☀️":"🌙";
  if(localStorage.getItem("terminalVisible")==="true") terminal.style.display="flex"; else terminal.style.display="none";
  updateColors();
}

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light")?"☀️":"🌙";
  updateColors();
  saveSettings();
};

terminalToggle.onclick = () => {
  terminal.style.display = terminal.style.display==="none"?"flex":"none";
  saveSettings();
};

/* ===============================
   SUBTITLE TYPING & GLOW
   =============================== */
const subtitleText = "Engineer | Mechanic | Tinkerer";
let subIndex = 0;
function typeSubtitle() {
  if(subIndex <= subtitleText.length){
    document.getElementById("subtitle").textContent = subtitleText.slice(0, subIndex);
    subIndex++;
    setTimeout(typeSubtitle, 80);
  }
}
typeSubtitle();

/* ===============================
   TABS SCROLL & ACTIVE HIGHLIGHT
   =============================== */
const tabs = document.querySelectorAll(".tab");
const headerHeight = document.querySelector("header").offsetHeight;

tabs.forEach(tab=>{
  tab.onclick=()=>{
    const el=document.getElementById(tab.dataset.target);
    window.scrollTo({top: el.offsetTop - headerHeight, behavior:"smooth"});
  };
});

window.addEventListener("scroll",()=>{
  tabs.forEach(tab=>{
    const sec=document.getElementById(tab.dataset.target);
    const r=sec.getBoundingClientRect();
    if(r.top<=headerHeight && r.bottom>headerHeight){
      tab.classList.add("active");
    }else tab.classList.remove("active");
  });
});

/* ===============================
   GLOW COLOR UPDATE
   =============================== */
function updateColors(){
  const glowColor = document.body.classList.contains("light")?"#fdd835":"#3aa0ff";
  document.getElementById("subtitle").style.textShadow=`0 0 8px ${glowColor}`;
  tabs.forEach(tab=>{
    if(tab.classList.contains("active")) tab.style.textShadow=`0 0 8px ${glowColor}`;
    else tab.style.textShadow="none";
  });
  particleColor = glowColor;
}

/* ===============================
   BACKGROUND PARTICLES
   =============================== */
const canvas = document.getElementById("particles");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let particleColor = "#3aa0ff";

const particles=[];
for(let i=0;i<120;i++) particles.push({
  x:Math.random()*canvas.width,
  y:Math.random()*canvas.height,
  r:Math.random()*2+1,
  dx:(Math.random()-0.5)*0.5,
  dy:(Math.random()-0.5)*0.5
});

function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=particleColor+"88";
    ctx.fill();
    p.x+=p.dx; p.y+=p.dy;
    if(p.x>canvas.width)p.x=0;if(p.x<0)p.x=canvas.width;
    if(p.y>canvas.height)p.y=0;if(p.y<0)p.y=canvas.height;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener("resize",()=>{
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
});

/* ===============================
   TERMINAL FUNCTIONALITY
   =============================== */
const out=document.getElementById("terminalOutput");
const input=document.getElementById("terminalInput");

function log(m){
  let i=0;
  const d=document.createElement("div");
  out.appendChild(d);
  function typeChar(){
    if(i<m.length){
      d.textContent+=m[i]; i++;
      setTimeout(typeChar,20);
    }else out.scrollTop=out.scrollHeight;
  }
  typeChar();
}

function runCommand(cmd){
  cmd=cmd.trim().toLowerCase();
  if(cmd==="help") log("help, nodes, download resume, clear");
  else if(cmd==="nodes") nodes.forEach(n=>log(`${n.id}`));
  else if(cmd==="download resume"){
    const a=document.createElement("a");
    a.href="resume.pdf";
    a.download="Ryan_Blackwood_Resume.pdf";
    a.click();
    log("Downloading...");
  }
  else if(cmd==="clear") out.innerHTML="";
  else log("Unknown command");
}

input.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    runCommand(input.value);
    input.value="";
  }
});

/* ===============================
   HOMELAB CANVAS + NODES + PACKETS
   =============================== */
const networkCanvas = document.getElementById("networkCanvas");
const nctx = networkCanvas.getContext("2d");
const nodesDiv = document.getElementById("networkNodes");
const wrapper = document.getElementById("networkWrapper");
networkCanvas.width = wrapper.offsetWidth;
networkCanvas.height = wrapper.offsetHeight;

/* Define nodes */
let nodes=[
  {id:"Internet",x:50,y:150},
  {id:"Modem",x:200,y:150},
  {id:"Proxmox",x:350,y:150},
  {id:"OPNsense",x:500,y:150},
  {id:"Switch",x:650,y:150},
  {id:"PC",x:900,y:150}
];
let nodesMap={};

/* Create HTML node divs */
nodes.forEach(n=>{
  const el=document.createElement("div");
  el.className="node";
  el.style.left=n.x+"px";
  el.style.top=n.y+"px";
  el.textContent=n.id;
  nodesDiv.appendChild(el);
  n.el=el;
  nodesMap[n.id]=n;

  /* Dragging */
  let isDragging=false, offsetX=0, offsetY=0;
  el.onmousedown = e => { isDragging=true; offsetX=e.clientX-n.x; offsetY=e.clientY-n.y; };
  el.addEventListener("touchstart",e=>{ isDragging=true; offsetX=e.touches[0].clientX-n.x; offsetY=e.touches[0].clientY-n.y; });

  const moveNode = e => {
    if(!isDragging) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    n.x = clientX - offsetX;
    n.y = clientY - offsetY;
    n.el.style.left = n.x+"px";
    n.el.style.top = n.y+"px";
  };
  const endDrag = ()=>{ isDragging=false; };
  window.addEventListener("mousemove",moveNode);
  window.addEventListener("mouseup",endDrag);
  window.addEventListener("touchmove",moveNode);
  window.addEventListener("touchend",endDrag);
});

/* Define links */
let linksData=[["Internet","Modem"],["Modem","Proxmox"],["Proxmox","OPNsense"],["OPNsense","Switch"],["Switch","PC"]];

const packetsPerLink = 3;
let packets = [];
linksData.forEach(([a,b])=>{
  for(let i=0;i<packetsPerLink;i++){
    packets.push({ link:[a,b], progress: Math.random() });
  }
});

/* Draw network + packets */
function drawNetwork(){
  nctx.clearRect(0,0,networkCanvas.width,networkCanvas.height);
  const glowColor = document.body.classList.contains("light")?"#fdd835":"#3aa0ff";

  /* Draw links */
  linksData.forEach(([a,b])=>{
    const n1=nodesMap[a], n2=nodesMap[b];
    nctx.beginPath();
    nctx.moveTo(n1.x+40,n1.y+15);
    nctx.lineTo(n2.x+40,n2.y+15);
    nctx.strokeStyle=glowColor;
    nctx.lineWidth=4;
    nctx.shadowColor=glowColor;
    nctx.shadowBlur=8;
    nctx.stroke();
  });

  /* Draw packets */
  packets.forEach(p=>{
    const [a,b]=p.link;
    const n1=nodesMap[a], n2=nodesMap[b];
    const px = n1.x + 40 + (n2.x - n1.x)*p.progress;
    const py = n1.y + 15 + (n2.y - n1.y)*p.progress;
    nctx.beginPath();
    nctx.arc(px, py, 6, 0, Math.PI*2);
    nctx.fillStyle=glowColor;
    nctx.shadowColor=glowColor;
    nctx.shadowBlur=6;
    nctx.fill();
    p.progress += 0.01;
    if(p.progress>1) p.progress=0;
  });

  requestAnimationFrame(drawNetwork);
}
drawNetwork();

/* Responsive canvas */
window.addEventListener("resize",()=>{
  networkCanvas.width = wrapper.offsetWidth;
  networkCanvas.height = wrapper.offsetHeight;
});

loadSettings();