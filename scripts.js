/* THEME */
const toggle = document.getElementById("themeToggle");

toggle.onclick = () => {
  document.body.classList.toggle("light");
  toggle.textContent =
    document.body.classList.contains("light") ? "☀️" : "🌙";
};

/* SCROLL */
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    const el = document.getElementById(tab.dataset.target);
    window.scrollTo({
      top: el.offsetTop - 70,
      behavior: "smooth"
    });
  };
});

/* NETWORK */
const net = document.getElementById("networkDiagram");

const nodesData = [
  {id:"Internet",x:50,y:250},
  {id:"Modem",x:200,y:250},
  {id:"Proxmox",x:350,y:250},
  {id:"OPNsense",x:500,y:250},
  {id:"Switch",x:650,y:250},
  {id:"PC",x:900,y:200}
];

const nodes = {};
nodesData.forEach(n => {
  const el = document.createElement("div");
  el.className = "node";
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  el.textContent = n.id;
  net.appendChild(el);
  nodes[n.id] = el;
});

const linksData = [
  ["Internet","Modem"],
  ["Modem","Proxmox"],
  ["Proxmox","OPNsense"],
  ["OPNsense","Switch"],
  ["Switch","PC"]
];

const links = linksData.map(([a,b]) => {
  const el = document.createElement("div");
  el.className = "link";
  net.appendChild(el);
  return {a:nodes[a], b:nodes[b], el};
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

    l.el.style.width=len+"px";
    l.el.style.left=x1+"px";
    l.el.style.top=y1+"px";
    l.el.style.transform=`rotate(${ang}deg)`;
  });
}

setInterval(updateLinks,16);