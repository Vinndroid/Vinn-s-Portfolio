/* ============================================
   MAGNETIC.JS — Magnetic Hover Effect
   ============================================ */

const Magnetic = (() => {

  function init() {
    const elements = document.querySelectorAll('[data-magnetic]');
    elements.forEach(el => bindMagnetic(el));
  }

  function bindMagnetic(el) {
    const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.3;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  }

  function rebind() {
    init();
  }

  return { init, rebind };
})();
