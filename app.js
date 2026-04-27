const html = document.documentElement;
const button = document.getElementById("themeToggle");

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

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particleCount = window.innerWidth < 700 ? 45 : 85;

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.1 + 0.45,
    dx: (Math.random() - 0.5) * 0.38,
    dy: (Math.random() - 0.5) * 0.38,
    alpha: Math.random() * 0.45 + 0.18
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const theme = html.getAttribute("data-theme");
  const dotColor =
    theme === "dark"
      ? "rgba(26, 167, 255,"
      : "rgba(26, 167, 255,";

  particles.forEach((p, index) => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `${dotColor} ${theme === "dark" ? p.alpha : p.alpha * 0.42})`;
    ctx.fill();

    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const distance = Math.hypot(p.x - p2.x, p.y - p2.y);

      if (distance < 120) {
        const lineAlpha = (1 - distance / 120) * (theme === "dark" ? 0.18 : 0.07);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(26, 167, 255, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawParticles();

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.14
  }
);

revealItems.forEach(item => observer.observe(item));