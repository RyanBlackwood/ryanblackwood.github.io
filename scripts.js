// Scroll button
const scrollBtn=document.getElementById("scrollTop");
window.onscroll=function(){
  scrollBtn.style.display=document.documentElement.scrollTop>200?"block":"none";
  revealFallback();
  animateSkills();
};

// Scroll-to-top
scrollBtn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

// AOS init
let aosLoaded=false;
function initAOS(){
  if(typeof AOS!=="undefined"){AOS.init({duration:800,once:true}); aosLoaded=true; AOS.refresh();}
}

// Fallback reveal
function revealFallback(){
  document.querySelectorAll(".reveal").forEach(el=>{
    if(!el.classList.contains("active")){
      const rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight-50) el.classList.add("active");
    }
  });
}

// Dark / Light Mode Toggle
const darkToggle=document.getElementById('darkModeToggle');
let lightMode=false;
function setTheme(isLight){
  document.body.classList.toggle('light',isLight);
  document.body.classList.toggle('dark',!isLight);
  darkToggle.textContent=isLight?'🌞':'🌙';
}
setTheme(lightMode);
darkToggle.onclick=()=>{lightMode=!lightMode; setTheme(lightMode);}

// Skills animation
function animateSkills(){
  document.querySelectorAll('.fill').forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(rect.top<window.innerHeight-50) el.style.width=el.dataset.fill;
  });
}

// On load
window.onload=()=>{
  initAOS();
  setTimeout(()=>{
    revealFallback();
    animateSkills();
    if(typeof AOS!=="undefined") AOS.refresh();
  },2600);
};