// Scroll button
const scrollBtn = document.getElementById("scrollTop");

window.onscroll = function () {
  scrollBtn.style.display =
    document.documentElement.scrollTop > 200 ? "block" : "none";

  revealFallback();
};

scrollBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// AOS safe init
let aosLoaded = false;
if (typeof AOS !== "undefined") {
  AOS.init({ duration: 800, once: true });
  aosLoaded = true;
}

// Fallback animation
function revealFallback() {
  if (aosLoaded) return;

  document.querySelectorAll(".reveal").forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.onload = () => {
  revealFallback();
};