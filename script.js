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
const sections = tabs.map(tab => ({ tab, section: document.querySelector(tab.getAttribute('href')) })).filter(x => x.section);
function setActiveTab(tab) { tabs.forEach(t => t.classList.toggle('is-active', t === tab)); }
function updateActiveTab() {
  let current = sections[0];
  sections.forEach(item => { if (item.section.getBoundingClientRect().top <= innerHeight * .36) current = item; });
  if (current) setActiveTab(current.tab);
}
window.addEventListener('scroll', updateActiveTab, { passive: true });
tabs.forEach(tab => tab.addEventListener('click', () => setActiveTab(tab)));
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
  homelab: 'Open homelab project details',
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
  if (cmd === 'sections') return termLine('sections: summary, about, education, work, skills, projects, mechanical, contact');
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

  if (cmd === 'homelab') {
    filterProjects('infrastructure', 'infrastructure');
    const homelab = document.querySelector('.project-card.featured');
    setCardOpen(homelab, true);
    termLine('homelab command center expanded.');
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
