/* ============================================
   TRANSITIONS.JS — Barba.js Page Transitions
   ============================================ */

const Transitions = (() => {

  function init() {
    if (typeof barba === 'undefined') return;

    barba.init({
      preventRunning: true,
      timeout: 10000,
      transitions: [{
        name: 'default-transition',

        // Sync: false means leave completes before enter starts
        sync: false,

        leave(data) {
          const sheet = document.getElementById('transition-sheet');
          const transName = document.getElementById('transition-name');

          // Get destination page name
          const nextNamespace = data.next.namespace || '';
          const pageName = nextNamespace.charAt(0).toUpperCase() + nextNamespace.slice(1);
          if (transName) transName.textContent = pageName;

          // Stop Lenis during transition
          SmoothScroll.stop();

          return new Promise(resolve => {
            const tl = gsap.timeline({
              onComplete: resolve
            });

            // Fade out current content
            tl.to(data.current.container, {
              opacity: 0,
              y: -30,
              duration: 0.4,
              ease: 'power2.in'
            });

            // Slide sheet up
            tl.to(sheet, {
              y: 0,
              duration: 0.8,
              ease: 'power3.inOut'
            }, '-=0.2');

            // Show page name
            tl.to(transName, {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out'
            }, '-=0.3');
          });
        },

        enter(data) {
          const sheet = document.getElementById('transition-sheet');
          const transName = document.getElementById('transition-name');

          return new Promise(resolve => {
            // Scroll to top
            window.scrollTo(0, 0);

            const tl = gsap.timeline({
              onComplete: () => {
                // Reset sheet for next transition
                gsap.set(sheet, { y: 'calc(100% + 60px)' });
                gsap.set(transName, { opacity: 0 });

                resolve();
              }
            });

            // Set initial state for new content
            gsap.set(data.next.container, { opacity: 0, y: 30 });

            // Hide page name
            tl.to(transName, {
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in'
            });

            // Slide sheet away
            tl.to(sheet, {
              y: '-100%',
              duration: 0.8,
              ease: 'power3.inOut'
            }, '-=0.1');

            // Fade in new content
            tl.to(data.next.container, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out'
            }, '-=0.4');
          });
        },

        afterEnter(data) {
          // Reinitialize all modules for new page
          reinitialize();
        }
      }]
    });
  }

  function reinitialize() {
    // Refresh ScrollTrigger
    ScrollTrigger.refresh();

    // Restart Lenis
    SmoothScroll.destroy();
    SmoothScroll.init();

    // Rebind cursor
    Cursor.rebind();

    // Rebind magnetic
    Magnetic.rebind();

    // Refresh animations
    Animations.refresh();

    // Re-init Three.js if hero exists, or fully destroy it if not
    if (document.getElementById('hero-canvas-container')) {
      ThreeBg.destroy();
      ThreeBg.init();
    } else {
      ThreeBg.destroy();
    }
  }

  return { init, reinitialize };
})();
