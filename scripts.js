// Scroll button
const scrollBtn = document.getElementById("scrollTop");

window.onscroll = function () {
  scrollBtn.style.display =
    document.documentElement.scrollTop > 200 ? "block" : "none";
};

scrollBtn.onclick = function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Initialize animations
AOS.init({
  duration: 800,
  once: true
});