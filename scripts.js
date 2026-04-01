/* THEME */
const body=document.body;
const icon=document.getElementById('themeIcon');

if(localStorage.theme==="light"){body.classList.add("light");icon.textContent="☀️";}

document.getElementById('themeToggle').onclick=()=>{
  body.classList.toggle("light");
  const light=body.classList.contains("light");
  icon.textContent=light?"☀️":"🌙";
  localStorage.theme=light?"light":"dark";
};

/* SCROLL */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.onclick=()=>{
    const el=document.getElementById(tab.dataset.target);
    window.scrollTo({top:el.offsetTop-80,behavior:'smooth'});
  };
});

/* NETWORK */
const net=document.getElementById('networkDiagram');

const nodesData=[
{id:"Internet",x:40,y:260},
{id:"Modem",x:140,y:260},
{id:"Proxmox",x:300,y:260},
{id:"OPNsense",x:460,y:260},
{id:"Switch",x:620,y:260},
{id:"Eero",x:800,y:120},
{id:"LAN",x:800,y:260},
{id:"VPN AP",x:800,y:400},
{id:"Hetzner",x:1000,y:400},
{id:"Minecraft",x:300,y:120},
{id:"Rust",x:220,y:120},
{id:"Valheim",x:380,y:120},
{id:"PC",x:1000,y:220}
];

const nodes={};
nodesData.forEach(n=>{
  const el=document.createElement('div');
  el.className='node';
  el.style.left=n.x+'px';
  el.style.top=n.y+'px';
  el.textContent=n.id;
  net.appendChild(el);
  nodes[n.id]=el;
});

const linksData=[
["Internet","Modem"],["Modem","Proxmox"],["Proxmox","OPNsense"],
["OPNsense","Switch"],["Switch","Eero"],["Switch","LAN"],
["Switch","VPN AP"],["VPN AP","Hetzner"],
["Switch","PC"],["Proxmox","Minecraft"],["Proxmox","Rust"],["Proxmox","Valheim"]
];

const links=linksData.map(([a,b])=>{
  const el=document.createElement('div');
  el.className='link'; net.appendChild(el);
  return {a:nodes[a],b:nodes[b],el};
});

function updateLinks(){
  links.forEach(l=>{
    const r1=l.a.getBoundingClientRect();
    const r2=l.b.getBoundingClientRect();
    const p=net.getBoundingClientRect();

    const x1=r1.left+r1.width/2-p.left;
    const y1=r1.top+r1.height/2-p.top;
    const x2=r2.left+r2.width/2-p.left;
    const y2=r2.top+r2.height/2-p.top;

    const dx=x2-x1,dy=y2-y1;
    const len=Math.sqrt(dx*dx+dy*dy);
    const ang=Math.atan2(dy,dx)*180/Math.PI;

    l.el.style.width=len+'px';
    l.el.style.left=x1+'px';
    l.el.style.top=y1+'px';
    l.el.style.transform=`rotate(${ang}deg)`;
  });
}
setInterval(updateLinks,16);

/* PACKETS */
const packets=[];
links.forEach(l=>{
  const p=document.createElement('div');
  p.className='packet';
  net.appendChild(p);
  packets.push({l,prog:Math.random(),el:p});
});

function animatePackets(){
  packets.forEach(p=>{
    p.prog+=0.01;
    if(p.prog>1)p.prog=0;

    const r1=p.l.a.getBoundingClientRect();
    const r2=p.l.b.getBoundingClientRect();
    const par=net.getBoundingClientRect();

    const x1=r1.left+r1.width/2-par.left;
    const y1=r1.top+r1.height/2-par.top;
    const x2=r2.left+r2.width/2-par.left;
    const y2=r2.top+r2.height/2-par.top;

    p.el.style.left=(x1+(x2-x1)*p.prog)+'px';
    p.el.style.top=(y1+(y2-y1)*p.prog)+'px';
  });
  requestAnimationFrame(animatePackets);
}
animatePackets();

/* TERMINAL */
const out=document.getElementById('terminalOutput');
const input=document.getElementById('terminalInput');

function log(m){const d=document.createElement('div');d.textContent=m;out.appendChild(d);out.scrollTop=9999;}

input.onkeydown=e=>{
 if(e.key==='Enter'){log("> "+input.value);cmd(input.value);input.value='';}
};

function cmd(c){
 if(c==="help")log("help, nodes, download resume");
 else if(c==="nodes")Object.keys(nodes).forEach(n=>log(n));
 else if(c==="download resume"){
   const a=document.createElement('a');
   a.href="resume.pdf";
   a.download="Ryan_Blackwood_Resume.pdf";
   a.click();
   log("Downloading...");
 }
}