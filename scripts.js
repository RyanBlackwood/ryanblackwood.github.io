/* THEME TOGGLE */
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  updateParticleColor();
};

/* TERMINAL TOGGLE */
const terminalToggle = document.getElementById("terminalToggle");
const terminal = document.getElementById("terminal");
terminalToggle.onclick = () => {
  terminal.style.display = terminal.style.display === "none" ? "flex" : "none";
};

/* SUBTITLE TYPING */
const subtitle = "Engineer | Mechanic | Tinkerer";
let subIndex = 0;
function typeSubtitle() {
  if(subIndex <= subtitle.length){
    document.getElementById("subtitle").textContent = subtitle.slice(0, subIndex);
    subIndex++;
    setTimeout(typeSubtitle, 80);
  }
}
typeSubtitle();

/* TABS SCROLL */
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

/* PARTICLES */
const canvas = document.getElementById("particles");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let particleColor = "#3aa0ff";
function updateParticleColor(){particleColor = document.body.classList.contains("light") ? "#fdd835" : "#3aa0ff";}
const particles=[];
for(let i=0;i<120;i++) particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2+1,dx:(Math.random()-0.5)*0.5,dy:(Math.random()-0.5)*0.5});
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = particleColor+"88";
    ctx.fill();
    p.x+=p.dx; p.y+=p.dy;
    if(p.x>canvas.width)p.x=0;
    if(p.x<0)p.x=canvas.width;
    if(p.y>canvas.height)p.y=0;
    if(p.y<0)p.y=canvas.height;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener("resize",()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight});

/* HOMELAB NODES */
const net=document.getElementById("networkDiagram");
let nodes=[{id:"Internet",x:50,y:250},{id:"Modem",x:200,y:250},{id:"Proxmox",x:350,y:250},{id:"OPNsense",x:500,y:250},{id:"Switch",x:650,y:250},{id:"PC",x:900,y:200},{id:"Minecraft",x:350,y:150},{id:"Rust",x:320,y:150},{id:"Valheim",x:380,y:150}];
let nodesMap={};
nodes.forEach(n=>{
  const el=document.createElement("div");el.className="node";el.style.left=n.x+"px";el.style.top=n.y+"px";el.textContent=n.id;net.appendChild(el);n.el=el;nodesMap[n.id]=n;
  let isDragging=false,offsetX=0,offsetY=0;
  el.onmousedown=e=>{isDragging=true;offsetX=e.clientX-el.getBoundingClientRect().left;offsetY=e.clientY-el.getBoundingClientRect().top;};
  el.addEventListener("touchstart",e=>{isDragging=true;offsetX=e.touches[0].clientX-el.getBoundingClientRect().left;offsetY=e.touches[0].clientY-el.getBoundingClientRect().top;});
  const moveNode=e=>{if(!isDragging)return;const clientX=e.clientX||e.touches[0].clientX,clientY=e.clientY||e.touches[0].clientY;n.x=clientX-offsetX;n.y=clientY-offsetY;n.el.style.left=n.x+"px";n.el.style.top=n.y+"px";};
  const endDrag=()=>{isDragging=false;};
  window.addEventListener("mousemove",moveNode);window.addEventListener("mouseup",endDrag);
  window.addEventListener("touchmove",moveNode);window.addEventListener("touchend",endDrag);
});

/* LINKS */
let linksData=[["Internet","Modem"],["Modem","Proxmox"],["Proxmox","OPNsense"],["OPNsense","Switch"],["Switch","PC"],["Proxmox","Minecraft"],["Proxmox","Rust"],["Proxmox","Valheim"]];
let links=linksData.map(([a,b])=>{const el=document.createElement("div");el.className="link";net.appendChild(el);return {a:nodesMap[a],b:nodesMap[b],el};});

/* UPDATE LINKS */
function updateLinks(){
  links.forEach(l=>{
    const x1=l.a.x+40,y1=l.a.y+25,x2=l.b.x+40,y2=l.b.y+25,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),ang=Math.atan2(dy,dx)*180/Math.PI;
    l.el.style.width=len+"px";
    l.el.style.left=x1+"px";l.el.style.top=y1+"px";
    l.el.style.transform=`rotate(${ang}deg)`;
  });
  requestAnimationFrame(updateLinks);
}
updateLinks();

/* TERMINAL */
const out=document.getElementById("terminalOutput");
const input=document.getElementById("terminalInput");
function log(m){const d=document.createElement("div");d.textContent=m;out.appendChild(d);out.scrollTop=out.scrollHeight;}
input.addEventListener("keydown",e=>{if(e.key==="Enter"){runCommand(input.value);input.value="";}});
function runCommand(cmd){
  cmd=cmd.trim().toLowerCase();
  if(cmd==="help") log("help, nodes, download resume, clear");
  else if(cmd==="nodes") nodes.forEach(n=>log(`${n.id} - active packets: TBD`));
  else if(cmd==="download resume"){const a=document.createElement("a");a.href="resume.pdf";a.download="Ryan_Blackwood_Resume.pdf";a.click();log("Downloading...");}
  else if(cmd==="clear") out.innerHTML="";
  else log("Unknown command");
}