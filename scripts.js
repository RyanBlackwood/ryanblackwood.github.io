const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

function setTheme(mode) {
  if (mode === "light") {
    root.classList.add("light");
    localStorage.setItem("portfolio-theme", "light");
    toggle.textContent = "☀";
  } else {
    root.classList.remove("light");
    localStorage.setItem("portfolio-theme", "dark");
    toggle.textContent = "☾";
  }
}

// Initialize correctly
(function initTheme() {
  const saved = localStorage.getItem("portfolio-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  if (saved === "light" || (!saved && prefersLight)) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
})();

// Toggle handler
toggle.addEventListener("click", () => {
  const isLight = root.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});