/* ============================================
   CURSOR.JS — High-Performance GPU-Accelerated Custom Cursor
   Uses Linear Interpolation (LERP) + requestAnimationFrame
   ============================================ */

const Cursor = (() => {
  let cursor;
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let isVisible = false;
  let rafId = null;

  // LERP factor — lower = smoother/laggier, higher = snappier
  const LERP_FACTOR = 0.15;

  // Check for touch device
  const isTouchDevice = () => {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  };

  function init() {
    if (isTouchDevice()) return;

    cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', () => { isVisible = true; updateVisibility(); });
    document.addEventListener('mouseleave', () => { isVisible = false; updateVisibility(); });

    bindHoverEvents();

    // Start the LERP animation loop
    rafId = requestAnimationFrame(renderCursor);
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
  }

  function renderCursor() {
    if (isVisible && cursor) {
      // LERP: smoothly interpolate cursor position toward mouse
      cursorX += (mouseX - cursorX) * LERP_FACTOR;
      cursorY += (mouseY - cursorY) * LERP_FACTOR;

      // GPU-accelerated transform — no layout thrashing
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

      // Dynamic hover check on every frame to prevent stuck states during scroll
      const el = document.elementFromPoint(mouseX, mouseY);
      if (el) {
        const interactive = el.closest('a, button, .magnetic, input, textarea, [data-cursor]');
        if (interactive) {
          const cursorType = interactive.getAttribute('data-cursor');
          if (cursorType) {
            cursor.classList.add('is-project');
            cursor.classList.remove('is-link');
            const cursorText = cursor.querySelector('.cursor-text');
            if (cursorText) cursorText.textContent = cursorType;
          } else {
            cursor.classList.add('is-link');
            cursor.classList.remove('is-project');
          }
        } else {
          cursor.classList.remove('is-link', 'is-project');
        }
      } else {
        cursor.classList.remove('is-link', 'is-project');
      }
    }

    rafId = requestAnimationFrame(renderCursor);
  }

  function bindHoverEvents() {
    // Links, buttons — expand cursor on hover
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, input, textarea, [data-cursor]');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!cursor) return;
        const cursorType = el.getAttribute('data-cursor');
        if (cursorType) {
          cursor.classList.add('is-project');
          cursor.classList.remove('is-link');
          const cursorText = cursor.querySelector('.cursor-text');
          if (cursorText) cursorText.textContent = cursorType;
        } else {
          cursor.classList.add('is-link');
          cursor.classList.remove('is-project');
        }
      });

      el.addEventListener('mouseleave', () => {
        if (!cursor) return;
        cursor.classList.remove('is-link', 'is-project');
      });
    });
  }

  function rebind() {
    bindHoverEvents();
  }

  function destroy() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    document.removeEventListener('mousemove', onMouseMove);
  }

  return { init, rebind, destroy };
})();
