// THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  themeIcon.classList.add('icon-animate');
  setTimeout(()=>themeIcon.classList.remove('icon-animate'),500);
  themeIcon.textContent = document.body.classList.contains('dark') ? '🌙':'☀️';
});

// TYPING SUBTITLE
const subtitle = document.getElementById('subtitle');
const text = subtitle.textContent;
subtitle.textContent='';
let idx=0;
function type(){ if(idx<text.length){ subtitle.textContent+=text[idx]; idx++; setTimeout(type,50); } }
type();

// SCROLL REVEAL
const revealElements = document.querySelectorAll('.reveal');
function reveal(){ revealElements.forEach(el=>{ const top=el.getBoundingClientRect().top; if(top<window.innerHeight-100) el.classList.add('active');}); }
window.addEventListener('scroll',reveal);
reveal();

// TABS SCROLL
const tabs = document.querySelectorAll('.tab');
const tabUnderline = document.getElementById('tabUnderline');
tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    const target=document.getElementById(tab.dataset.target);
    const offset=document.querySelector('.header').offsetHeight;
    window.scrollTo({top:target.offsetTop - offset, behavior:'smooth'});
  });
});

// TAB UNDERLINE ACTIVE ON SCROLL
window.addEventListener('scroll',()=>{
  tabs.forEach(tab=>{
    const sec=document.getElementById(tab.dataset.target);
    const top=window.scrollY;
    const offset=document.querySelector('.header').offsetHeight;
    if(top >= sec.offsetTop - offset && top < sec.offsetTop - offset + sec.offsetHeight){
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      tabUnderline.style.width = tab.offsetWidth+'px';
      tabUnderline.style.left = tab.offsetLeft+'px';
    }
  });
});

// PARTICLES BACKGROUND
const canvas=document.getElementById('particles');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth; canvas.height=window.innerHeight;
window.addEventListener('resize',()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight;});
const particles=[];
for(let i=0;i<120;i++){particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*2+1, dx:(Math.random()-0.5)*0.3, dy:(Math.random()-0.5)*0.3});}

// HOMELAB NETWORK
const network=document.getElementById('networkDiagram');
const nodes=[
{ id:"Modem", x:50, y:150, type:"router", tooltip:"Internet Modem"},
{ id:"Proxmox Laptop", x:200, y:150, type:"server", tooltip:"Proxmox VE\nIP:10.0.0.2\nBridges: enp3so→WAN, vmbr1→OPNsense"},
{ id:"OPNsense", x:350, y:150, type:"firewall", tooltip:"LAN:10.0.0.1/24\nWireguard:10.100.0.0/24"},
{ id:"TL-SG608E", x:500, y:150, type:"switch", tooltip:"IP:10.0.0.4\nPorts:1→OPNsense,2→Eero VLAN,3→Family VLAN"},
{ id:"Eero VLAN", x:650, y:80, type:"switch", tooltip:"VLAN:192.168.0.0/24\nDHCP:192.168.0.0/24"},
{ id:"Wireless AP", x:650, y:220, type:"switch", tooltip:"VPN endpoint 10.100.0.2 → Hetzner 5.161.90.194"},
{ id:"Family Switch", x:650, y:300, type:"switch", tooltip:"VLAN:172.168.10.0/24\nDevices: PCs, TV, 3D printer"},
{ id:"Laptop (WiFi)", x:780, y:80, type:"client", tooltip:"WiFi Device"},
{ id:"TV", x:780, y:140, type:"client", tooltip:"WiFi Device"},
{ id:"3D Printer", x:780, y:200, type:"client", tooltip:"WiFi Device"}
];

// CREATE NODE ELEMENTS
nodes.forEach(n=>{
  const el=document.createElement('div'); el.classList.add('node', n.type);
  el.style.left=n.x+'px'; el.style.top=n.y+'px'; el.textContent=n.id;

  const info=document.createElement('div'); info.className='node-info';
  info.innerHTML=`<strong>${n.id}</strong><br>${n.tooltip.replace(/\n/g,'<br>')}`;
  el.appendChild(info);

  el.addEventListener('mouseenter',()=>{info.classList.add('active'); el.style.zIndex=100;});
  el.addEventListener('mouseleave',()=>{info.classList.remove('active'); el.style.zIndex='';});

  network.appendChild(el);
});

// FLY-IN HOMELAB NODES
const homelabSection = document.getElementById('homelab');
const homelabNodes = document.querySelectorAll('#networkDiagram .node');
function revealHomelabNodes() {
  const rect = homelabSection.getBoundingClientRect();
  if(rect.top < window.innerHeight - 100) {
    homelabNodes.forEach((node, i) => { setTimeout(()=>node.classList.add('visible'), i*100); });
    // Animate links after nodes appear
    setTimeout(()=>{ links.forEach((l,i)=>{ setTimeout(()=>l.el.classList.add('visible'), i*150); }); }, homelabNodes.length*100);
    window.removeEventListener('scroll', revealHomelabNodes);
  }
}
window.addEventListener('scroll', revealHomelabNodes);
revealHomelabNodes();

// CREATE LINKS
const linksData=[["Modem","Proxmox Laptop"],["Proxmox Laptop","OPNsense"],["OPNsense","TL-SG608E"],["TL-SG608E","Eero VLAN"],["TL-SG608E","Wireless AP"],["TL-SG608E","Family Switch"],["Eero VLAN","Laptop (WiFi)"],["Family Switch","TV"],["Family Switch","3D Printer"]];
const links=[];
linksData.forEach(pair=>{
  const fromNode=[...network.children].find(n=>n.textContent.includes(pair[0]));
  const toNode=[...network.children].find(n=>n.textContent.includes(pair[1]));
  if(fromNode && toNode){
    const link=document.createElement('div'); link.className='link';
    const pulse=document.createElement('div'); pulse.className='pulse';
    link.appendChild(pulse); network.appendChild(link);
    links.push({from:fromNode,to:toNode,el:link,pulse:pulse});
  }
});

// DRAGGABLE NODES
let draggingNode=null, offsetX=0, offsetY=0;
network.addEventListener('mousedown',e=>{ const target=e.target.closest('.node'); if(target){ draggingNode=target; const rect=target.getBoundingClientRect(); const netRect=network.getBoundingClientRect(); offsetX=e.clientX - rect.left + netRect.left; offsetY=e.clientY - rect.top + netRect.top; target.style.cursor='grabbing';}});
window.addEventListener('mousemove', e=>{ if(draggingNode){ const netRect=network.getBoundingClientRect(); draggingNode.style.left=e.clientX-offsetX+'px'; draggingNode.style.top=e.clientY-offsetY+'px'; updateLinksSmooth(); }});
window.addEventListener('mouseup',()=>{ if(draggingNode) draggingNode.style.cursor='grab'; draggingNode=null;});

// UPDATE LINKS SMOOTHLY
function updateLinksSmooth(){
  links.forEach(l=>{
    const rect1=l.from.getBoundingClientRect(); const rect2=l.to.getBoundingClientRect();
    const x1=rect1.left+rect1.width/2; const y1=rect1.top+rect1.height/2;
    const x2=rect2.left+rect2.width/2; const y2=rect2.top+rect2.height/2;
    const dx=x2-x1; const dy=y2-y1; const angle=Math.atan2(dy,dx)*180/Math.PI; const length=Math.sqrt(dx*dx+dy*dy);
    l.el.style.width=length+'px'; l.el.style.left=x1+'px'; l.el.style.top=y1+'px'; l.el.style.transform=`rotate(${angle}deg)`;
    const t=Date.now()/500; l.pulse.style.left=((Math.sin(t*2+length/50)+1)/2*length)+'px';
  });
}

// PARTICLES ANIMATION
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.dx; p.y+=p.dy;
    if(p.x<0||p.x>canvas.width)p.dx*=-1;
    if(p.y<0||p.y>canvas.height)p.dy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fill();
  });
  updateLinksSmooth();
  requestAnimationFrame(animateParticles);
}
animateParticles();