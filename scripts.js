/* ---------- THEME ---------- */
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick=()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light"));
};
if(localStorage.getItem("theme")==="true") document.body.classList.add("light");

/* ---------- SUBTITLE ---------- */
const sub="Engineer | Mechanic | Tinkerer";
let i=0;
(function type(){
  if(i<=sub.length){
    document.getElementById("subtitle").textContent=sub.slice(0,i++);
    setTimeout(type,50);
  }
})();

/* ---------- NETWORK ---------- */
const canvas=document.getElementById("networkCanvas");
const ctx=canvas.getContext("2d");
const wrapper=document.getElementById("networkWrapper");
canvas.width=wrapper.offsetWidth;
canvas.height=wrapper.offsetHeight;

let nodes=[
{id:"Internet",x:100,y:200,ip:"Public",status:"online"},
{id:"Modem",x:250,y:120,ip:"ISP",status:"online"},
{id:"Proxmox",x:450,y:260,ip:"10.0.0.2",status:"online"},
{id:"OPNsense",x:650,y:120,ip:"10.0.0.1",status:"online"},
{id:"Switch",x:850,y:250,ip:"10.0.0.4",status:"online"},
{id:"LAN",x:1050,y:250,ip:"10.0.0.x",status:"online"}
];

let links=[
{a:"Internet",b:"Modem",active:true,load:0.6,latency:20},
{a:"Modem",b:"Proxmox",active:true,load:0.5,latency:10},
{a:"Proxmox",b:"OPNsense",active:true,load:0.7,latency:5},
{a:"OPNsense",b:"Switch",active:true,load:0.8,latency:2},
{a:"Switch",b:"LAN",active:true,load:0.4,latency:3}
];

let nodesMap={};
const container=document.getElementById("networkNodes");

nodes.forEach(n=>{
  const el=document.createElement("div");
  el.className="node";
  el.textContent=n.id;
  el.style.left=n.x+"px";
  el.style.top=n.y+"px";
  container.appendChild(el);
  n.el=el;
  nodesMap[n.id]=n;

  let drag=false,ox,oy;
  el.onmousedown=e=>{drag=true;ox=e.clientX-n.x;oy=e.clientY-n.y;};
  window.onmousemove=e=>{
    if(!drag) return;
    n.x=e.clientX-ox;
    n.y=e.clientY-oy;
    el.style.left=n.x+"px";
    el.style.top=n.y+"px";
  };
  window.onmouseup=()=>drag=false;

  el.onclick=()=>log(`${n.id} | ${n.ip} | ${n.status}`);
});

/* ---------- PACKETS ---------- */
let packets=[];

function spawnPackets(){
  links.filter(l=>l.active).forEach(l=>{
    if(Math.random()>0.7){
      packets.push({
        link:l,
        progress:Math.random(),
        dir:Math.random()>0.5?1:-1,
        speed:0.002+Math.random()*0.01
      });
    }
  });
}
setInterval(spawnPackets,200);

/* ---------- DRAW ---------- */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const glow=getComputedStyle(document.body).getPropertyValue('--glow');

  links.filter(l=>l.active).forEach(l=>{
    const a=nodesMap[l.a];
    const b=nodesMap[l.b];

    ctx.beginPath();
    ctx.moveTo(a.x+30,a.y+10);
    ctx.lineTo(b.x+30,b.y+10);
    ctx.strokeStyle=glow;
    ctx.lineWidth=2+l.load*3;
    ctx.shadowBlur=10;
    ctx.shadowColor=glow;
    ctx.stroke();
  });

  packets.forEach(p=>{
    const a=nodesMap[p.link.a];
    const b=nodesMap[p.link.b];
    const t=p.dir===1?p.progress:1-p.progress;

    const x=a.x+(b.x-a.x)*t;
    const y=a.y+(b.y-a.y)*t;

    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=glow;
    ctx.fill();

    p.progress+=p.speed;
    if(p.progress>1) p.progress=0;
  });

  requestAnimationFrame(draw);
}
draw();

/* ---------- TERMINAL ---------- */
const out=document.getElementById("terminalOutput");
const input=document.getElementById("terminalInput");

function log(t){out.innerHTML+=t+"<br>";out.scrollTop=out.scrollHeight;}

function disconnect(n){
  links.forEach(l=>{if(l.a===n||l.b===n)l.active=false;});
}

function connect(a,b){
  links.push({a,b,active:true,load:0.5,latency:5});
}

function create(name){
  const n={id:name,x:300,y:200,ip:"dynamic",status:"online"};
  nodes.push(n);
  nodesMap[name]=n;
  log("created "+name);
}

input.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    const cmd=input.value.toLowerCase();

    if(cmd==="clear") out.innerHTML="";
    else if(cmd.startsWith("disconnect ")) disconnect(cmd.split(" ")[1]);
    else if(cmd.startsWith("connect ")) {
      const [_,a,b]=cmd.split(" ");
      connect(a,b);
    }
    else if(cmd.startsWith("create ")) create(cmd.split(" ")[1]);
    else log("unknown");

    input.value="";
  }
});