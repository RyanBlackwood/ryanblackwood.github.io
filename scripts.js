document.addEventListener("DOMContentLoaded", () => {

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");
const underline = document.getElementById("tabUnderline");
const toggleBtn = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");
const body = document.body;

/* MOVE UNDERLINE */
function moveUnderline(el) {
  underline.style.width = el.offsetWidth + "px";
  underline.style.left = el.offsetLeft + "px";
}

/* CLICK NAV WITH HEADER OFFSET */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const section = document.getElementById(tab.dataset.target);
    const headerOffset = document.querySelector(".header").offsetHeight + 10; // 10px padding
    const elementPosition = section.offsetTop;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    moveUnderline(tab);
  });
});

/* SCROLL ACTIVE TAB WITH HEADER OFFSET */
window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - document.querySelector(".header").offsetHeight - 15;
    if (scrollY >= sectionTop) {
      current = section.id;
    }
  });

  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.dataset.target === current) {
      tab.classList.add("active");
      moveUnderline(tab);
    }
  });
});

/* INITIAL UNDERLINE */
moveUnderline(tabs[0]);
tabs[0].classList.add("active");

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

/* TYPING TEXT */
const text = "Engineer | Mechanic | Tinkerer";
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

function reveal() {
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
}
window.addEventListener("scroll", reveal);
reveal();

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