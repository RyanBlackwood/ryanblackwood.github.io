const html = document.documentElement;
const button = document.getElementById("themeToggle");

/* =========================
   THEME TOGGLE
========================= */

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("portfolio-theme", theme);

  button.textContent = theme === "dark" ? "☀️" : "🌙";

  button.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
applyTheme(savedTheme);

button.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

/* =========================
   BACKGROUND PARTICLES
========================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const particleCount = window.innerWidth < 700 ? 45 : 90;

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.2 + 0.45,
    dx: (Math.random() - 0.5) * 0.38,
    dy: (Math.random() - 0.5) * 0.38,
    alpha: Math.random() * 0.45 + 0.18
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const theme = html.getAttribute("data-theme");
  const dotAlphaMultiplier = theme === "dark" ? 1 : 0.36;
  const lineAlphaMultiplier = theme === "dark" ? 1 : 0.36;

  particles.forEach((p, index) => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(26, 167, 255, ${p.alpha * dotAlphaMultiplier})`;
    ctx.fill();

    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const distance = Math.hypot(p.x - p2.x, p.y - p2.y);

      if (distance < 120) {
        const lineAlpha = (1 - distance / 120) * 0.18 * lineAlphaMultiplier;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(26, 167, 255, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  animationFrameId = requestAnimationFrame(drawParticles);
}

function startParticles() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  resizeCanvas();
  drawParticles();
}

window.addEventListener("resize", resizeCanvas);
startParticles();

/* =========================
   REVEAL + SKILL FILL
========================= */

const revealItems = document.querySelectorAll(".reveal");
const skillBars = document.querySelectorAll(".skill-bar");

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.16
  }
);

revealItems.forEach(item => revealObserver.observe(item));
skillBars.forEach(bar => revealObserver.observe(bar));

/* =========================
   HEADER GLASS MORPH ON SCROLL
========================= */

const topbar = document.querySelector(".topbar");

function updateHeaderState() {
  if (!topbar) return;

  if (window.scrollY > 24) {
    topbar.classList.add("scrolled");
  } else {
    topbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

/* =========================
   ACTIVE TAB + UNDERLINE TRACKER
========================= */

const tabs = document.querySelector(".tabs");
const tabLinks = document.querySelectorAll(".tabs a");

let tabIndicator = null;

if (tabs) {
  tabIndicator = document.createElement("span");
  tabIndicator.className = "tab-indicator";
  tabs.prepend(tabIndicator);
}

function moveTabIndicator(target) {
  if (!tabs || !tabIndicator || !target) return;

  const tabsRect = tabs.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const left = targetRect.left - tabsRect.left + tabs.scrollLeft;

  tabIndicator.style.width = `${targetRect.width}px`;
  tabIndicator.style.transform = `translateX(${left}px)`;
  tabIndicator.style.opacity = "1";
}

function setActiveTab(target) {
  tabLinks.forEach(link => link.classList.remove("active"));

  if (target) {
    target.classList.add("active");
    moveTabIndicator(target);
  }
}

tabLinks.forEach(link => {
  link.addEventListener("mouseenter", () => moveTabIndicator(link));

  link.addEventListener("click", () => {
    setActiveTab(link);
  });
});

if (tabs) {
  tabs.addEventListener("mouseleave", () => {
    const active = document.querySelector(".tabs a.active");
    if (active) moveTabIndicator(active);
  });
}

const sectionLinks = [...tabLinks]
  .map(link => {
    const id = link.getAttribute("href");
    const section = document.querySelector(id);
    return section ? { link, section } : null;
  })
  .filter(Boolean);

function updateActiveSection() {
  let current = sectionLinks[0];

  sectionLinks.forEach(item => {
    const rect = item.section.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.35) {
      current = item;
    }
  });

  if (current) {
    setActiveTab(current.link);
  }
}

window.addEventListener("scroll", updateActiveSection, { passive: true });

window.addEventListener("resize", () => {
  const active = document.querySelector(".tabs a.active") || tabLinks[0];
  moveTabIndicator(active);
});

setTimeout(() => {
  updateActiveSection();
  moveTabIndicator(document.querySelector(".tabs a.active") || tabLinks[0]);
}, 100);

/* =========================
   CURSOR LIGHTING FOR PANELS
========================= */

const glowTargets = document.querySelectorAll(".panel, .hero-copy");

glowTargets.forEach(target => {
  target.addEventListener("mousemove", event => {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    target.style.setProperty("--mx", `${x}px`);
    target.style.setProperty("--my", `${y}px`);
  });
});

/* =========================
   PROJECT EXPLORER
========================= */

const projectFilters = document.querySelectorAll(".project-filter");
const projectItems = document.querySelectorAll(".project-item");
const projectStageTop = document.querySelector(".project-stage-top");

function getVisibleProjects() {
  return [...projectItems].filter(item => !item.classList.contains("hidden"));
}

function getOpenProjectName() {
  const openProject = document.querySelector(".project-item.open:not(.hidden)");
  return openProject
    ? openProject.querySelector(".project-summary strong")?.textContent || "Project selected"
    : "No project selected";
}

function updateProjectCounter() {
  const visibleProjects = getVisibleProjects();
  const openName = getOpenProjectName();

  if (projectStageTop) {
    projectStageTop.innerHTML = `
      <span>${visibleProjects.length} project${visibleProjects.length === 1 ? "" : "s"} visible</span>
      <span>${openName}</span>
    `;
  }
}

function openProject(item) {
  projectItems.forEach(project => {
    if (project !== item) project.classList.remove("open");
  });

  item.classList.add("open");
  updateProjectCounter();
}

projectItems.forEach(item => {
  const summary = item.querySelector(".project-summary");

  summary?.addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");

    projectItems.forEach(project => {
      if (project !== item) project.classList.remove("open");
    });

    item.classList.toggle("open", !wasOpen);
    updateProjectCounter();
  });

  item.addEventListener("mousemove", event => {
    const rect = item.getBoundingClientRect();

    item.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    item.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  });
});

function updateFilterCounts() {
  projectFilters.forEach(filter => {
    const category = filter.dataset.filter;
    const count = category === "all"
      ? projectItems.length
      : [...projectItems].filter(item => item.dataset.category === category).length;

    const countSlot = filter.querySelector("strong");
    if (countSlot) countSlot.textContent = String(count).padStart(2, "0");
  });
}

projectFilters.forEach(filter => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;

    projectFilters.forEach(btn => btn.classList.remove("active"));
    filter.classList.add("active");

    projectItems.forEach(item => {
      const matches = category === "all" || item.dataset.category === category;
      item.classList.toggle("hidden", !matches);

      if (!matches) {
        item.classList.remove("open");
      }
    });

    const firstVisible = getVisibleProjects()[0];

    projectItems.forEach(item => item.classList.remove("open"));

    if (firstVisible) {
      openProject(firstVisible);
    } else {
      updateProjectCounter();
    }
  });
});

updateFilterCounts();
updateProjectCounter();

/* =========================
   GLASS MORPH PANELS ON SCROLL
========================= */

const panels = document.querySelectorAll(".panel");

function updatePanelMorph() {
  const triggerLine = window.innerHeight * 0.48;

  panels.forEach(panel => {
    const rect = panel.getBoundingClientRect();
    const panelCenter = rect.top + rect.height / 2;
    const distance = Math.abs(triggerLine - panelCenter);

    if (distance < window.innerHeight * 0.32) {
      panel.classList.add("morph");
    } else {
      panel.classList.remove("morph");
    }
  });
}

window.addEventListener("scroll", updatePanelMorph, { passive: true });
window.addEventListener("resize", updatePanelMorph);
updatePanelMorph();

/* =========================
   MAGNETIC BUTTONS
========================= */

const magneticItems = document.querySelectorAll(
  ".btn, .theme-toggle, .project-filter"
);

magneticItems.forEach(item => {
  item.addEventListener("mousemove", event => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    item.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});
