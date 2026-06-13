(function() {
  const savedTheme = localStorage.getItem('vinn-theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

if ('history' in window) {
    window.history.scrollRestoration = 'manual';
}

function instantScrollToTop() {
    window.scrollTo(0, 0);
    
    // Check and handle Lenis
    if (typeof lenis !== 'undefined' && lenis) {
        if (typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(0, { immediate: true });
        }
    }
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(0, { immediate: true });
    }
    
    // Check for Locomotive Scroll
    if (typeof locomotiveScroll !== 'undefined' && locomotiveScroll) {
        if (typeof locomotiveScroll.scrollTo === 'function') {
            try { locomotiveScroll.scrollTo(0, { duration: 0, disableLerp: true }); } catch (e) {}
        }
    }
    if (window.locomotiveScroll && typeof window.locomotiveScroll.scrollTo === 'function') {
        try { window.locomotiveScroll.scrollTo(0, { duration: 0, disableLerp: true }); } catch (e) {}
    }
    
    // Check and handle custom SmoothScroll module if active
    if (typeof SmoothScroll !== 'undefined' && SmoothScroll) {
        if (typeof SmoothScroll.scrollTo === 'function') {
            try { SmoothScroll.scrollTo(0, { immediate: true, duration: 0 }); } catch (e) {}
        }
        if (typeof SmoothScroll.getInstance === 'function') {
            const instance = SmoothScroll.getInstance();
            if (instance && typeof instance.scrollTo === 'function') {
                try { instance.scrollTo(0, { immediate: true }); } catch (e) {}
            }
        }
    }

    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
        ScrollTrigger.refresh();
    }
}

// Execute instantly on script start
instantScrollToTop();

// Execute on full window load to override any post-load scroll settings or engine adjustments
window.addEventListener('load', function() {
    instantScrollToTop();
    // Re-trigger after short delays to ensure no dynamic content loads alter the scroll position
    setTimeout(instantScrollToTop, 0);
    setTimeout(instantScrollToTop, 50);
});

/* ============================================
   APP.JS — Main Entry Point & Initialization
   ============================================ */

(function() {
  'use strict';

  /* ========================
     TERMINAL LOADER
     ======================== */
  function runLoadingScreen() {
    return new Promise((resolve) => {
      const loader  = document.getElementById('terminal-loader');
      const cursor  = document.getElementById('terminal-cursor');

      if (!loader) { resolve(); return; }

      // Skip on repeat visits within the same session
      if (sessionStorage.getItem('portfolio-loaded')) {
        loader.style.display = 'none';
        resolve();
        return;
      }

      // Line IDs and their reveal delays (ms)
      const sequence = [
        { id: 'tl-0', delay: 200  },
        { id: 'tl-1', delay: 600  },  // blank spacer
        { id: 'tl-2', delay: 750  },
        { id: 'tl-3', delay: 1250 },
        { id: 'tl-4', delay: 1750 },
        { id: 'tl-5', delay: 2150 },  // blank spacer
        { id: 'tl-6', delay: 2350 },  // SYSTEM READY
      ];

      // Reveal each line at its scheduled time
      sequence.forEach(({ id, delay }) => {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.classList.add('visible');

          // Activate blinking cursor on the final line
          if (id === 'tl-6' && cursor) {
            cursor.style.opacity = '1';
          }
        }, delay);
      });

      // After SYSTEM READY — short pause then GSAP curtain reveal
      const totalDelay = sequence[sequence.length - 1].delay + 600;

      setTimeout(() => {
        sessionStorage.setItem('portfolio-loaded', 'true');

        gsap.to(loader, {
          yPercent: -100,
          duration: 1.1,
          ease: 'power4.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            resolve();
          }
        });
      }, totalDelay);
    });
  }

  /* ========================
     MOBILE MENU
     ======================== */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');

    if (!menu) return;

    function toggleMenu() {
      const isOpen = menu.classList.toggle('is-open');
      
      if (toggle) toggle.classList.toggle('is-active', isOpen);

      if (isOpen) {
        SmoothScroll.stop();
        document.body.classList.add('no-scroll');
      } else {
        SmoothScroll.start();
        document.body.classList.remove('no-scroll');
      }
    }

    if (toggle) {
      toggle.addEventListener('click', toggleMenu);
    }

    // Close menu on link click & handle cross-page dynamic routing
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const currentNamespace = document.querySelector('main')?.getAttribute('data-barba-namespace') || '';

        // If the clicked link is an in-page anchor hash
        if (href.startsWith('#')) {
          const targetId = href.substring(1);

          // We want to go to a Home page section (hero, work, contact).
          // If we are not on the home page namespace, navigate there with the hash.
          if (currentNamespace !== 'home') {
            e.preventDefault();
            const dest = href === '#hero' ? 'index.html' : `index.html${href}`;
            if (typeof barba !== 'undefined') {
              barba.go(dest);
            } else {
              window.location.href = dest;
            }
          }
        } else if (href.includes('.html#')) {
          // Handle cross-page hash match (e.g. index.html#work)
          const parts = href.split('#');
          const page = parts[0];
          const hash = '#' + parts[1];

          // If we are already on the page the hash belongs to, trigger smooth scroll
          if ((page === 'index.html' || page === '/') && currentNamespace === 'home') {
            e.preventDefault();
            setTimeout(() => {
              SmoothScroll.scrollTo(hash, { duration: 1.5 });
            }, 100);
          } else if (page === 'about.html' && currentNamespace === 'about') {
            e.preventDefault();
            setTimeout(() => {
              SmoothScroll.scrollTo(hash, { duration: 1.5 });
            }, 100);
          }
        }

        if (toggle) toggle.classList.remove('is-active');
        menu.classList.remove('is-open');
        SmoothScroll.start();
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ========================
     BACK TO TOP
     ======================== */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      SmoothScroll.scrollTo(0, { duration: 2 });
    });
  }

  /* ========================
     FORM HANDLING
     ======================== */
  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple success feedback
      const btn = form.querySelector('.btn');
      const btnText = btn.querySelector('.btn-text');
      const originalText = btnText.textContent;

      btnText.textContent = 'Message Sent!';
      btn.style.pointerEvents = 'none';

      gsap.fromTo(btn, {
        scale: 0.95
      }, {
        scale: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      });

      setTimeout(() => {
        btnText.textContent = originalText;
        btn.style.pointerEvents = '';
        form.reset();
      }, 3000);
    });
  }

  /* ========================
     VINN PARTICLE ENGINE (ANTIGRAVITY MOUSE-REACTIVE)
     ======================== */
  const VinnParticleBg = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let animationFrameId = null;
    const numParticles = 140;

    // Shades of subtle dark gray, blue, and neon accents
    const lightColors = [
      'rgba(17, 17, 17, 0.35)', // Muted dark charcoal
      'rgba(0, 102, 255, 0.35)', // Antigravity blue
      'rgba(0, 180, 216, 0.35)', // Light neon blue
      'rgba(199, 255, 2, 0.4)',   // Signature neon green accent
      'rgba(114, 9, 183, 0.35)'   // Tech purple accent
    ];

    // Shimmering white/neon shades for dark mode
    const darkColors = [
      'rgba(245, 245, 245, 0.35)', // Muted light gray/white
      'rgba(0, 150, 255, 0.45)',   // Shimmering neon blue
      'rgba(199, 255, 2, 0.5)',     // Signature neon green accent
      'rgba(236, 72, 153, 0.35)',   // Neon pink
      'rgba(168, 85, 247, 0.35)'    // Electric purple
    ];

    class Particle {
      constructor(w, h, activeColors) {
        this.baseX = Math.random() * w;
        this.baseY = Math.random() * h;
        this.x = this.baseX;
        this.y = this.baseY;
        
        // Very slow baseline drift velocity
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        
        this.radius = Math.random() * 1.5 + 1; // 1px to 2.5px radius
        this.color = activeColors[Math.floor(Math.random() * activeColors.length)];
      }

      update(w, h) {
        // Drift base position slowly
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Wrap edges safely
        if (this.baseX < 0) this.baseX = w;
        if (this.baseX > w) this.baseX = 0;
        if (this.baseY < 0) this.baseY = h;
        if (this.baseY > h) this.baseY = 0;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceRadius = 120;

        let targetX = this.baseX;
        let targetY = this.baseY;

        if (distance < forceRadius) {
          // Push away force vector
          const force = (forceRadius - distance) / forceRadius;
          const angle = Math.atan2(dy, dx);
          
          // Repulse from cursor dynamically
          targetX = this.baseX + Math.cos(angle) * force * 70;
          targetY = this.baseY + Math.sin(angle) * force * 70;
        }

        // Lerp return home
        this.x += (targetX - this.x) * 0.08;
        this.y += (targetY - this.y) * 0.08;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      particles.forEach(p => {
        if (p.baseX > canvas.width) p.baseX = Math.random() * canvas.width;
        if (p.baseY > canvas.height) p.baseY = Math.random() * canvas.height;
      });
    }

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function onMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(loop);
    }

    function updateColors(isDark) {
      const activeColors = isDark ? darkColors : lightColors;
      particles.forEach(p => {
        p.color = activeColors[Math.floor(Math.random() * activeColors.length)];
      });
    }

    function init() {
      canvas = document.getElementById('vinn-particle-canvas');
      if (!canvas) return;

      ctx = canvas.getContext('2d');
      particles = [];

      resize();

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const activeColors = isDark ? darkColors : lightColors;

      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(canvas.width, canvas.height, activeColors));
      }

      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseleave', onMouseLeave);

      loop();
    }

    function destroy() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    }

    return { init, destroy, updateColors };
  })();

  /* ========================
     THEME MANAGER (DARK/LIGHT TOGGLE SWITCH)
     ======================== */
  function initTheme() {
    const checkbox = document.getElementById('vinn-theme-checkbox');
    if (!checkbox || checkbox.dataset.themeInit === 'true') return;

    checkbox.dataset.themeInit = 'true';

    // Load initial theme state from localStorage
    const savedTheme = localStorage.getItem('vinn-theme') || 'light';
    const isDark = savedTheme === 'dark';
    checkbox.checked = isDark;
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    checkbox.addEventListener('change', () => {
      const activeDark = checkbox.checked;
      if (activeDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('vinn-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('vinn-theme', 'light');
      }

      // Sync canvas colors dynamically
      VinnParticleBg.updateColors(activeDark);
    });
  }

  /* ========================
     INIT ALL
     ======================== */
  async function initAll() {
    // SYSTEM 2: Initialize page transition curtain FIRST on all pages.
    // If we arrived via a nav click, this will play the curtain exit animation.
    // If this is a fresh/direct load, the curtain stays invisible (translateY(100%)).
    Transitions.init();

    // SYSTEM 1: Terminal preloader — only runs on index.html, first visit only.
    // The terminal preloader has its own sessionStorage guard ('portfolio-loaded'),
    // so it won't re-run on subsequent visits within the same session.
    const isIndexPage = document.getElementById('terminal-loader') !== null;
    if (isIndexPage) {
      await runLoadingScreen();
    }

    // Initialize all other modules after both systems have resolved
    SmoothScroll.init();
    Magnetic.init();
    ThreeBg.init();
    Animations.init();
    VinnParticleBg.init();
    initTheme();

    // Page-specific
    initMobileMenu();
    initBackToTop();
    initForm();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
