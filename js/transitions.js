/* ============================================
   TRANSITIONS.JS — Premium Page Transitions
   ============================================ */

const Transitions = (() => {

  function init() {
    const overlay = document.querySelector('.page-transition-overlay');

    if (overlay) {
      // 1. On Page Load: The Exit Animation (Slide UP and out)
      // Because CSS default is translateY(0), the screen is already covered.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Slide up and out of the screen
          overlay.classList.add('is-exiting');

          // Once it has fully exited the top, silently reset it to the bottom
          const handleTransitionEnd = (e) => {
            if (e.propertyName !== 'transform') return;
            overlay.removeEventListener('transitionend', handleTransitionEnd);
            
            // Instantly jump to bottom
            overlay.style.transition = 'none';
            overlay.classList.remove('is-exiting');
            overlay.classList.add('is-hidden-bottom');
            
            // Force layout recalculation
            overlay.offsetHeight; 
            
            // Re-arm transitions for the next click
            overlay.style.transition = '';
          };
          
          overlay.addEventListener('transitionend', handleTransitionEnd);
        });
      });
    }

    // 2. Intercept Clicks: Listen for clicks on all internal navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip external links, hashes, mailto, phone, target="_blank"
      if (
        href.startsWith('#') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        link.getAttribute('target') === '_blank' ||
        href.includes('//')
      ) {
        return;
      }

      // Check if it has a hash (in-page smooth scroll check)
      // If we are navigating to the same page with a hash, let it go to the scroll logic.
      const currentPath = window.location.pathname;
      const currentNamespace = document.querySelector('main')?.getAttribute('data-barba-namespace') || '';
      
      // If it contains a cross-page hash (e.g. index.html#contact), but we are on that page already, do not transition
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

      if (overlay) {
        const title = document.querySelector('.page-transition-title');
        
        // Determine clicked link's text
        let text = '';
        if (link.classList.contains('nav-logo') || link.querySelector('.logo-name')) {
          text = 'Home';
        } else {
          text = link.textContent.trim();
        }

        // Clean up special characters from the text
        text = text.replace(/→|↗|←|↑|↓/g, '').trim();

        // Fallback names
        if (!text) {
          if (href.includes('index.html')) text = 'Home';
          else if (href.includes('about.html')) text = 'About';
          else if (href.includes('project.html')) text = 'Projects';
          else text = 'Loading';
        }

        if (title) {
          title.textContent = text;
        }

        // Ensure transitions are active
        overlay.style.transition = '';
        
        // Remove the bottom waiting state and trigger the slide up to 0
        overlay.classList.remove('is-hidden-bottom');
        overlay.classList.add('is-active');

        // Wait for the slide-in transition to finish, then navigate
        setTimeout(() => {
          window.location.href = href;
        }, 600);
      } else {
        window.location.href = href;
      }
    });
  }

  return { init };
})();
