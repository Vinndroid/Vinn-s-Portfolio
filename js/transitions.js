/* ============================================
   TRANSITIONS.JS — Dual-System Page Transitions
   ============================================
   
   SYSTEM 1: Terminal Preloader (handled in app.js)
     - Only runs on first visit to index.html
     - Uses #terminal-loader container at z-index: 99999
   
   SYSTEM 2: Page Transition Curtain (this file)
     - .page-transition-overlay at z-index: 9999
     - CSS DEFAULT state: translateY(0) — covering the screen
     - On EVERY page load: JS slides it UP and OUT (translateY(-100%)),
       then silently resets it to translateY(100%) ("armed" state).
     - On index.html first load: the curtain slides out invisibly
       UNDERNEATH the terminal preloader (which is at z-index: 99999).
     - On nav link click: slides UP from bottom to cover, then navigates.
   ============================================ */

const Transitions = (() => {

  /* Key used in sessionStorage to signal a curtain-based navigation */
  const TRANSITION_KEY = 'page-transitioning';
  const TRANSITION_TEXT_KEY = 'page-transition-text';

  function init() {
    const overlay = document.querySelector('.page-transition-overlay');
    const title = document.querySelector('.page-transition-title');

    if (!overlay) return;

    // ─── ON EVERY PAGE LOAD ───
    // The curtain's CSS default is translateY(0) (covering the screen).
    // This means content is ALWAYS hidden on raw page load — no flicker.
    //
    // If we arrived via a nav-click, update the title text first.
    // Then, on ALL pages (whether nav-click or fresh load), slide the
    // curtain UP and OUT, then arm it at the bottom for the next click.

    const arrivedViaTransition = sessionStorage.getItem(TRANSITION_KEY);

    if (arrivedViaTransition) {
      // Update title to the destination page text stored before navigation
      const transitionText = sessionStorage.getItem(TRANSITION_TEXT_KEY);
      if (title && transitionText) {
        title.textContent = transitionText;
      }

      // Clear the flags immediately
      sessionStorage.removeItem(TRANSITION_KEY);
      sessionStorage.removeItem(TRANSITION_TEXT_KEY);
    }

    // ─── SLIDE THE CURTAIN UP AND OUT (every page load) ───
    // The overlay is at translateY(0) (covering screen) via CSS default.
    // On index.html first load, this animation happens invisibly under
    // the terminal preloader (z-index 99999 > 9999), keeping it clean.

    // Ensure the curtain is in covering position with no transition artifacts
    overlay.style.transition = 'none';
    overlay.classList.remove('is-exiting', 'is-entering', 'is-armed');
    // Force style: translateY(0) from base CSS
    overlay.offsetHeight; // force reflow

    // Re-enable the transition
    overlay.style.transition = '';

    // Use rAF to ensure the transition is picked up by the browser
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Slide UP and OUT
        overlay.classList.add('is-exiting');

        // After exit animation completes, silently reset to armed position
        const handleExitEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          overlay.removeEventListener('transitionend', handleExitEnd);

          // Instantly snap to armed position (hidden below viewport)
          overlay.style.transition = 'none';
          overlay.classList.remove('is-exiting');
          overlay.classList.add('is-armed');
          overlay.offsetHeight; // force reflow
          overlay.style.transition = '';
        };

        overlay.addEventListener('transitionend', handleExitEnd);
      });
    });

    // ─── INTERCEPT NAV CLICKS: Trigger the curtain slide-up before navigating ───
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip external links, hashes-only, mailto, tel, target=_blank
      if (
        href.startsWith('#') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        link.getAttribute('target') === '_blank' ||
        href.includes('//')
      ) {
        return;
      }

      // Skip same-page hash navigation
      const currentNamespace = document.querySelector('main')?.getAttribute('data-barba-namespace') || '';

      if (href.includes('#')) {
        const parts = href.split('#');
        const page = parts[0];
        if ((page === 'index.html' || page === '/' || page === '') && currentNamespace === 'home') {
          return;
        }
        if (page === 'about.html' && currentNamespace === 'about') {
          return;
        }
      }

      e.preventDefault();

      // Determine the transition text from the clicked link
      let text = '';
      if (link.classList.contains('nav-logo') || link.querySelector('.logo-name')) {
        text = 'Home';
      } else {
        text = link.textContent.trim();
      }

      // Clean up arrows/special characters
      text = text.replace(/→|↗|←|↑|↓/g, '').trim();

      // Fallback names based on href
      if (!text) {
        if (href.includes('index.html')) text = 'Home';
        else if (href.includes('about.html')) text = 'About';
        else if (href.includes('project.html')) text = 'Projects';
        else text = 'Loading';
      }

      // Update the overlay title
      if (title) {
        title.textContent = text;
      }

      // Store transition flag + text for the destination page
      sessionStorage.setItem(TRANSITION_KEY, 'true');
      sessionStorage.setItem(TRANSITION_TEXT_KEY, text);

      // The overlay is currently in "armed" position: translateY(100%)
      // Ensure transitions are active and slide UP from bottom to cover the screen
      overlay.style.transition = 'none';
      overlay.classList.remove('is-exiting', 'is-armed');
      overlay.classList.add('is-armed'); // ensure starting position
      overlay.offsetHeight; // force reflow

      overlay.style.transition = '';

      // Now slide from armed (100%) to covering (0%)
      requestAnimationFrame(() => {
        overlay.classList.remove('is-armed');
        overlay.classList.add('is-entering');

        // Wait for the slide-in animation to finish, then navigate
        const handleEnterEnd = (e) => {
          if (e.propertyName !== 'transform') return;
          overlay.removeEventListener('transitionend', handleEnterEnd);
          window.location.href = href;
        };

        overlay.addEventListener('transitionend', handleEnterEnd);

        // Safety fallback — navigate even if transitionend somehow doesn't fire
        setTimeout(() => {
          window.location.href = href;
        }, 800);
      });
    });
  }

  return { init };
})();
