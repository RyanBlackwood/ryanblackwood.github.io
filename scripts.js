// Scroll Top
const scrollBtn = document.getElementById("scrollTop");
window.onscroll = () => {
  scrollBtn.style.display = document.documentElement.scrollTop > 200 ? "block" : "none";
  revealElements();
  animateSkills();
};

// Scroll to top
scrollBtn.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

// Reveal animations fallback
function revealElements(){
  const allReveals = document.querySelectorAll(".reveal");
  allReveals.forEach(el=>{
    if(!el.classList.contains("active")){
      const rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight - 50){
        const delay = el.dataset.delay || 0;
        el.style.transition = `all 0.8s ease ${delay}ms`;
        el.classList.add("active");
      }
    }
  });

  // Hero fade-up on load
  const heroIntro = document.querySelector(".hero .intro-text");
  const heroSub = document.querySelector(".hero-sub");
  const heroBtns = document.querySelector(".hero-buttons");

  [heroIntro, heroSub, heroBtns].forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("active");
    }, index * 200); // stagger by 200ms
  });
}

// Dark/Light Mode Toggle
const darkToggle = document.getElementById('darkModeToggle');
let lightMode = false;
function setTheme(isLight){
  document.body.classList.toggle('light',isLight);
  document.body.classList.toggle('dark',!isLight);
  darkToggle.textContent = isLight ? '🌞' : '🌙';
}
window.addEventListener('DOMContentLoaded', ()=> setTheme(lightMode));
darkToggle.addEventListener('click', ()=>{
  lightMode = !lightMode;
  setTheme(lightMode);
});

// Skills bar animation
function animateSkills(){
  document.querySelectorAll('.fill').forEach(el=>{
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 50){
      el.style.width = el.dataset.fill;
    }
  });
}

// On load
window.onload = () => {
  setTimeout(()=>{
    revealElements();
    animateSkills();
  }, 500);
};