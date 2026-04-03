window.addEventListener("mousemove", (e) => {
  window.lastMouseX = e.clientX;
  window.lastMouseY = e.clientY;
});
/* =========================
   THEME
========================= */
const ThemeManager = (() => {
  const toggle = document.getElementById("themeToggle");

  if(localStorage.getItem("theme")==="true"){
    document.body.classList.add("light");
  }

  toggle.onclick = () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light"));

    // 🔥 force visual systems to refresh
    window.dispatchEvent(new Event("themeChanged"));
  };
})();
/* =========================
   GLOBAL HELPERS
========================= */
const glow = () => getComputedStyle(document.body).getPropertyValue('--glow').trim();
const textColor = () => getComputedStyle(document.body).getPropertyValue('--text').trim();

/* =========================
   CURSOR GLOW TRACKING
========================= */
document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty("--mouse-x", e.clientX + "px");
  document.body.style.setProperty("--mouse-y", e.clientY + "px");
});

/* =========================
   TYPEWRITER
========================= */
(() => {
  const el = document.getElementById("subtitle");
  const text = "Engineer | Mechanic | Tinkerer";
  let i = 0;

  function type(){
    if(i <= text.length){
      el.textContent = text.slice(0, i++);
      setTimeout(type, 40);
    }
  }
  type();
})();

/* =========================
   PARTICLES SYSTEM
========================= */
const ParticlesSystem = (() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({length:60},()=>({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2
  }));

  function draw(){
    if(document.hidden) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    const g = glow();

    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = g + "55";
      ctx.fill();

      p.y += 0.2;
      if(p.y > canvas.height) p.y = 0;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* =========================
   SECTION ANIMATIONS
========================= */
(() => {
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("visible");
      }
    });
  });

  document.querySelectorAll(".glass-card").forEach(el=>{
    observer.observe(el);
  });
})();

/* =========================
   NAVIGATION
========================= */
(() => {
  const tabs = document.querySelectorAll(".tab");
  const header = document.querySelector("header");

  tabs.forEach(tab=>{
    tab.onclick = ()=>{
      const section = document.getElementById(tab.dataset.target);
      window.scrollTo({
        top: section.offsetTop - header.offsetHeight - 10,
        behavior: "smooth"
      });
    };
  });

  window.addEventListener("scroll", ()=>{
    tabs.forEach(tab=>{
      const section = document.getElementById(tab.dataset.target);
      const rect = section.getBoundingClientRect();

      if(rect.top <= 120 && rect.bottom > 120){
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  });
})();

/* =========================
   NETWORK SYSTEM
========================= */
const NetworkSystem = (() => {
  const canvas = document.getElementById("networkCanvas");
  const ctx = canvas.getContext("2d");
  const wrapper = document.getElementById("networkWrapper");

  function resize(){
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let camera = {x:0,y:0,scale:1};

  function worldToScreen(x,y){
    return {
      x:(x-camera.x)*camera.scale,
      y:(y-camera.y)*camera.scale
    };
  }

  function screenToWorld(x,y){
    return {
      x:x/camera.scale+camera.x,
      y:y/camera.scale+camera.y
    };
  }

  let nodes = [
    {id:"Internet",x:100,y:200},
    {id:"Proxmox",x:400,y:200},
    {id:"OPNsense",x:650,y:120},
    {id:"Switch",x:850,y:250}
  ];

  let links = [
    {a:"Internet",b:"Proxmox",load:0.6},
    {a:"Proxmox",b:"OPNsense",load:0.7},
    {a:"OPNsense",b:"Switch",load:0.8}
  ];

  let packets = [];

  function spawnPackets(){
    links.forEach(l=>{
      if(Math.random()<l.load && packets.length<100){
        packets.push({link:l,t:Math.random(),speed:0.005});
      }
    });
  }
  setInterval(spawnPackets,200);

  function draw(){
  if(document.hidden) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const g = glow();
  const tColor = textColor();

  // 🔥 mouse world position
  const rect = canvas.getBoundingClientRect();
  const mouse = screenToWorld(
    (window.lastMouseX || 0) - rect.left,
    (window.lastMouseY || 0) - rect.top
  );

  /* =========================
     LINKS (with glow + pulse trails)
  ========================= */
  links.forEach(l=>{
    const a = nodes.find(n=>n.id===l.a);
    const b = nodes.find(n=>n.id===l.b);
    if(!a||!b) return;

    const p1 = worldToScreen(a.x,a.y);
    const p2 = worldToScreen(b.x,b.y);

    // base line
    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2 + l.load*3;

    ctx.shadowColor = g;
    ctx.shadowBlur = 10;

    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  /* =========================
     PACKETS (flowing energy)
  ========================= */
  packets.forEach(p=>{
    const a = nodes.find(n=>n.id===p.link.a);
    const b = nodes.find(n=>n.id===p.link.b);

    const x=a.x+(b.x-a.x)*p.t;
    const y=a.y+(b.y-a.y)*p.t;

    const pos = worldToScreen(x,y);

    // glow core
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,4,0,Math.PI*2);
    ctx.fillStyle = g;
    ctx.shadowColor = g;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // trail
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,8,0,Math.PI*2);
    ctx.fillStyle = g + "22";
    ctx.fill();

    p.t+=p.speed;
    if(p.t>1) p.t=0;
    draw();
  });

  /* =========================
     NODES (interactive glow)
  ========================= */
  nodes.forEach(n=>{
    const p = worldToScreen(n.x,n.y);

    const dist = Math.hypot(n.x-mouse.x, n.y-mouse.y);
    const hover = dist < 60;

    // outer glow (proximity)
    if(hover){
      ctx.beginPath();
      ctx.arc(p.x,p.y,20,0,Math.PI*2);
      ctx.fillStyle = g + "22";
      ctx.fill();
    }

    // core
    ctx.beginPath();
    ctx.arc(p.x,p.y,12,0,Math.PI*2);
    ctx.fillStyle = "#111";
    ctx.fill();

    ctx.strokeStyle = g;
    ctx.lineWidth = hover ? 3 : 2;
    ctx.stroke();

    // label (FIXED for light mode)
    ctx.fillStyle = tColor;
    ctx.font = "12px monospace";

    ctx.shadowColor = g;
    ctx.shadowBlur = hover ? 10 : 5;

    ctx.fillText(n.id, p.x+14, p.y+4);

    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(draw);
}

  /* INTERACTION (DRAG + PAN + ZOOM) */
  let dragging=null, panning=false, lastX=0,lastY=0;

  canvas.addEventListener("mousedown",e=>{
    const rect=canvas.getBoundingClientRect();
    const world=screenToWorld(e.clientX-rect.left,e.clientY-rect.top);

    dragging=nodes.find(n=>Math.hypot(n.x-world.x,n.y-world.y)<20);
    panning=!dragging;

    lastX=e.clientX;
    lastY=e.clientY;
  });

  window.addEventListener("mousemove",e=>{
    if(!dragging && !panning) return;

    const dx=e.clientX-lastX;
    const dy=e.clientY-lastY;

    if(dragging){
      const rect=canvas.getBoundingClientRect();
      const world=screenToWorld(e.clientX-rect.left,e.clientY-rect.top);
      dragging.x=world.x;
      dragging.y=world.y;
    }

    if(panning){
      camera.x-=dx/camera.scale;
      camera.y-=dy/camera.scale;
    }

    lastX=e.clientX;
    lastY=e.clientY;
  });

  window.addEventListener("mouseup",()=>{
    dragging=null;
    panning=false;
  });

  canvas.addEventListener("wheel",e=>{
    e.preventDefault();
    const zoom=e.deltaY<0?1.1:0.9;
    camera.scale=Math.max(0.5,Math.min(2.5,camera.scale*zoom));
  });

  return {nodes,links};
})();

/* =========================
   TERMINAL SYSTEM
========================= */
(() => {
  const terminal = document.getElementById("terminal");
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");

  document.getElementById("terminalToggle").onclick = () => {
    terminal.classList.toggle("active");
  };

  function log(text){
    const div=document.createElement("div");
    div.textContent=text;
    output.appendChild(div);
    output.scrollTop=output.scrollHeight;
  }

  function run(cmd){
    const c=cmd.toLowerCase().split(" ");

    if(c[0]==="help") log("create, connect, disconnect, nodes, clear");
    else if(c[0]==="nodes") NetworkSystem.nodes.forEach(n=>log(n.id));

    else if(c[0]==="create"){
      NetworkSystem.nodes.push({id:c[1],x:200,y:200});
      log("Created "+c[1]);
    }

    else if(c[0]==="connect"){
      NetworkSystem.links.push({a:c[1],b:c[2],load:0.5});
      log("Connected");
    }

    else if(c[0]==="disconnect"){
      NetworkSystem.links =
        NetworkSystem.links.filter(l=>l.a!==c[1] && l.b!==c[1]);
      log("Disconnected");
    }

    else if(c[0]==="clear"){
      output.innerHTML="";
    }

    else log("Unknown command");
  }

  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      run(input.value);
      input.value="";
    }
  });
})();
