/* ============================================
   CURSOR.JS — Custom Dynamic Cursor
   ============================================ */

const Cursor = (() => {
  let cursor, cursorDot;
  let mouseX = 0, mouseY = 0;
  let isVisible = false;
  let cursorXTo, cursorYTo;
  let dotXTo, dotYTo;

  // Check for touch device
  const isTouchDevice = () => {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  };

  function init() {
    if (isTouchDevice()) return;

    cursor = document.getElementById('cursor');
    cursorDot = document.getElementById('cursor-dot');

    if (!cursor || !cursorDot) return;

    // Initialize GSAP quickTo setters for ultra-smooth performance
    cursorXTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power2.out" });
    cursorYTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power2.out" });
    dotXTo = gsap.quickTo(cursorDot, "x", { duration: 0.15, ease: "power2.out" });
    dotYTo = gsap.quickTo(cursorDot, "y", { duration: 0.15, ease: "power2.out" });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', () => { isVisible = true; updateVisibility(); });
    document.addEventListener('mouseleave', () => { isVisible = false; updateVisibility(); });

    bindHoverEvents();

    // Use GSAP ticker for continuous updates on every frame (glued to mouse on scroll)
    gsap.ticker.add(tick);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      updateVisibility();
    }
  }

  function updateVisibility() {
    if (cursor) cursor.style.opacity = isVisible ? '1' : '0';
    if (cursorDot) cursorDot.style.opacity = isVisible ? '1' : '0';
  }

  function tick() {
    if (!isVisible) return;

    // Continuously update position centering the cursor
    if (cursor) {
      cursorXTo(mouseX - cursor.offsetWidth / 2);
      cursorYTo(mouseY - cursor.offsetHeight / 2);
    }
    if (cursorDot) {
      dotXTo(mouseX - cursorDot.offsetWidth / 2);
      dotYTo(mouseY - cursorDot.offsetHeight / 2);
    }

    // Dynamic hover check on scroll / tick to prevent getting stuck
    const el = document.elementFromPoint(mouseX, mouseY);
    if (el) {
      const interactive = el.closest('a, button, .magnetic, input, textarea, [data-cursor]');
      if (interactive) {
        const cursorType = interactive.getAttribute('data-cursor');
        if (cursorType) {
          cursor.classList.add('is-project');
          const cursorText = cursor.querySelector('.cursor-text');
          if (cursorText) cursorText.textContent = cursorType;
        } else {
          cursor.classList.add('is-link');
        }
      } else {
        cursor.classList.remove('is-link', 'is-project');
      }
    } else {
      cursor.classList.remove('is-link', 'is-project');
    }
  }

  function bindHoverEvents() {
    // Links, buttons — expand cursor
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, input, textarea, [data-cursor]');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const cursorType = el.getAttribute('data-cursor');
        if (cursorType) {
          cursor.classList.add('is-project');
          const cursorText = cursor.querySelector('.cursor-text');
          if (cursorText) cursorText.textContent = cursorType;
        } else {
          cursor.classList.add('is-link');
        }
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-link', 'is-project');
      });
    });
  }

  function rebind() {
    bindHoverEvents();
  }

  function destroy() {
    gsap.ticker.remove(tick);
    document.removeEventListener('mousemove', onMouseMove);
  }

  return { init, rebind, destroy };
})();
