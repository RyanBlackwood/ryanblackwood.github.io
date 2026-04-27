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

  particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.6,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const theme = html.getAttribute("data-theme");
  ctx.fillStyle = theme === "dark"
    ? "rgba(26, 167, 255, 0.65)"
    : "rgba(26, 167, 255, 0.28)";

  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();