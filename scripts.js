const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function updateThemeButton() {
  const isLight = root.classList.contains("light");
  themeToggle.textContent = isLight ? "☀" : "☾";
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark theme" : "Switch to light theme"
  );
}

function setTheme(theme) {
  if (theme === "light") {
    root.classList.add("light");
    localStorage.setItem("portfolio-theme", "light");
  } else {
    root.classList.remove("light");
    localStorage.setItem("portfolio-theme", "dark");
  }

  updateThemeButton();
}

function initTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "light") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}

themeToggle.addEventListener("click", () => {
  const isLight = root.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

initTheme();