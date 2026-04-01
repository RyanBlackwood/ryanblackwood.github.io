document.addEventListener("DOMContentLoaded", () => {

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");
const underline = document.getElementById("tabUnderline");
const toggleBtn = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");
const body = document.body;

/* MOVE UNDERLINE */
function moveUnderline(el) {
  underline.style.width = el.offsetWidth + "px";
  underline.style.left = el.offsetLeft + "px";
}

/* CLICK NAV WITH HEADER OFFSET */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const section = document.getElementById(tab.dataset.target);
    const headerOffset = document.querySelector(".header").offsetHeight + 10;
    const elementPosition = section.offsetTop;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    moveUnderline(tab);
  });
});

/* SCROLL ACTIVE TAB */
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - document.querySelector(".header").offsetHeight - 15;
    if(scrollY >= sectionTop) current = section.id;
  });

  tabs.forEach(tab => {
    tab.classList.remove("active");
    if(tab.dataset.target === current){
      tab.classList.add("active");
      moveUnderline(tab);
    }
  });
});

moveUnderline(tabs[0]);
tabs[0].classList.add("active");

/* THEME TOGGLE */
let isDark = true;
toggleBtn.addEventListener("click", () => {
  icon.classList.add("icon-animate");
  setTimeout(() => {
    if(isDark){ body.classList.replace("dark","light"); icon.textContent="☀️"; }
    else{ body.classList.replace("light","dark"); icon.textContent="🌙"; }
    isDark = !isDark;
    icon.classList.remove("icon-animate");
  },200);
});

/* TYPING TEXT */
const text="Engineer | Mechanic | Tinkerer";
let i=0;
function type(){ if(i<text.length){ document.getElementById("subtitle").textContent+=text.charAt(i); i++; setTimeout(type,40); }}
type();

/* SCROLL REVEAL */
const reveals = document.querySelectorAll(".reveal");
function reveal(){ reveals.forEach(el=>{ if(el.getBoundingClientRect().top<window.innerHeight-100){ el.classList.add("active"); } }); }
window.addEventListener("scroll",reveal);
reveal();

/* PARTICLES */
const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");
function resizeCanvas(){ canvas.width=innerWidth; canvas.height=innerHeight; }
resizeCanvas();
window.addEventListener("resize",resizeCanvas);
let particles=[];
class Particle{ constructor(){ this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*2; this.dx=(Math.random()-0.5)*0.3; this.dy=(Math.random()-0.5)*0.3; } update(){ this.x+=this.dx; this.y+=this.dy; } draw(){ ctx.fillStyle=getComputedStyle(body).getPropertyValue('--glow'); ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); } }
function initParticles(){ for(let i=0;i<120;i++){ particles.push(new Particle()); } }
function animate(){ ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{ p.update(); p.draw(); }); requestAnimationFrame(animate); }
initParticles(); animate();

/* HOMELAB */
const network=document.getElementById("networkDiagram");
const nodes=[
  {id:"Modem",x:50,y:200,type:"router",tooltip:"Internet Modem"},
  {id:"Proxmox Laptop",x:200,y:200,type:"server",tooltip:"Proxmox VE\nIP:10.0.0.2\nBridges: enp3so→WAN, vmbr1→OPNsense"},
  {id:"OPNsense",x:350,y:200,type:"firewall",tooltip:"LAN:10.0.0.1/24\nWireguard:10.100.0.0/24"},
  {id:"TL-SG608E",x:500,y:200,type:"switch",tooltip:"IP:10.0.0.4\nPorts:1→OPNsense,2→Eero VLAN,3→Family VLAN"},
  {id:"Eero VLAN",x:650,y:120,type:"switch",tooltip:"VLAN:192.168.0.0/24\nDHCP:192.168.0.0/24"},
  {id:"Wireless AP",x:650,y:250,type:"switch",tooltip:"VPN endpoint 10.100.0.2 → Hetzner 5.161.90.194"},
  {id:"Family Switch",x:650,y:320,type:"switch",tooltip:"VLAN:172.168.10.0/24\nDevices: PCs, TV, 3D printer"},
  {id:"Laptop (WiFi)",x:750,y:120,type:"client",tooltip:"WiFi Device"},
  {id:"TV",x:750,y:160,type:"client",tooltip:"WiFi Device"},
  {id:"3D Printer",x:750,y:200,type:"client",tooltip:"WiFi Device"}
];
const links=[[0,1],[1,2],[2,3],[3,4],[4,7],[4,8],[4,9],[3,5],[3,6]];

const tooltip=document.createElement("div"); tooltip.classList.add("node-tooltip"); network.appendChild(tooltip);
nodes.forEach(n=>{
  const el=document.createElement("div");
  el.classList.add("node",n.type);
  el.textContent=n.id;
  el.style.left=n.x+"px";
  el.style.top=n.y+"px";
  n.el=el;
  network.appendChild(el);

  el.addEventListener("mousemove",e=>{
    tooltip.style.left=e.offsetX+el.offsetLeft+70+"px";
    tooltip.style.top=e.offsetY+el.offsetTop+"px";
    tooltip.textContent=n.tooltip;
    tooltip.style.opacity=1;
  });
  el.addEventListener("mouseleave",()=>{ tooltip.style.opacity=0; });
});

/* LINKS + TRAFFIC PULSES */
links.forEach(([i,j])=>{
  const a=nodes[i],b=nodes[j];
  const linkEl=document.createElement("div");
  linkEl.classList.add("link");
  network.appendChild(linkEl);

  const update=()=>{
    const dx=b.el.offsetLeft-a.el.offsetLeft;
    const dy=b.el.offsetTop-a.el.offsetTop;
    const length=Math.sqrt(dx*dx+dy*dy);
    const angle=Math.atan2(dy,dx)*180/Math.PI;
    linkEl.style.width=length+"px";
    linkEl.style.transform=`translate(${a.el.offsetLeft+30}px,${a.el.offsetTop+30}px) rotate(${angle}deg)`;
  };
  update();
  a.updateLinks=a.updateLinks||[]; a.updateLinks.push(update);
  b.updateLinks=b.updateLinks||[]; b.updateLinks.push(update);

  // traffic pulse
  const pulse=document.createElement("div"); pulse.classList.add("pulse"); linkEl.appendChild(pulse);
  let offset=0;
  function animatePulse(){
    offset+=2;
    if(offset>linkEl.offsetWidth+20) offset=-20;
    pulse.style.transform=`translateX(${offset}px)`;
    requestAnimationFrame(animatePulse);
  }
  animatePulse();
});

/* DRAG NODES */
nodes.forEach(n=>{
  let offsetX,offsetY;
  n.el.onmousedown=e=>{
    e.preventDefault();
    offsetX=e.clientX-n.el.offsetLeft; offsetY=e.clientY-n.el.offsetTop;
    const move=e=>{ n.el.style.left=(e.clientX-offsetX)+"px"; n.el.style.top=(e.clientY-offsetY)+"px"; (n.updateLinks||[]).forEach(f=>f()); };
    const up=()=>{ window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
  };
});