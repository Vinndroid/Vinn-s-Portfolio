/* ============================================
   SMOOTH-SCROLL.JS — Lenis Smooth Scrolling
   ============================================ */

const SmoothScroll = (() => {
  let lenis = null;

  function init() {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.07,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  function scrollTo(target, options = {}) {
    if (lenis) {
      lenis.scrollTo(target, options);
    }
  }

  function stop() {
    if (lenis) lenis.stop();
  }

  function start() {
    if (lenis) lenis.start();
  }

  function destroy() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
  }

  function getInstance() {
    return lenis;
  }

  return { init, scrollTo, stop, start, destroy, getInstance };
})();
