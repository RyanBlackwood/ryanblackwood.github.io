const tabs = document.querySelectorAll(".tab");
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

/* SCROLL NAV */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = document.getElementById(tab.dataset.target);

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

/* THEME TOGGLE */
let isDark = true;

toggleBtn.addEventListener("click", () => {
  if (isDark) {
    body.classList.replace("dark", "light");
    toggleBtn.textContent = "☀️";
  } else {
    body.classList.replace("light", "dark");
    toggleBtn.textContent = "🌙";
  }

  isDark = !isDark;
});

/* PARTICLES */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particlesArray = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--glow');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 120; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();