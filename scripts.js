const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
  themeToggle.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "☀" : "☾";
});