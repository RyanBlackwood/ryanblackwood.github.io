const body = document.body;
const toggleBtn = document.getElementById("themeToggle");
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

/* DEFAULT THEME */
let currentTheme = "dark";
body.classList.add("dark");

/* THEME TOGGLE */
toggleBtn.addEventListener("click", () => {
  if (currentTheme === "dark") {
    body.classList.replace("dark", "light");
    toggleBtn.textContent = "☀️";
    currentTheme = "light";
  } else {
    body.classList.replace("light", "dark");
    toggleBtn.textContent = "🌙";
    currentTheme = "dark";
  }
});

/* TAB SWITCHING */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    /* remove active */
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    /* activate clicked */
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});