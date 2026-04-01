// Scroll button
const scrollBtn = document.getElementById("scrollTop");
window.onscroll = function(){
  scrollBtn.style.display = document.documentElement.scrollTop > 200 ? "block":"none";
  revealFallback();
  if(window.scrollY>50) document.body.classList.add('scrolled');
};

// Scroll-to-top
scrollBtn.onclick = () => window.scrollTo({top:0, behavior:'smooth'});

// AOS init
let aosLoaded=false;
function initAOS(){
  if(typeof AOS!=="undefined"){AOS.init({duration:800,once:true}); aosLoaded=true; AOS.refresh();}
}

// Fallback reveal
function revealFallback(){
  document.querySelectorAll('.reveal').forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(rect.top<window.innerHeight-100) el.classList.add('active');
  });
}

// Dark Mode
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.onclick = () => document.body.classList.toggle('light');

// Skills animation
function animateSkills(){
  document.querySelectorAll('.fill').forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(rect.top<window.innerHeight-50) el.style.width=el.dataset.fill;
  });
}

window.addEventListener('scroll', animateSkills);

window.onload = () => {
  initAOS();
  revealFallback();
  animateSkills();
  // Fade hero in after intro
  const hero=document.querySelector('.hero');
  setTimeout(()=>{hero.style.opacity=1;},2500);
};