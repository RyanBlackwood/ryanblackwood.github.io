const html = document.documentElement;
const themeButton = document.getElementById('themeToggle');
const themeIcon = themeButton?.querySelector('.theme-toggle__icon');


const accentThemes = {
  blue: ['#1aa7ff', '#396bff', '#7ad7ff'],
  red: ['#ff4d4d', '#ff2e63', '#ff9a9a'],
  green: ['#22c55e', '#16a34a', '#86efac'],
  purple: ['#a855f7', '#7c3aed', '#d8b4fe'],
  orange: ['#f97316', '#ea580c', '#fdba74'],
  cyan: ['#06b6d4', '#0891b2', '#67e8f9'],
  gold: ['#facc15', '#f59e0b', '#fde68a']
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const value = clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean;
  const num = parseInt(value, 16);
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}

function applyAccentTheme(name, announce = false) {
  const selected = accentThemes[name] ? name : 'blue';
  const [g1, g2, g3] = accentThemes[selected];
  html.style.setProperty('--glow', g1);
  html.style.setProperty('--glow-2', g2);
  html.style.setProperty('--glow-3', g3);
  html.style.setProperty('--glow-rgb', hexToRgb(g1));
  localStorage.setItem('portfolio-accent', selected);
  if (announce) termLine(`theme changed to ${selected}`, 'terminal-success');
}

applyAccentTheme(localStorage.getItem('portfolio-accent') || 'blue');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

applyTheme(localStorage.getItem('portfolio-theme') || 'dark');
themeButton?.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

const canvas = document.getElementById('particles');
const ctx = canvas?.getContext('2d');
let particles = [];
let raf = null;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = innerWidth < 700 ? 42 : 88;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - .5) * .35,
    dy: (Math.random() - .5) * .35,
    a: Math.random() * .42 + .16
  }));
}

function getAccentRgb() {
  return getComputedStyle(html).getPropertyValue('--glow-rgb').trim() || '26,167,255';
}

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const light = html.getAttribute('data-theme') === 'light';
  const mul = light ? .42 : 1;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > innerWidth) p.dx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${getAccentRgb()},${p.a * mul})`;
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 118) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(${getAccentRgb()},${(1 - d / 118) * .16 * mul})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  raf = requestAnimationFrame(draw);
}

function startParticles() {
  if (raf) cancelAnimationFrame(raf);
  resizeCanvas();
  draw();
}

window.addEventListener('resize', resizeCanvas, { passive: true });
startParticles();

const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
  { threshold: .14 }
);
document.querySelectorAll('.reveal-card').forEach(el => revealObserver.observe(el));

const tabs = [...document.querySelectorAll('.section-tabs .tab')];
const sections = tabs
  .map(tab => {
    const href = tab.getAttribute('href') || '';
    return href.startsWith('#') ? { tab, section: document.querySelector(href) } : null;
  })
  .filter(Boolean)
  .filter(x => x.section);
function setActiveTab(tab) { tabs.forEach(t => t.classList.toggle('is-active', t === tab)); }
function updateActiveTab() {
  if (!sections.length) return;
  let current = sections[0];
  sections.forEach(item => { if (item.section.getBoundingClientRect().top <= innerHeight * .36) current = item; });
  if (current) setActiveTab(current.tab);
}
window.addEventListener('scroll', updateActiveTab, { passive: true });
tabs.forEach(tab => {
  const href = tab.getAttribute('href') || '';
  if (href.startsWith('#')) tab.addEventListener('click', () => setActiveTab(tab));
});
updateActiveTab();

const filterButtons = [...document.querySelectorAll('.filter-pill')];
const projectCards = [...document.querySelectorAll('.project-card')];
const projectCount = document.getElementById('projectCount');
const projectTitle = document.getElementById('projectFilterTitle');
const labels = {
  all: 'All Projects',
  infrastructure: 'Infrastructure',
  software: 'Software',
  'game-dev': 'Game Dev',
  electronics: 'Electronics',
  mechanical: 'Mechanical'
};

function syncExpandButton(button, open) {
  if (!button) return;
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '×' : '+';
  button.title = open ? 'Collapse details' : 'Expand details';
}

function updateCounts() {
  filterButtons.forEach(btn => {
    const cat = btn.dataset.filter;
    const count = cat === 'all' ? projectCards.length : projectCards.filter(card => card.dataset.category === cat).length;
    const slot = btn.querySelector('strong');
    if (slot) slot.textContent = String(count).padStart(2, '0');
  });
}

function applyFilter(category) {
  filterButtons.forEach(btn => {
    const active = btn.dataset.filter === category;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  let visible = 0;
  projectCards.forEach(card => {
    const show = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !show);
    if (!show) {
      card.classList.remove('is-open');
      syncExpandButton(card.querySelector('.project-expand'), false);
    } else {
      visible++;
    }
  });

  if (projectCount) projectCount.textContent = visible;
  if (projectTitle) projectTitle.textContent = labels[category] || 'Projects';
}

function toggleProjectCard(card) {
  if (!card) return;
  const willOpen = !card.classList.contains('is-open');
  projectCards.forEach(other => {
    if (other !== card) {
      other.classList.remove('is-open');
      syncExpandButton(other.querySelector('.project-expand'), false);
    }
  });
  card.classList.toggle('is-open', willOpen);
  syncExpandButton(card.querySelector('.project-expand'), willOpen);
}

function toggleHistoryItem(item) {
  if (!item) return;
  const willOpen = !item.classList.contains('is-open');
  const parent = item.closest('.history-list');
  parent?.querySelectorAll('.history-item').forEach(other => {
    if (other !== item) {
      other.classList.remove('is-open');
      syncExpandButton(other.querySelector('.history-expand'), false);
    }
  });
  item.classList.toggle('is-open', willOpen);
  syncExpandButton(item.querySelector('.history-expand'), willOpen);
}

filterButtons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter || 'all')));
updateCounts();
applyFilter('all');

projectCards.forEach(card => {
  syncExpandButton(card.querySelector('.project-expand'), card.classList.contains('is-open'));
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

document.querySelectorAll('.history-item').forEach(item => {
  syncExpandButton(item.querySelector('.history-expand'), item.classList.contains('is-open'));
});

document.addEventListener('click', event => {
  const projectButton = event.target.closest('.project-expand');
  if (projectButton) {
    event.preventDefault();
    event.stopPropagation();
    toggleProjectCard(projectButton.closest('.project-card'));
    return;
  }

  const historyButton = event.target.closest('.history-expand');
  if (historyButton) {
    event.preventDefault();
    event.stopPropagation();
    toggleHistoryItem(historyButton.closest('.history-item'));
  }
});

const terminalToggle = document.getElementById('terminalToggle');
const terminal = document.getElementById('terminal');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');

const terminalCommands = {
  help: 'Show available commands',
  sections: 'List portfolio sections',
  summary: 'Go to the summary section',
  home: 'Go to the summary section',
  about: 'Go to the about section',
  education: 'Go to education history',
  work: 'Go to work history',
  skills: 'Go to technical skills',
  tools: 'Go to recruiter tools',
  timeline: 'Go to project timeline',
  logbook: 'Go to engineering logbook',
  projects: 'Go to the project library',
  mechanical: 'Go to mechanical work',
  contact: 'Go to contact',
  resume: 'Download resume PDF',
  'open-resume': 'Open resume in a new tab',
  email: 'Copy email address',
  themes: 'Show visual accent theme options',
  'theme [color]': 'Change accent color',
  infrastructure: 'Filter projects: infrastructure',
  software: 'Filter projects: software',
  gamedev: 'Filter projects: game development',
  electronics: 'Filter projects: electronics',
  fabrication: 'Filter projects: mechanical / fabrication',
  homelab: 'Open the dedicated homelab page',
  diagnose: 'Run a sample diagnostic summary',
  architecture: 'Open the architecture viewer',
  troubleshoot: 'Open troubleshooting lab',
  expand: 'Expand visible cards',
  collapse: 'Collapse open cards',
  clear: 'Clear terminal output'
};

function termLine(text, tone = '') {
  if (!terminalOutput) return;
  const p = document.createElement('p');
  p.textContent = text;
  if (tone) p.className = tone;
  terminalOutput.appendChild(p);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function scrollToSection(id, label) {
  const section = document.getElementById(id);
  if (!section) return termLine(`section not found: ${id}`, 'terminal-error');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
  termLine(`opening ${label || id}...`);
}

function filterProjects(category, label) {
  scrollToSection('projects', 'project library');
  applyFilter(category);
  termLine(`filtering ${label || category} projects...`);
}

function setCardOpen(card, isOpen) {
  if (!card) return;
  card.classList.toggle('is-open', isOpen);
  syncExpandButton(card.querySelector('.project-expand'), isOpen);
}

function setHistoryOpen(item, isOpen) {
  if (!item) return;
  item.classList.toggle('is-open', isOpen);
  syncExpandButton(item.querySelector('.history-expand'), isOpen);
}

function expandVisibleCards() {
  projectCards.filter(card => !card.classList.contains('hidden')).forEach(card => setCardOpen(card, true));
  document.querySelectorAll('.history-item').forEach(item => setHistoryOpen(item, true));
  termLine('expanded visible project, work, and education cards.');
}

function collapseOpenCards() {
  projectCards.forEach(card => setCardOpen(card, false));
  document.querySelectorAll('.history-item').forEach(item => setHistoryOpen(item, false));
  termLine('collapsed open cards.');
}

function showHelp() {
  termLine('available commands:');
  Object.entries(terminalCommands).forEach(([command, description]) => {
    termLine(`  ${command.padEnd(14, ' ')} ${description}`);
  });
}


function downloadResume() {
  const link = document.createElement('a');
  link.href = 'Ryan_Blackwood_Resume.pdf';
  link.download = 'Ryan_Blackwood_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  termLine('downloading resume...');
}

function openResume() {
  window.open('Ryan_Blackwood_Resume.pdf', '_blank', 'noopener');
  termLine('opening resume...');
}

function copyEmail() {
  const email = 'ryan.j.blackwood@gmail.com';
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email)
      .then(() => termLine('email copied: ' + email))
      .catch(() => termLine('email: ' + email));
  } else {
    termLine('email: ' + email);
  }
}



function showThemePalette() {
  if (!terminalOutput) return;
  const wrap = document.createElement('div');
  wrap.className = 'theme-palette';
  Object.entries(accentThemes).forEach(([name, colors]) => {
    const card = document.createElement('div');
    card.className = 'theme-swatch';
    card.style.setProperty('--swatch-a', colors[0]);
    card.style.setProperty('--swatch-b', colors[1]);
    card.innerHTML = `<div class="theme-swatch__chip"></div><strong>${name}</strong><small>theme ${name}</small>`;
    wrap.appendChild(card);
  });
  terminalOutput.appendChild(wrap);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  termLine('type theme [color] to apply an accent.');
}

function handleThemeCommand(rawValue) {
  const parts = rawValue.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return showThemePalette();
  const color = parts[1];
  if (!accentThemes[color]) {
    termLine('unknown theme. available: ' + Object.keys(accentThemes).join(', '), 'terminal-error');
    showThemePalette();
    return;
  }
  applyAccentTheme(color, true);
}

function runTerminalCommand(rawValue) {
  const raw = rawValue.trim().toLowerCase();
  if (raw === 'themes' || raw === 'theme' || raw.startsWith('theme ')) return handleThemeCommand(raw);
  const cmd = raw.replace(/\s+/g, '-');
  if (!cmd) return;
  if (cmd === 'help') return showHelp();
  if (cmd === 'sections') return termLine('sections: summary, about, education, work, skills, tools, timeline, skill-map, logbook, projects, mechanical, contact, homelab page');
  if (cmd === 'clear') { if (terminalOutput) terminalOutput.innerHTML = ''; return; }
  if (cmd === 'resume' || cmd === 'download-resume') return downloadResume();
  if (cmd === 'open-resume' || cmd === 'view-resume') return openResume();
  if (cmd === 'email' || cmd === 'copy-email') return copyEmail();

  const sectionAliases = {
    home: ['summary', 'summary'],
    summary: ['summary', 'summary'],
    about: ['about', 'about'],
    education: ['education', 'education history'],
    school: ['education', 'education history'],
    work: ['work', 'work history'],
    experience: ['work', 'work history'],
    jobs: ['work', 'work history'],
    skills: ['skills', 'technical skills'],
    skill: ['skills', 'technical skills'],
    tools: ['tools', 'recruiter tools'],
    timeline: ['timeline', 'project timeline'],
    logbook: ['logbook', 'engineering logbook'],
    'skill-map': ['skill-map', 'skill proof map'],
    projects: ['projects', 'project library'],
    portfolio: ['projects', 'project library'],
    mechanical: ['mechanical', 'mechanical work'],
    contact: ['contact', 'contact']
  };
  if (sectionAliases[cmd]) return scrollToSection(sectionAliases[cmd][0], sectionAliases[cmd][1]);

  const filterAliases = {
    all: ['all', 'all'],
    infrastructure: ['infrastructure', 'infrastructure'],
    network: ['infrastructure', 'infrastructure'],
    networking: ['infrastructure', 'infrastructure'],
    software: ['software', 'software'],
    code: ['software', 'software'],
    gamedev: ['game-dev', 'game development'],
    'game-dev': ['game-dev', 'game development'],
    games: ['game-dev', 'game development'],
    electronics: ['electronics', 'electronics'],
    repair: ['electronics', 'electronics'],
    fabrication: ['mechanical', 'mechanical / fabrication'],
    cad: ['mechanical', 'mechanical / fabrication'],
    '3d-printing': ['mechanical', 'mechanical / fabrication']
  };
  if (filterAliases[cmd]) return filterProjects(filterAliases[cmd][0], filterAliases[cmd][1]);

  if (cmd === 'homelab' || cmd === 'lab') {
    termLine('opening dedicated homelab page...');
    window.location.href = 'homelab.html';
    return;
  }
  if (cmd === 'diagnose') { termLine('diagnostic: WAN reachable; DHCP OK; DNS listening; WireGuard path should verify MTU and outbound NAT.', 'terminal-success'); return; }
  if (cmd === 'architecture') { if (document.getElementById('architecture')) return scrollToSection('architecture', 'architecture viewer'); window.location.href = 'homelab.html#architecture'; return; }
  if (cmd === 'troubleshoot' || cmd === 'troubleshooting') { if (document.getElementById('troubleshooting')) return scrollToSection('troubleshooting', 'troubleshooting lab'); window.location.href = 'homelab.html#troubleshooting'; return; }
  if (cmd === 'network') {
    if (document.getElementById('homelab')) return scrollToSection('homelab', 'homelab simulator');
    window.location.href = 'homelab.html#homelab';
    return;
  }
  if (cmd === 'cad' || cmd === 'stl') {
    if (document.getElementById('cad')) return scrollToSection('cad', 'CAD/STL showcase');
    window.location.href = 'homelab.html#cad';
    return;
  }
  if (cmd === 'expand' || cmd === 'open-all') return expandVisibleCards();
  if (cmd === 'collapse' || cmd === 'close-all') return collapseOpenCards();

  termLine('unknown command. type help.');
}

terminalToggle?.addEventListener('click', () => {
  const open = !terminal?.classList.contains('is-open');
  terminal?.classList.toggle('is-open', open);
  terminal?.setAttribute('aria-hidden', String(!open));
  if (open) setTimeout(() => terminalInput?.focus(), 60);
});

terminalInput?.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const value = terminalInput.value.trim();
  if (!value) return;
  termLine('> ' + value);
  terminalInput.value = '';
  runTerminalCommand(value);
});



/* =========================================================
   Website v4 — editable homelab graph + self-contained STL viewer
========================================================= */
const defaultTopology = {
  nodes: {
    internet:{title:'Internet',description:'External network path entering the homelab through the Arris modem.',role:'WAN source',segment:'Public internet',status:'Active',icon:'☁',x:90,y:150},
    arris:{title:'Arris Modem',description:'Public WAN handoff from ISP into the OPNsense edge firewall through the Proxmox WAN bridge.',role:'Modem / WAN handoff',segment:'WAN bridge',status:'Online',icon:'◉',x:235,y:185},
    proxmox:{title:'Proxmox Host',description:'Virtualization host with WAN and LAN bridges. OPNsense and game/service VMs run here.',role:'Hypervisor',segment:'10.0.0.2',status:'Online',icon:'▦',x:420,y:420},
    opnsense:{title:'OPNsense Firewall',description:'Primary router, firewall, DHCP/DNS control point, VLAN gateway, and WireGuard policy-routing brain.',role:'Firewall + router',segment:'10.0.0.1 / VLAN gateways',status:'Core',icon:'⌁',x:455,y:255},
    switch:{title:'TP-Link TL-SG608E',description:'Smart switch separating trunk, LAN, Eero, portfolio interaction, and WireGuard-routed segments.',role:'Managed switch',segment:'Tagged trunk + access ports',status:'Active',icon:'▤',x:660,y:320},
    lan:{title:'Main LAN',description:'Trusted management network and normal devices routing through the regular WAN path.',role:'Primary LAN',segment:'10.0.0.0/24',status:'Trusted',icon:'⌂',x:900,y:185},
    eero:{title:'Eero Wi‑Fi VLAN',description:'Wireless clients isolated onto their own VLAN/subnet so they do not inherit VPN routing unless intended.',role:'Wi‑Fi segment',segment:'Dedicated VLAN',status:'Segmented',icon:'≋',x:920,y:330},
    wireguard:{title:'Hetzner WireGuard Exit',description:'Upstream WireGuard tunnel used for selected VLAN egress so specific services show the Hetzner public IP.',role:'VPN exit',segment:'wg0 / Hetzner VPS',status:'Policy routed',icon:'◇',x:880,y:80},
    portfolio:{title:'Portfolio Interaction VLAN',description:'Dedicated lab/portfolio interaction segment for demos and isolated experiments.',role:'Demo VLAN',segment:'VLAN 20',status:'Planned',icon:'◆',x:850,y:475},
    servers:{title:'Hosted Game Servers',description:'Minecraft, Project Zomboid, and future hosted services can be placed onto the intended VLAN and route policy.',role:'Service VMs',segment:'VLAN 40 / server subnet',status:'Expandable',icon:'▣',x:650,y:550},
    clients:{title:'Client Devices',description:'Desktops, tools, and regular devices on trusted or purpose-built access ports.',role:'Endpoint clients',segment:'Main LAN / access ports',status:'Active',icon:'⌘',x:1010,y:560}
  },
  links: [
    ['internet','arris','all'],['arris','opnsense','all'],['opnsense','proxmox','server'],['opnsense','switch','all'],
    ['switch','lan','lan'],['switch','eero','eero'],['switch','wireguard','wg'],['switch','portfolio','server'],['switch','servers','server'],['switch','clients','lan']
  ],
  paths: { lan:['internet','arris','opnsense','switch','lan'], wg:['internet','arris','opnsense','switch','wireguard'], eero:['internet','arris','opnsense','switch','eero'], server:['internet','arris','opnsense','switch','servers'] }
};
let topology = JSON.parse(localStorage.getItem('portfolio-topology-v3') || 'null') || structuredClone(defaultTopology);
let selectedNode = Object.keys(topology.nodes)[0];
let activePath = 'lan';
let pan = {x:0,y:0}, zoom = 1;

function saveTopology(){ localStorage.setItem('portfolio-topology-v3', JSON.stringify(topology)); }
function nodeEl(id){ return document.querySelector(`.topology-node[data-node="${CSS.escape(id)}"]`); }
function activePathNodes(){ return topology.paths[activePath] || topology.paths.lan; }
function updateViewport(){ const vp=document.getElementById('viewport'); if(vp) vp.setAttribute('transform',`translate(${pan.x} ${pan.y}) scale(${zoom})`); }
function linkPath(a,b){ const dx=b.x-a.x, c1x=a.x+dx*.45, c2x=b.x-dx*.45; return `M${a.x} ${a.y} C${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`; }
function renderTopology(){
  const links=document.getElementById('topologyLinks'), nodes=document.getElementById('topologyNodes');
  if(!links||!nodes) return;
  const pathSet = new Set(); const pn=activePathNodes(); for(let i=0;i<pn.length-1;i++) pathSet.add(`${pn[i]}|${pn[i+1]}`);
  links.innerHTML = topology.links.map(([from,to,kind])=>{
    const a=topology.nodes[from], b=topology.nodes[to]; if(!a||!b) return '';
    const active = pathSet.has(`${from}|${to}`) || pathSet.has(`${to}|${from}`);
    return `<path class="topology-link ${active?'is-active':''} path-${kind}" d="${linkPath(a,b)}" data-from="${from}" data-to="${to}"/>`;
  }).join('');
  nodes.innerHTML = Object.entries(topology.nodes).map(([id,n])=>`
    <g class="topology-node ${id===selectedNode?'is-selected':''}" data-node="${id}" transform="translate(${n.x} ${n.y})">
      <circle r="58"></circle><text>${n.icon||'•'} ${n.title}</text><small>${n.segment||''}</small>
    </g>`).join('');
  bindNodeEvents(); selectHomelabNode(selectedNode, false); updateViewport();
}
function selectHomelabNode(key, rerender=true){
  if(!topology.nodes[key]) return; selectedNode=key;
  document.querySelectorAll('.topology-node').forEach(n=>n.classList.toggle('is-selected', n.dataset.node===key));
  const n=topology.nodes[key];
  const map={nodeEditTitle:n.title,nodeEditDescription:n.description,nodeEditRole:n.role,nodeEditSegment:n.segment,nodeEditStatus:n.status,nodeEditIcon:n.icon||''};
  Object.entries(map).forEach(([id,val])=>{const el=document.getElementById(id); if(el) el.value=val||'';});
  if(rerender) saveTopology();
}
function setSimPath(path){ activePath = topology.paths[path] ? path : 'lan'; document.querySelectorAll('.sim-pill[data-path]').forEach(b=>b.classList.toggle('is-active', b.dataset.path===activePath)); renderTopology(); selectHomelabNode(activePathNodes()[0]||selectedNode); }
function bindNodeEvents(){
  document.querySelectorAll('.topology-node').forEach(g=>{
    g.addEventListener('pointerdown', e=>{ e.stopPropagation(); selectHomelabNode(g.dataset.node); const svg=document.getElementById('homelabSvg'); const start=svgPoint(e); const id=g.dataset.node; const orig={x:topology.nodes[id].x,y:topology.nodes[id].y}; g.setPointerCapture(e.pointerId);
      const move=ev=>{ const p=svgPoint(ev); topology.nodes[id].x=orig.x+(p.x-start.x)/zoom; topology.nodes[id].y=orig.y+(p.y-start.y)/zoom; renderTopology(); };
      const up=()=>{ saveTopology(); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
      window.addEventListener('pointermove',move); window.addEventListener('pointerup',up,{once:true});
    });
  });
}
function svgPoint(e){ const svg=document.getElementById('homelabSvg'); const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
function initPanZoom(){ const svg=document.getElementById('homelabSvg'); if(!svg) return; let down=false, start={x:0,y:0}, orig={x:0,y:0};
  svg.addEventListener('pointerdown',e=>{ if(e.target.closest('.topology-node')) return; down=true; start={x:e.clientX,y:e.clientY}; orig={...pan}; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove',e=>{ if(!down) return; pan.x=orig.x+(e.clientX-start.x); pan.y=orig.y+(e.clientY-start.y); updateViewport(); });
  svg.addEventListener('pointerup',()=>{down=false;});
  svg.addEventListener('wheel',e=>{ e.preventDefault(); const factor=e.deltaY<0?1.1:.9; zoom=Math.min(2.4,Math.max(.45,zoom*factor)); updateViewport(); },{passive:false});
}
function saveSelectedNode(){ const n=topology.nodes[selectedNode]; if(!n) return; const get=id=>document.getElementById(id)?.value || ''; n.title=get('nodeEditTitle'); n.description=get('nodeEditDescription'); n.role=get('nodeEditRole'); n.segment=get('nodeEditSegment'); n.status=get('nodeEditStatus'); n.icon=get('nodeEditIcon') || '•'; saveTopology(); renderTopology(); }
function addTopologyNode(){ const id='node'+Date.now().toString(36); topology.nodes[id]={title:'New Node',description:'Describe this device or network segment.',role:'Custom',segment:'Lab',status:'Draft',icon:'＋',x:560,y:340}; topology.links.push(['switch',id,'lan']); topology.paths.lan.push(id); selectedNode=id; saveTopology(); renderTopology(); }
function deleteTopologyNode(){ if(['internet','arris','opnsense','switch'].includes(selectedNode)) return alert('Core nodes are protected. Edit them instead of deleting.'); delete topology.nodes[selectedNode]; topology.links=topology.links.filter(l=>!l.includes(selectedNode)); Object.keys(topology.paths).forEach(k=>topology.paths[k]=topology.paths[k].filter(x=>x!==selectedNode)); selectedNode=Object.keys(topology.nodes)[0]; saveTopology(); renderTopology(); }
function runPacketSimulation(){ const dot=document.getElementById('packetDot'); if(!dot) return; const nodes=activePathNodes().filter(k=>topology.nodes[k]); let i=0,start=null; dot.classList.add('is-running'); function frame(ts){ if(!start) start=ts; const a=topology.nodes[nodes[i]], b=topology.nodes[nodes[Math.min(i+1,nodes.length-1)]]; const p=Math.min((ts-start)/850,1); dot.setAttribute('cx',a.x+(b.x-a.x)*p); dot.setAttribute('cy',a.y+(b.y-a.y)*p); if(p>=1){ selectHomelabNode(nodes[Math.min(i+1,nodes.length-1)],false); i++; start=ts; } if(i<nodes.length-1) requestAnimationFrame(frame); else setTimeout(()=>dot.classList.remove('is-running'),500); } requestAnimationFrame(frame); }
function initHomelabEditor(){ if(!document.getElementById('homelabSvg')) return; initPanZoom(); renderTopology(); setSimPath('lan'); document.querySelectorAll('.sim-pill[data-path]').forEach(btn=>btn.addEventListener('click',()=>setSimPath(btn.dataset.path))); document.getElementById('saveNode')?.addEventListener('click',saveSelectedNode); document.getElementById('addNode')?.addEventListener('click',addTopologyNode); document.getElementById('deleteNode')?.addEventListener('click',deleteTopologyNode); document.getElementById('resetTopology')?.addEventListener('click',()=>{ if(confirm('Reset the topology demo to the Website v4 default?')){ topology=structuredClone(defaultTopology); selectedNode='internet'; pan={x:0,y:0}; zoom=1; saveTopology(); renderTopology(); }}); document.getElementById('runPacket')?.addEventListener('click',runPacketSimulation); }


const cadState={projects:[],activeProject:null,triangles:[],edges:[],bounds:null,rx:-.58,ry:.72,zoom:1,dragging:false,last:[0,0],showSolid:true,showWire:true,showDims:true,raf:null};
function parseAsciiSTL(text){const nums=[...text.matchAll(/vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g)].map(m=>[+m[1],+m[2],+m[3]]);const tris=[];for(let i=0;i<nums.length;i+=3)if(nums[i+2])tris.push([nums[i],nums[i+1],nums[i+2]]);return tris;}
function parseBinarySTL(buffer){const view=new DataView(buffer);if(view.byteLength<84)return[];const count=view.getUint32(80,true);const expected=84+count*50;if(expected>view.byteLength+100)return[];const tris=[];let off=84;for(let i=0;i<count&&off+50<=view.byteLength;i++){off+=12;const tri=[];for(let v=0;v<3;v++){tri.push([view.getFloat32(off,true),view.getFloat32(off+4,true),view.getFloat32(off+8,true)]);off+=12;}tris.push(tri);off+=2;}return tris;}
function decodeSTL(buffer){const head=new TextDecoder('utf-8',{fatal:false}).decode(buffer.slice(0,80)).trim().toLowerCase();if(head.startsWith('solid')){const text=new TextDecoder('utf-8',{fatal:false}).decode(buffer);const ascii=parseAsciiSTL(text);if(ascii.length)return ascii;}return parseBinarySTL(buffer);}
function fallbackTris(){const v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],f=[[0,1,2],[0,2,3],[4,6,5],[4,7,6],[0,4,5],[0,5,1],[1,5,6],[1,6,2],[2,6,7],[2,7,3],[3,7,4],[3,4,0]];return f.map(t=>t.map(i=>v[i]));}
function computeBounds(tris){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];tris.flat().forEach(p=>p.forEach((v,i)=>{min[i]=Math.min(min[i],v);max[i]=Math.max(max[i],v)}));return{min,max,size:max.map((v,i)=>v-min[i]),center:min.map((v,i)=>(v+max[i])/2)}}
function cadSub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
function cadCross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function cadNormalize(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]}
function buildDisplayEdges(tris, creaseAngleDeg=32){
  const edgeMap=new Map();
  const q=p=>p.map(v=>(Math.round(v*10000)/10000).toFixed(4)).join(',');
  const key=(a,b)=>{const ak=q(a),bk=q(b);return ak<bk?`${ak}|${bk}`:`${bk}|${ak}`};
  tris.forEach(tr=>{
    const normal=cadNormalize(cadCross(cadSub(tr[1],tr[0]),cadSub(tr[2],tr[0])));
    [[tr[0],tr[1]],[tr[1],tr[2]],[tr[2],tr[0]]].forEach(([a,b])=>{
      const k=key(a,b);
      if(!edgeMap.has(k))edgeMap.set(k,{a,b,normals:[]});
      edgeMap.get(k).normals.push(normal);
    });
  });
  const cosLimit=Math.cos(creaseAngleDeg*Math.PI/180);
  const edges=[];
  edgeMap.forEach(edge=>{
    if(edge.normals.length===1){edges.push([edge.a,edge.b]);return;}
    let sharp=false;
    for(let i=0;i<edge.normals.length&&!sharp;i++){
      for(let j=i+1;j<edge.normals.length;j++){
        const a=edge.normals[i],b=edge.normals[j];
        const dot=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
        if(dot<cosLimit){sharp=true;break;}
      }
    }
    if(sharp)edges.push([edge.a,edge.b]);
  });
  return edges;
}
function normalizeTris(tris){const bounds=computeBounds(tris);const scale=2.45/Math.max(...bounds.size,.01);const normalized=tris.map(tr=>tr.map(p=>p.map((v,i)=>(v-bounds.center[i])*scale)));return{tris:normalized,edges:buildDisplayEdges(normalized),bounds};}
function fmtMm(v){return Number.isFinite(v)?`${v.toFixed(v>=100?0:1)} mm`:'—'}
function updateCadDimensions(bounds){const slot=document.getElementById('cadDimensions');if(!slot)return;slot.textContent=bounds?`${fmtMm(bounds.size[0])} × ${fmtMm(bounds.size[1])} × ${fmtMm(bounds.size[2])}`:'Waiting for file';}
function statusText(text,tone=''){const el=document.getElementById('viewerStatus');if(!el)return;el.textContent=text;el.dataset.tone=tone;}
async function loadCadManifest(){try{const res=await fetch('cad-manifest.json',{cache:'no-store'});if(!res.ok)throw new Error(res.status);return await res.json();}catch(e){statusText('CAD manifest could not be loaded. Run a local server from the website folder.','warn');return{projects:[]};}}
function createCadCard(project,index){const a=document.createElement('article');a.className='cad-card';a.dataset.cadFamily=project.family;a.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><h3>${project.title}</h3><p>${project.subtitle||project.family}</p>`;a.addEventListener('click',()=>selectCadProject(project.id));return a;}
function renderCadLibrary(projects){const lib=document.getElementById('cadLibrary');if(!lib)return;lib.innerHTML='';projects.forEach((p,i)=>lib.appendChild(createCadCard(p,i)));document.querySelectorAll('[data-cad-filter]').forEach(btn=>btn.addEventListener('click',()=>{const filter=btn.dataset.cadFilter;document.querySelectorAll('[data-cad-filter]').forEach(b=>b.classList.toggle('is-active',b===btn));document.querySelectorAll('.cad-library--integrated .cad-card').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.cadFamily!==filter));}));}
function updateCadInfo(project){const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'—'};set('cadTitle',project.title);set('cadProjectTitle',project.title);set('cadFamily',project.family);set('cadDesc',project.description);set('cadStatus',project.status);set('cadMaterial',project.materials);const notes=document.getElementById('cadNotes');if(notes)notes.innerHTML=(project.notes||[]).map(n=>`<p>• ${n}</p>`).join('');const dl=document.getElementById('cadDownloads');if(dl){const entries=[['stl','STL'],['freecad','FreeCAD'],['ctb','CTB']].filter(([k])=>project.files?.[k]);dl.innerHTML=entries.map(([k,l])=>`<a class="button ${k==='stl'?'button-primary':'button-secondary'}" href="${project.files[k]}" download>${l}</a>`).join('')||'<span class="cad-download-empty">No downloadable file path listed</span>';}document.querySelectorAll('.cad-library--integrated .cad-card').forEach(c=>c.classList.toggle('is-active',c.querySelector('h3')?.textContent===project.title));}
async function loadStlProject(project){cadState.activeProject=project;updateCadInfo(project);if(!project.files?.stl){{const norm=normalizeTris(fallbackTris());cadState.triangles=norm.tris;cadState.edges=norm.edges;cadState.bounds=null;}const d=document.getElementById('cadDimensions');if(d)d.textContent='CTB only';statusText('This entry is a CTB/manufacturing file. Viewer shows reference cube until an STL is added.','warn');return;}statusText('Loading STL mesh…');try{const buffer=await fetch(project.files.stl).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()});const parsed=decodeSTL(buffer);if(!parsed.length)throw new Error('No triangles found');const norm=normalizeTris(parsed);cadState.triangles=norm.tris;cadState.edges=norm.edges;cadState.bounds=norm.bounds;updateCadDimensions(norm.bounds);statusText('STL loaded. Drag to rotate, scroll to zoom.');}catch(e){{const norm=normalizeTris(fallbackTris());cadState.triangles=norm.tris;cadState.edges=norm.edges;cadState.bounds=null;}updateCadDimensions(null);statusText('STL file not found yet. Place assets in /cad/ paths or run with a local server.','warn');}}
function selectCadProject(id){const p=cadState.projects.find(x=>x.id===id)||cadState.projects[0];if(p)loadStlProject(p);}
function initCadToggles(){const bind=(id,key)=>document.getElementById(id)?.addEventListener('click',e=>{cadState[key]=!cadState[key];e.currentTarget.classList.toggle('is-active',cadState[key])});bind('cadSolidToggle','showSolid');bind('cadWireToggle','showWire');bind('cadDimsToggle','showDims');document.getElementById('resetCamera')?.addEventListener('click',()=>{cadState.rx=-.58;cadState.ry=.72;cadState.zoom=1})}
function initCadCanvasControls(canvas){canvas.addEventListener('pointerdown',e=>{cadState.dragging=true;cadState.last=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!cadState.dragging)return;cadState.ry+=(e.clientX-cadState.last[0])*.01;cadState.rx+=(e.clientY-cadState.last[1])*.01;cadState.last=[e.clientX,e.clientY]});canvas.addEventListener('pointerup',()=>cadState.dragging=false);canvas.addEventListener('pointercancel',()=>cadState.dragging=false);canvas.addEventListener('wheel',e=>{e.preventDefault();cadState.zoom=Math.min(4,Math.max(.35,cadState.zoom*(e.deltaY<0?1.1:.9)))},{passive:false});}
function drawCadViewer(){
  const canvas=document.getElementById('stlCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const ratio=Math.min(devicePixelRatio||1,2);
  const rect=canvas.getBoundingClientRect();
  canvas.width=Math.max(320,rect.width)*ratio;
  canvas.height=Math.max(260,rect.height)*ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const w=canvas.clientWidth,h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const accent=getComputedStyle(document.documentElement).getPropertyValue('--glow-rgb').trim()||'26,167,255';
  ctx.globalAlpha=.42;
  ctx.strokeStyle=`rgba(${accent},.18)`;
  ctx.lineWidth=1;
  for(let x=36;x<w;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=36;y<h;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.globalAlpha=1;

  const project=p=>{
    let[x,y,z]=p;
    const cy=Math.cos(cadState.ry),sy=Math.sin(cadState.ry),cx=Math.cos(cadState.rx),sx=Math.sin(cadState.rx);
    const x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx+4.2;
    const s=Math.min(w,h)*.35*cadState.zoom/z2;
    return[w/2+x1*s,h/2-y1*s,z2];
  };

  const fallback=normalizeTris(fallbackTris());
  const tris=cadState.triangles.length?cadState.triangles:fallback.tris;
  const displayEdges=cadState.edges?.length?cadState.edges:fallback.edges;
  const faces=tris.map(tr=>{const pts=tr.map(project);return{pts,z:pts.reduce((a,p)=>a+p[2],0)/3}}).sort((a,b)=>b.z-a.z);

  if(cadState.showSolid){
    faces.forEach((f,idx)=>{
      ctx.beginPath();ctx.moveTo(f.pts[0][0],f.pts[0][1]);ctx.lineTo(f.pts[1][0],f.pts[1][1]);ctx.lineTo(f.pts[2][0],f.pts[2][1]);ctx.closePath();
      const shade=Math.max(.10,Math.min(.32,.28-(idx/faces.length)*.14));
      ctx.fillStyle=`rgba(${accent},${shade})`;
      ctx.fill();
    });
  }

  // Wireframe fix: draw only boundary/crease edges instead of every STL triangle.
  // This preserves all mesh data, but avoids the spiderweb/starburst look on mobile.
  if(cadState.showWire){
    ctx.save();
    ctx.shadowColor=`rgba(${accent},.42)`;
    ctx.shadowBlur=8;
    ctx.strokeStyle='rgba(220,245,255,.86)';
    ctx.lineWidth=1.15;
    displayEdges.forEach(edge=>{
      const a=project(edge[0]),b=project(edge[1]);
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    });
    ctx.restore();
  }

  if(cadState.showDims&&cadState.bounds){
    ctx.save();ctx.fillStyle='rgba(0,0,0,.42)';ctx.strokeStyle=`rgba(${accent},.58)`;ctx.lineWidth=1;
    const text=`X ${fmtMm(cadState.bounds.size[0])}   Y ${fmtMm(cadState.bounds.size[1])}   Z ${fmtMm(cadState.bounds.size[2])}`;
    ctx.font='700 13px Inter, system-ui, sans-serif';
    const tw=ctx.measureText(text).width+28,x=18,y=h-48;
    ctx.beginPath();ctx.roundRect(x,y,tw,32,12);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(text,x+14,y+21);ctx.restore();
  }
  cadState.raf=requestAnimationFrame(drawCadViewer);
}
async function initStlCanvasViewer(){const canvas=document.getElementById('stlCanvas');if(!canvas)return;initCadCanvasControls(canvas);initCadToggles();const manifest=await loadCadManifest();cadState.projects=manifest.projects||[];renderCadLibrary(cadState.projects);if(cadState.raf)cancelAnimationFrame(cadState.raf);drawCadViewer();if(cadState.projects[0])selectCadProject(cadState.projects[0].id);}

window.addEventListener('load',()=>{ initHomelabEditor(); initStlCanvasViewer(); });

/* =========================================================
   Website v4 — recruiter tools, heatmap, troubleshooting, architecture
========================================================= */
const heatContent = {
  diagnostics: ['Diagnostics', 'Evidence: Geek Squad repair work, warehouse troubleshooting, homelab failure isolation, and structured network simulations.', ['Root cause','Process','Documentation']],
  networking: ['Networking', 'Evidence: OPNsense routing, VLAN separation, WireGuard egress, Proxmox bridge planning, and managed switch configuration.', ['OPNsense','VLANs','WireGuard']],
  repair: ['Repair', 'Evidence: device repair, PC cleanup, automotive maintenance, wiring diagnosis, and practical service communication.', ['Hardware','Testing','Service']],
  cad: ['CAD & Fabrication', 'Evidence: socket organizer prototypes, component speaker mounts, modular tile connector planning, and STL iteration notes.', ['FreeCAD','STL','3D Printing']],
  software: ['Software Systems', 'Evidence: portfolio system, Minecraft plugin architecture, Electron launcher planning, and interactive JavaScript demos.', ['HTML/CSS/JS','Java','Electron']]
};
function initSkillHeatmap(){
  const details=document.getElementById('heatDetails'); if(!details) return;
  document.querySelectorAll('.heat-node').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.heat-node').forEach(b=>b.classList.toggle('is-active',b===btn));
    const c=heatContent[btn.dataset.skill]||heatContent.diagnostics;
    details.innerHTML=`<p class="eyebrow">Selected Skill</p><h3>${c[0]}</h3><p>${c[1]}</p><div class="tag-row">${c[2].map(t=>`<span>${t}</span>`).join('')}</div>`;
  }));
}
const troubleCases={
  dns:{num:'01',title:'DNS outage on VLAN 40',sym:'Symptoms: IP pings succeed, but domain lookups fail from the WireGuard-routed VLAN.',steps:['Confirm gateway reachability with a direct IP ping.','Test DNS from the affected client and from OPNsense.','Verify Unbound is listening on the VLAN interface.','Apply interface/DNS rule fix and retest.']},
  wg:{num:'02',title:'WireGuard tunnel idle',sym:'Symptoms: gateway monitor errors, handshake is missing or traffic counters do not move.',steps:['Check peer endpoint, keys, and allowed IPs.','Verify firewall rules allow VLAN traffic to the WireGuard gateway.','Review outbound NAT on the tunnel interface.','Restart tunnel and confirm counters increase.']},
  dhcp:{num:'03',title:'VLAN DHCP failure',sym:'Symptoms: clients self-assign addresses or remain disconnected on a tagged switch port.',steps:['Confirm switch PVID and tagged/untagged membership.','Confirm OPNsense VLAN interface assignment.','Verify DHCP service is enabled on that interface.','Renew client lease and test gateway reachability.']},
  mtu:{num:'04',title:'MTU blackhole',sym:'Symptoms: small pings work, but larger websites or media requests hang.',steps:['Test with reduced packet size.','Set tunnel/client MTU around 1420.','Review normalization rules and MSS clamping.','Retest affected sites and DNS lookups.']}
};
function initTroubleshooting(){
  const detail=document.getElementById('troubleDetail'); if(!detail) return;
  document.querySelectorAll('.trouble-case').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.trouble-case').forEach(b=>b.classList.toggle('is-active',b===btn));
    const c=troubleCases[btn.dataset.case]||troubleCases.dns;
    detail.innerHTML=`<p class="eyebrow">Scenario ${c.num}</p><h3>${c.title}</h3><p>${c.sym}</p><ol>${c.steps.map(s=>`<li>${s}</li>`).join('')}</ol>`;
  }));
}
const archLayers={
  edge:[['01','Arris Modem','Public WAN enters the environment.'],['02','OPNsense','Routing, firewall policy, DHCP, DNS, VLAN interfaces, and WireGuard gateway control.'],['03','Managed Switch','Port-level VLAN separation for lab clients, servers, and Eero network experiments.']],
  virtualization:[['01','Proxmox Host','Laptop/server host with WAN and LAN bridges for OPNsense and service VMs.'],['02','OPNsense VM','Firewall VM controlling segmentation and tunnel policy.'],['03','Service VMs','Minecraft, Project Zomboid, and future hosted services can be isolated by VLAN.']],
  services:[['01','Portfolio','Public-facing project showcase and recruiter toolset.'],['02','Game Servers','Self-hosted workloads used to practice networking, Linux, and service operations.'],['03','Monitoring Notes','Status, topology, and troubleshooting documentation built into the portfolio.']],
  cad:[['01','STL Library','Downloadable models grouped by project.'],['02','3D Viewer','Self-contained canvas preview that works locally without external CDNs.'],['03','Revision Notes','Project cards explain constraints, materials, and next iteration goals.']]
};
function initArchitecture(){
  const stack=document.getElementById('archStack'); if(!stack) return;
  const render=key=>{ const rows=archLayers[key]||archLayers.edge; stack.innerHTML=rows.map(r=>`<article><span>${r[0]}</span><h3>${r[1]}</h3><p>${r[2]}</p></article>`).join(''); };
  document.querySelectorAll('.arch-pill').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.arch-pill').forEach(b=>b.classList.toggle('is-active',b===btn)); render(btn.dataset.layer);}));
}
function initSandboxButton(){
  document.getElementById('openSandbox')?.addEventListener('click',()=>{
    const open = !terminal?.classList.contains('is-open');
    if(open){ terminal?.classList.add('is-open'); terminal?.setAttribute('aria-hidden','false'); }
    termLine('sandbox ready. try: diagnose, architecture, troubleshoot, homelab, resume, theme purple.');
    setTimeout(()=>terminalInput?.focus(),60);
  });
}
window.addEventListener('load',()=>{ initSkillHeatmap(); initTroubleshooting(); initArchitecture(); initSandboxButton(); });


/* =========================================================
   v5.1 — Simulated Proxmox / OPNsense + game server telemetry
========================================================= */
const dashState={tick:0,view:'overview',gameFilter:'all',baseStarted:Date.now()-1000*60*60*24*14-1000*60*60*6,logs:[
  'dashboard booted in public-safe simulation mode',
  'loaded sanitized Proxmox + OPNsense + game server profile',
  'confirmed management interfaces are represented, not exposed'
]};
const dashVLANs=[
  {name:'MainLAN',cidr:'10.0.11.0/24',role:'trusted devices',state:'online'},
  {name:'Lab VLAN',cidr:'10.0.20.0/24',role:'portfolio demos',state:'online'},
  {name:'EeroLAN',cidr:'10.0.30.0/24',role:'Wi‑Fi clients',state:'online'},
  {name:'WG Services',cidr:'10.0.40.0/24',role:'game servers + Hetzner egress',state:'routed'}
];
const dashVMs=[
  {id:'100',name:'OPNsense',type:'Firewall VM',cpu:[8,15],mem:'2.4 / 4 GB',net:'WAN/LAN bridges'},
  {id:'110',name:'Minecraft',type:'Game server',cpu:[12,34],mem:'3.8 / 8 GB',net:'VLAN 40'},
  {id:'115',name:'Project Zomboid',type:'Game server',cpu:[10,28],mem:'2.6 / 6 GB',net:'VLAN 40'},
  {id:'120',name:'Portfolio Lab',type:'Demo services',cpu:[4,13],mem:'1.1 / 4 GB',net:'VLAN 20'},
  {id:'130',name:'Monitoring Notes',type:'Docs + status',cpu:[2,8],mem:'.7 / 2 GB',net:'MainLAN'}
];
const dashEvents=[
  ['pass','DHCP lease renewed','MainLAN client received 10.0.11.x address'],
  ['block','Default deny','Blocked inter-VLAN attempt from guest segment'],
  ['pass','WireGuard keepalive','wg0 handshake refreshed through Hetzner exit'],
  ['pass','Unbound query','DNS resolved for isolated VLAN client'],
  ['block','WAN unsolicited','Dropped inbound packet on WAN interface']
];
const gameServers=[
  {key:'minecraft',name:'Minecraft',icon:'⛏',vm:'VM 110',version:'Paper 1.21.x',map:'Bluemap ready',players:[2,11],tps:[19,20],ram:[42,62],net:[3,14],world:'Survival / plugins',route:'WAN → OPNsense NAT → VLAN 40 → Minecraft VM'},
  {key:'zomboid',name:'Project Zomboid',icon:'☣',vm:'VM 115',version:'Build 42 demo',map:'Knox County',players:[0,6],tps:[55,60],ram:[34,54],net:[1,8],world:'Co-op survival',route:'WAN → OPNsense NAT → VLAN 40 → Zomboid VM'}
];
const gameEventPool=[
  {game:'minecraft',level:'join',title:'Player joined',body:'Whitelisted player authenticated and entered survival world',tag:'AUTH'},
  {game:'minecraft',level:'system',title:'Bluemap render queue',body:'Chunk render worker processed updated regions for live map demo',tag:'MAP'},
  {game:'minecraft',level:'warn',title:'Mob spike normalized',body:'TPS dipped during entity burst, autoscaler policy held steady',tag:'TPS'},
  {game:'minecraft',level:'system',title:'Plugin heartbeat',body:'Fuelio and StorageHubs demo hooks reported healthy status',tag:'PLUGIN'},
  {game:'minecraft',level:'system',title:'Backup snapshot',body:'World save archived to scheduled local snapshot target',tag:'BACKUP'},
  {game:'zomboid',level:'join',title:'Survivor connected',body:'Co-op client joined the server through monitored service port',tag:'AUTH'},
  {game:'zomboid',level:'warn',title:'Cell load burst',body:'Map cell streaming increased CPU briefly near downtown zone',tag:'CPU'},
  {game:'zomboid',level:'system',title:'Server save complete',body:'Autosave completed and memory returned to normal range',tag:'SAVE'},
  {game:'zomboid',level:'system',title:'Workshop check',body:'Mod list validated against server profile before session start',tag:'MODS'},
  {game:'zomboid',level:'system',title:'Firewall rule matched',body:'Allowed game traffic on service alias, blocked unrelated scan noise',tag:'FW'}
];
function dashRand(min,max,phase=0){return Math.round(min+(max-min)*(0.5+0.5*Math.sin((dashState.tick+phase)/5)));}
function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text;}
function setBar(id,value){const el=document.getElementById(id);if(el)el.style.width=Math.max(2,Math.min(100,value))+'%';}
function metricBlock(label,value,bar){return `<div class="game-metric"><div class="game-metric-row"><small>${label}</small><strong>${value}</strong></div><div class="meter"><i style="width:${Math.max(2,Math.min(100,bar))}%"></i></div></div>`;}
function gameNow(server,idx=0){
  return {
    players:dashRand(server.players[0],server.players[1],idx*4),
    tps:dashRand(server.tps[0],server.tps[1],idx*5),
    ram:dashRand(server.ram[0],server.ram[1],idx*6),
    net:dashRand(server.net[0],server.net[1],idx*7)
  };
}
function renderDashStatic(){
  const vlan=document.getElementById('vlanList');
  if(vlan) vlan.innerHTML=dashVLANs.map(v=>`<div class="vlan-row"><span></span><span><strong>${v.name}</strong><small>${v.role}</small></span><code>${v.cidr}</code></div>`).join('');
  const table=document.getElementById('vmTable');
  if(table) table.innerHTML='<div class="vm-row vm-head"><span>ID</span><span>Name</span><span>Type</span><span>Memory</span><span>Network</span></div>'+dashVMs.map(vm=>`<div class="vm-row" data-vm="${vm.id}"><span>${vm.id}</span><span>${vm.name}</span><span>${vm.type}</span><span>${vm.mem}</span><span>${vm.net}</span></div>`).join('');
}
function renderDashEvents(){
  const feed=document.getElementById('eventFeed'); if(!feed) return;
  const rotated=dashEvents.map((_,i)=>dashEvents[(i+dashState.tick)%dashEvents.length]).slice(0,4);
  feed.innerHTML=rotated.map(([sev,title,body])=>`<div class="event-row" data-severity="${sev}"><small>${sev==='block'?'BLOCK':'PASS'} · just now</small><strong>${title}</strong><small>${body}</small></div>`).join('');
}
function renderGameServers(){
  const cards=document.getElementById('gameServerCards');
  if(cards){
    cards.innerHTML=gameServers.map((s,idx)=>{const m=gameNow(s,idx);return `<article class="game-server-card"><header><div><h5>${s.icon} ${s.name}</h5><p>${s.vm} · ${s.version}<br>${s.world}</p></div><span class="game-server-status">Online</span></header><div class="game-card-stats"><span><small>Players</small><strong>${m.players}/20</strong></span><span><small>${s.key==='minecraft'?'TPS':'FPS Tick'}</small><strong>${m.tps}</strong></span><span><small>Network</small><strong>${m.net} Mbps</strong></span></div></article>`;}).join('');
  }
  const mc=gameServers[0], mz=gameNow(mc,0), zom=gameServers[1], zz=gameNow(zom,1);
  const mcBox=document.getElementById('minecraftMetrics');
  if(mcBox) mcBox.innerHTML=metricBlock('Player Slots',`${mz.players}/20 online`,mz.players*5)+metricBlock('Server TPS',`${mz.tps}.0 / 20`,mz.tps*5)+metricBlock('RAM Allocation',`${mz.ram}%`,mz.ram)+metricBlock('Bluemap Queue',`${dashRand(2,18,9)} chunks`,dashRand(12,45,9));
  const zBox=document.getElementById('zomboidMetrics');
  if(zBox) zBox.innerHTML=metricBlock('Survivors',`${zz.players}/16 online`,zz.players*6)+metricBlock('Simulation Tick',`${zz.tps} fps`,Math.round(zz.tps/60*100))+metricBlock('RAM Allocation',`${zz.ram}%`,zz.ram)+metricBlock('Cell Load',`${dashRand(8,31,12)} active`,dashRand(22,58,12));
}
function renderGameEvents(){
  const feed=document.getElementById('gameEventFeed'); if(!feed) return;
  let selected=dashState.gameFilter;
  if(dashState.view==='minecraft') selected='minecraft';
  if(dashState.view==='zomboid') selected='zomboid';
  const pool=gameEventPool.filter(e=>selected==='all'||e.game===selected);
  const rows=Array.from({length:6},(_,i)=>pool[(i+dashState.tick)%pool.length]).filter(Boolean);
  feed.innerHTML=rows.map((e,i)=>`<div class="game-event" data-level="${e.level}"><em></em><span><strong>${e.title}</strong><small>${e.game==='minecraft'?'Minecraft':'Project Zomboid'} · ${e.body}</small></span><code>${e.tag} · ${i===0?'now':(i*2)+'m ago'}</code></div>`).join('');
  const title=document.getElementById('gameEventTitle'); if(title) title.textContent=selected==='minecraft'?'Minecraft events':selected==='zomboid'?'Project Zomboid events':'Game server events';
  document.querySelectorAll('.game-filter').forEach(b=>b.classList.toggle('is-active',b.dataset.gameFilter===dashState.gameFilter));
  const routeTitle=document.getElementById('gameRouteTitle'), routeText=document.getElementById('gameRouteText');
  if(routeTitle&&routeText){
    const active=gameServers.find(s=>s.key===selected);
    routeTitle.textContent=active?active.route:'VLAN 40 service segment';
    routeText.textContent=active?`${active.name} is shown as a public-safe simulation of service hosting, NAT/firewall policy, VM monitoring, and game operations.`:'Players reach game workloads through port-forward policy, firewall rules, and monitored VM resource limits.';
  }
}
function pushDashLog(line){dashState.logs.unshift(new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})+'  '+line);dashState.logs=dashState.logs.slice(0,8);const out=document.getElementById('dashConsole');if(out)out.innerHTML=dashState.logs.map(l=>`<div class="console-line">${l}</div>`).join('');}
function updateDashboardTelemetry(){
  if(!document.getElementById('live-dashboard')) return;
  dashState.tick++;
  const cpu=dashRand(12,31,1), mem=dashRand(38,53,8), disk=61, wan=dashRand(94,99,3);
  setText('dashClock','Live demo · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  setText('proxCpu',cpu+'%'); setText('proxMem',mem+'%'); setText('proxDisk',disk+'%');
  setBar('proxCpuBar',cpu); setBar('proxMemBar',mem); setBar('proxDiskBar',disk);
  const upMs=Date.now()-dashState.baseStarted; const days=Math.floor(upMs/86400000); const hrs=Math.floor(upMs%86400000/3600000); setText('proxUptime',`${days}d ${String(hrs).padStart(2,'0')}h`);
  setText('wanHealth',wan); const ring=document.getElementById('wanRing'); if(ring)ring.style.setProperty('--ring',wan+'%');
  setText('wgState', dashState.tick%9===0?'WireGuard: keepalive refreshed':'WireGuard: active');
  setText('dnsState', dashState.tick%7===0?'Unbound DNS checked on all VLAN interfaces':'Unbound DNS responding on VLANs');
  document.querySelectorAll('[data-vm]').forEach((row,idx)=>{const vm=dashVMs[idx]; if(!vm)return; const vmcpu=dashRand(vm.cpu[0],vm.cpu[1],idx*3); row.style.borderColor=vmcpu>28?'rgba(250,204,21,.38)':''; row.title=`Simulated CPU: ${vmcpu}%`;});
  renderDashEvents(); renderGameServers(); renderGameEvents();
  if(dashState.tick%4===0){const snippets=['sampled Proxmox node metrics','validated OPNsense VLAN gateway status','rotated firewall event feed','checked WireGuard route health','refreshed VM inventory snapshot','sampled Minecraft TPS and Bluemap queue','checked Project Zomboid cell load and autosave state'];pushDashLog(snippets[(dashState.tick/4)%snippets.length|0]);}
}
function setDashboardView(view){
  dashState.view=view||'overview';
  document.querySelectorAll('.dash-tab').forEach(b=>b.classList.toggle('is-active',b.dataset.dashView===dashState.view));
  document.querySelectorAll('[data-dash-card]').forEach(card=>{const views=(card.dataset.dashCard||'').split(' ');card.classList.toggle('is-hidden',!views.includes(dashState.view));});
  renderGameEvents();
}
function initLabDashboard(){
  if(!document.getElementById('live-dashboard'))return;
  renderDashStatic(); renderDashEvents(); renderGameServers(); renderGameEvents();
  setDashboardView('overview');
  document.querySelectorAll('.dash-tab').forEach(btn=>btn.addEventListener('click',()=>setDashboardView(btn.dataset.dashView)));
  document.querySelectorAll('.game-filter').forEach(btn=>btn.addEventListener('click',()=>{dashState.gameFilter=btn.dataset.gameFilter||'all';renderGameEvents();}));
  pushDashLog('started dashboard telemetry loop');
  updateDashboardTelemetry();
  setInterval(updateDashboardTelemetry,2400);
}
window.addEventListener('load',initLabDashboard);
