/* =========================
   GLOBAL STATE
========================= */
const subtitle = document.getElementById("subtitle");
const glowStyle = () => getComputedStyle(document.body).getPropertyValue('--glow');

/* =========================
   THEME
========================= */
if(localStorage.getItem("theme")==="true"){
  document.body.classList.add("light");
}

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light"));
};

/* =========================
   TYPEWRITER
========================= */
const text="Engineer | Mechanic | Tinkerer";
let i=0;

function typeEffect(){
  if(i <= text.length){
    subtitle.textContent = text.slice(0,i++);
    setTimeout(typeEffect,50);
  }
}
typeEffect();

/* =========================
   PARTICLES (OPTIMIZED)
========================= */
const pCanvas = document.getElementById("particles");
const pCtx = pCanvas.getContext("2d");

function resizeParticles(){
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
}
resizeParticles();
window.addEventListener("resize", resizeParticles);

let particles = Array.from({length:60},()=>({
  x:Math.random()*pCanvas.width,
  y:Math.random()*pCanvas.height,
  r:Math.random()*2
}));

function drawParticles(){
  const glow = glowStyle();
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);

  particles.forEach(p=>{
    pCtx.beginPath();
    pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    pCtx.fillStyle = glow + "55";
    pCtx.fill();

    p.y += 0.2;
    if(p.y > pCanvas.height) p.y = 0;
  });

  if(!document.hidden) requestAnimationFrame(drawParticles);
}
drawParticles();

/* =========================
   SECTION ANIMATION
========================= */
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

/* =========================
   NAV SCROLL
========================= */
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

/* =========================
   TERMINAL (UPGRADED)
========================= */
const terminal = document.getElementById("terminal");
const output = document.getElementById("terminalOutput");
const input = document.getElementById("terminalInput");

document.getElementById("terminalToggle").onclick = () => {
  terminal.classList.toggle("active");
};

let history = [];
let historyIndex = -1;

function log(text){
  const line = document.createElement("div");
  output.appendChild(line);
  line.textContent = text;
  output.scrollTop = output.scrollHeight;
}

/* Boot sequence */
log("Initializing system...");
setTimeout(()=>log("Loading network..."),300);
setTimeout(()=>log("Ready."),600);

function runCommand(cmd){
  history.push(cmd);
  historyIndex = history.length;

  const c = cmd.toLowerCase();

  if(c==="help") log("help, nodes, clear");
  else if(c==="nodes") log("Internet → Proxmox → OPNsense → Switch");
  else if(c==="clear") output.innerHTML="";
  else log("Unknown command");
}

input.addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    runCommand(input.value);
    input.value="";
  }

  if(e.key==="ArrowUp"){
    historyIndex = Math.max(0, historyIndex-1);
    input.value = history[historyIndex] || "";
  }

  if(e.key==="ArrowDown"){
    historyIndex = Math.min(history.length, historyIndex+1);
    input.value = history[historyIndex] || "";
  }
});