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

/* PARTICLES */
const pCanvas=document.getElementById("particles");
const pCtx=pCanvas.getContext("2d");
pCanvas.width=innerWidth;
pCanvas.height=innerHeight;

let dots=Array.from({length:80},()=>({
  x:Math.random()*pCanvas.width,
  y:Math.random()*pCanvas.height,
  r:Math.random()*2
}));

(function drawParticles(){
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  const glow=getComputedStyle(document.body).getPropertyValue('--glow');

  dots.forEach(d=>{
    pCtx.beginPath();
    pCtx.arc(d.x,d.y,d.r,0,Math.PI*2);
    pCtx.fillStyle=glow+"55";
    pCtx.fill();
    d.y+=0.2;
    if(d.y>pCanvas.height)d.y=0;
  });

  requestAnimationFrame(drawParticles);
})();

/* NETWORK */
const canvas=document.getElementById("networkCanvas");
const ctx=canvas.getContext("2d");
canvas.width=800;
canvas.height=400;

let nodes=[
{id:"Internet",x:100,y:200},
{id:"Proxmox",x:400,y:200},
{id:"OPNsense",x:600,y:100},
{id:"Switch",x:800,y:200}
];

let links=[
{a:"Internet",b:"Proxmox",active:true,load:0.6},
{a:"Proxmox",b:"OPNsense",active:true,load:0.7},
{a:"OPNsense",b:"Switch",active:true,load:0.8}
];

let nodesMap={};
const nodesDiv=document.getElementById("networkNodes");

nodes.forEach(n=>{
  const el=document.createElement("div");
  el.className="node";
  el.innerText=n.id;
  el.style.left=n.x+"px";
  el.style.top=n.y+"px";
  nodesDiv.appendChild(el);
  n.el=el;
  nodesMap[n.id]=n;
});

/* INTERACTION */
let activeNode=null;
let isPanning=false;
let offsetX=0,offsetY=0,scale=1;

nodes.forEach(n=>{
  n.el.onmousedown=e=>{
    activeNode=n;
  };
});

window.onmousemove=e=>{
  if(activeNode){
    activeNode.x=e.clientX;
    activeNode.y=e.clientY;
    activeNode.el.style.left=activeNode.x+"px";
    activeNode.el.style.top=activeNode.y+"px";
  }
};

window.onmouseup=()=>activeNode=null;

/* PACKETS */
let packets=[];
const MAX=120;

function spawn(){
  links.forEach(l=>{
    if(Math.random()<l.load && packets.length<MAX){
      packets.push({
        link:l,
        progress:Math.random(),
        speed:0.01
      });
    }
  });
}
setInterval(spawn,200);

/* DRAW */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const glow=getComputedStyle(document.body).getPropertyValue('--glow');

  links.forEach(l=>{
    const a=nodesMap[l.a], b=nodesMap[l.b];
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=glow;
    ctx.stroke();
  });

  packets.forEach(p=>{
    const a=nodesMap[p.link.a];
    const b=nodesMap[p.link.b];

    const x=a.x+(b.x-a.x)*p.progress;
    const y=a.y+(b.y-a.y)*p.progress;

    ctx.beginPath();
    ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle=glow;
    ctx.fill();

    p.progress+=p.speed;
    if(p.progress>1)p.progress=0;
  });

  requestAnimationFrame(draw);
}
draw();