const heroMark = document.getElementById('heroMark');
const heroLabs = document.getElementById('heroLabs');
const siteNav = document.getElementById('siteNav');
const heroSection = document.getElementById('top');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lock hero height to the real, current viewport height in px.
// Prevents leftover whitespace on mobile where the address bar
// shows/hides and changes what 1vh actually means mid-scroll.
function setHeroHeight(){
  const vh = window.innerHeight;
  heroSection.style.height = (vh * 2.2) + 'px';
}
setHeroHeight();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setHeroHeight, 150);
});
window.addEventListener('orientationchange', setHeroHeight);

function onScroll(){
  const heroHeight = heroSection.offsetHeight;
  const viewportH = window.innerHeight;
  const scrollable = heroHeight - viewportH;
  const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

  if(!reduceMotion){
    // labs reveal: 0 -> 0.4
    const labsProgress = Math.min(progress / 0.4, 1);
    heroLabs.style.opacity = labsProgress;
    heroLabs.style.transform = `translateY(${24 * (1 - labsProgress)}px)`;

    // fall-back parallax: 0.35 -> 1
    const fallStart = 0.35;
    const fallProgress = Math.min(Math.max((progress - fallStart) / (1 - fallStart), 0), 1);
    const scale = 1 - fallProgress * 0.32;
    const translateY = fallProgress * -60;
    const blur = fallProgress * 6;
    const opacity = 1 - fallProgress * 0.85;
    heroMark.style.transform = `translateY(${translateY}px) scale(${scale})`;
    heroMark.style.filter = `blur(${blur}px)`;
    heroMark.style.opacity = opacity;
  }

  // nav visibility
  if(progress > 0.85){
    siteNav.classList.add('is-visible');
  } else {
    siteNav.classList.remove('is-visible');
  }
}

let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    window.requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
}, { passive: true });

onScroll();

// ---- Fast scroll-to-section for nav links ----
function fastScrollTo(targetY, duration){
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutQuad(t){
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(now){
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(t));
    if(t < 1){
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(!target) return;
    e.preventDefault();

    const navOffset = id === 'top' ? 0 : (document.getElementById('siteNav').offsetHeight + 34);
    const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;

    // duration scales a bit with distance but stays snappy
    const distance = Math.abs(targetY - window.scrollY);
    const duration = reduceMotion ? 0 : Math.min(700, Math.max(350, distance / 3));

    if(reduceMotion){
      window.scrollTo(0, targetY);
    } else {
      fastScrollTo(targetY, duration);
    }
  });
});

// keep nav visible once user scrolls into content, even scrolling back up a bit within content
const homeSection = document.getElementById('home');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      siteNav.classList.add('is-visible');
    }
  });
}, { rootMargin: '-10% 0px -85% 0px' });
navObserver.observe(homeSection);