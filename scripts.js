document.addEventListener("DOMContentLoaded", () => {

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");
const toggleBtn = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");
const body = document.body;

/* SCROLL NAV */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.getElementById(tab.dataset.target)
      .scrollIntoView({ behavior: "smooth" });
  });
});

/* ACTIVE TAB ON SCROLL */
window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (scrollY >= top) current = section.id;
  });

  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.dataset.target === current) {
      tab.classList.add("active");
    }
  });
});

/* THEME TOGGLE */
let isDark = true;

toggleBtn.addEventListener("click", () => {
  icon.classList.add("icon-animate");

  setTimeout(() => {
    if (isDark) {
      body.classList.replace("dark", "light");
      icon.textContent = "☀️";
    } else {
      body.classList.replace("light", "dark");
      icon.textContent = "🌙";
    }
    isDark = !isDark;
    icon.classList.remove("icon-animate");
  }, 200);
});

/* TYPING EFFECT */
const text = "Network Engineer | Homelab Architect | Systems Builder";
let i = 0;
function type() {
  if (i < text.length) {
    document.getElementById("subtitle").textContent += text.charAt(i);
    i++;
    setTimeout(type, 40);
  }
}
type();

/* SCROLL REVEAL */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
}
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* PARTICLES */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2;
    this.dx = (Math.random() - 0.5) * 0.3;
    this.dy = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw() {
    ctx.fillStyle = getComputedStyle(body).getPropertyValue('--glow');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  for (let i = 0; i < 120; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

initParticles();
animate();

});