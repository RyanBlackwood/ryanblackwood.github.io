document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("themeToggle");
  const html = document.documentElement;

  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    html.setAttribute("data-theme", savedTheme);
  } else {
    html.setAttribute("data-theme", "dark");
  }

  updateButton();

  button.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);

    updateButton();
  });

  function updateButton() {
    const currentTheme = html.getAttribute("data-theme");
    button.textContent = currentTheme === "dark" ? "Light" : "Dark";
  }
});