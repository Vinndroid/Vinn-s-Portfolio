/* ============================================
   ANIMATIONS.JS — GSAP / ScrollTrigger Animations
   ============================================ */

const Animations = (() => {
  let marqueeTickFn = null;

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    // Set defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 1
    });

    initHeroAnimations();
    initHeroMarquee();
    initRevealAnimations();
    initParallax();
    initNavScroll();
    initImageReveals();
    initMarqueeScroll();
    initFooterTime();
    initSectionActiveTracking();
    initAboutAnimations();
    initCertificationsAnimations();
    initFooterCurve();
  }

  /* ========================
     HERO TITLE REVEAL
     ======================== */
  function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const wordInners = heroTitle.querySelectorAll('.word-inner');
    const subtitle = document.querySelector('.hero-subtitle');
    const heroDesc = document.querySelector('.hero-description');

    const tl = gsap.timeline({
      delay: 0.2,
      defaults: { ease: 'power4.out', duration: 1.2 }
    });

    // Title words slide up from below
    tl.to(wordInners, {
      y: 0,
      stagger: 0.08,
      duration: 1.4,
      ease: 'power4.out'
    });

    // Subtitle fades in
    if (subtitle) {
      tl.fromTo(subtitle, {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.8');
    }

    // Description fades in
    if (heroDesc) {
      tl.fromTo(heroDesc, {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.6');
    }

    // Hero parallax on scroll
    gsap.to('.hero-content', {
      y: -80,
      opacity: 0.3,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    });


    return tl;
  }

  /* ========================
     HERO NAME MARQUEE (GSAP)
     ======================== */
  function initHeroMarquee() {
    const container = document.querySelector('.marquee-container');
    const parts = document.querySelectorAll('.marquee-part');
    if (!container || parts.length < 2) return;

    const BASE_SPEED = 0.03;
    const MAX_SPEED  = 0.075; // 2.5x base — the absolute ceiling

    // gsap.utils.clamp enforces the hard speed limit
    const clampSpeed = gsap.utils.clamp(BASE_SPEED, MAX_SPEED);

    // Maps raw velocity (0–3000px/s) into the speed range, then clamps it
    const mapVelocity = gsap.utils.mapRange(0, 3000, BASE_SPEED, MAX_SPEED);

    let xPercent = 0;
    let direction = -1; // -1 moves left, 1 moves right
    let currentSpeed = BASE_SPEED;
    let speedObj = { val: BASE_SPEED };

    // Remove any existing ticker to avoid duplicates
    if (marqueeTickFn) {
      gsap.ticker.remove(marqueeTickFn);
    }

    marqueeTickFn = () => {
      // Wrap seamlessly
      if (xPercent <= -100) {
        xPercent = 0;
      } else if (xPercent > 0) {
        xPercent = -100;
      }
      gsap.set(parts, { xPercent: xPercent });
      xPercent += currentSpeed * direction;
    };

    gsap.ticker.add(marqueeTickFn);

    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // Direction switch
        direction = self.direction === 1 ? -1 : 1;

        // Raw velocity → mapped → clamped (never exceeds MAX_SPEED)
        const rawVelocity = Math.abs(self.getVelocity());
        const targetSpeed = clampSpeed(mapVelocity(rawVelocity));

        // Kill any in-flight tween so values don't stack
        gsap.killTweensOf(speedObj);
        speedObj.val = targetSpeed;

        // Smoothly decay back to base speed
        gsap.to(speedObj, {
          val: BASE_SPEED,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            currentSpeed = speedObj.val;
          }
        });
      }
    });
  }

  /* ========================
     SCROLL-TRIGGERED REVEALS
     ======================== */
  function initRevealAnimations() {
    // All elements with [data-animate]
    const elements = document.querySelectorAll('[data-animate]');

    elements.forEach(el => {
      const delay = parseFloat(el.getAttribute('data-delay')) || 0;

      // Determine animation type from CSS class
      if (el.classList.contains('reveal-up') || el.closest('.reveal-up')) {
        gsap.fromTo(el, {
          opacity: 0,
          y: 60
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none'
          }
        });
      } else {
        // Default reveal-up for elements without specific class
        gsap.fromTo(el, {
          opacity: 0,
          y: 50
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'bottom 20%',
            toggleActions: 'play none none none'
          }
        });
      }
    });

    // Service cards - stagger
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length) {
      gsap.fromTo(serviceCards, {
        opacity: 0,
        y: 60,
        scale: 0.96
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Project cards - stagger
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length) {
      projectCards.forEach((card, i) => {
        gsap.fromTo(card, {
          opacity: 0,
          y: 80
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    }

    // Process steps - stagger
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length) {
      processSteps.forEach((step, i) => {
        gsap.fromTo(step, {
          opacity: 0,
          x: -40
        }, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        });
      });
    }

    // Contact heading
    const contactHeading = document.querySelector('.contact-header h2');
    if (contactHeading) {
      gsap.fromTo(contactHeading, {
        opacity: 0,
        y: 80,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactHeading,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Section dividers
    document.querySelectorAll('.section-divider').forEach(divider => {
      gsap.fromTo(divider, {
        scaleX: 0,
        transformOrigin: 'left center'
      }, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: divider,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Section lines (labels)
    document.querySelectorAll('.section-line').forEach(line => {
      gsap.fromTo(line, {
        width: 0
      }, {
        width: 50,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  /* ========================
     PARALLAX EFFECTS
     ======================== */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-speed]');

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;

      gsap.to(el, {
        y: () => -ScrollTrigger.maxScroll(window) * speed * 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });
    });
  }

  /* ========================
     NAV HIDE/SHOW ON SCROLL
     ======================== */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let lastScroll = 0;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        const scrollY = self.scroll();

        if (scrollY > 100) {
          nav.classList.add('is-scrolled');
        } else {
          nav.classList.remove('is-scrolled');
        }

        if (scrollY > lastScroll && scrollY > 200) {
          nav.classList.add('is-hidden');
        } else {
          nav.classList.remove('is-hidden');
        }

        lastScroll = scrollY;
      }
    });
  }

  /* ========================
     IMAGE REVEALS
     ======================== */
  function initImageReveals() {
    const imageReveals = document.querySelectorAll('.img-reveal');

    imageReveals.forEach(el => {
      gsap.fromTo(el.querySelector('::after') || el, {}, {});

      // Use the pseudo-element approach
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
          onEnter: () => {
            el.classList.add('is-revealed');
            gsap.fromTo(el, {
              clipPath: 'inset(0 100% 0 0)'
            }, {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.2,
              ease: 'power3.inOut'
            });

            // Also animate the image inside with scale
            const img = el.querySelector('img');
            if (img) {
              gsap.fromTo(img, {
                scale: 1.3
              }, {
                scale: 1,
                duration: 1.4,
                delay: 0.2,
                ease: 'power3.out'
              });
            }
          }
        }
      });
    });
  }

  /* ========================
     MARQUEE SCROLL SPEED
     ======================== */
  function initMarqueeScroll() {
    const marqueeStrip = document.querySelector('.marquee-strip');
    if (!marqueeStrip) return;

    // Speed up marquee on scroll
    gsap.to('.marquee-inner', {
      scrollTrigger: {
        trigger: marqueeStrip,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const velocity = self.getVelocity() / 300;
          gsap.to('.marquee-inner', {
            skewX: -velocity * 0.5,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    });
  }

  /* ========================
     FOOTER TIME
     ======================== */
  function initFooterTime() {
    const timeEl = document.getElementById('footer-time');
    if (!timeEl) return;

    function updateTime() {
      const now = new Date();
      const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      timeEl.textContent = now.toLocaleTimeString('en-US', options);
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ========================
     MOBILE MENU ACTIVE SECTION TRACKING
     ======================== */
  function initSectionActiveTracking() {
    const mobileLinks = document.querySelectorAll('.mobile-menu .mobile-link');
    if (!mobileLinks.length) return;

    function clearActive() {
      mobileLinks.forEach(link => link.classList.remove('active'));
    }

    // Direct Page Namespace highlight checks to bypass ScrollTrigger on non-index pages
    const currentNamespace = document.querySelector('main')?.getAttribute('data-barba-namespace') || '';
    if (currentNamespace === 'about') {
      clearActive();
      const aboutLink = Array.from(mobileLinks).find(link => {
        const href = link.getAttribute('href') || '';
        return href === 'about.html' || href === '#about';
      });
      if (aboutLink) {
        aboutLink.classList.add('active');
      }
      return;
    }

    if (currentNamespace === 'project') {
      clearActive();
      const projectLink = Array.from(mobileLinks).find(link => {
        const href = link.getAttribute('href') || '';
        return href.includes('project') || href === '#project';
      });
      if (projectLink) {
        projectLink.classList.add('active');
      }
      return;
    }

    // Gather all sections on the page that have an ID
    const allSections = document.querySelectorAll('section[id], .hero[id]');
    if (!allSections.length) return;

    // Match a section ID to its corresponding mobile menu link
    function findLinkForSection(sectionId) {
      for (let i = 0; i < mobileLinks.length; i++) {
        const href = mobileLinks[i].getAttribute('href') || '';

        // Hero and services sections map to the "Home" link
        if ((sectionId === 'hero' || sectionId === 'services') &&
            (href === '#hero' || href === 'index.html' || href === '/' || href === './')) {
          return mobileLinks[i];
        }

        // Direct hash match: #work, #contact, etc.
        if (href === '#' + sectionId) {
          return mobileLinks[i];
        }

        // Cross-page hash match: index.html#work, index.html#contact, etc.
        if (href === 'index.html#' + sectionId) {
          return mobileLinks[i];
        }

        // Map section 'work' to Projects page link
        if (sectionId === 'work' && (href.includes('project') || href === '#work' || href === 'index.html#work')) {
          return mobileLinks[i];
        }
      }
      return null;
    }

    // Create a ScrollTrigger for each section
    allSections.forEach(section => {
      const id = section.getAttribute('id');
      if (!id) return;

      // Only track sections that have a corresponding mobile link
      const link = findLinkForSection(id);
      if (!link) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 30%',
        onToggle: (self) => {
          if (self.isActive) {
            clearActive();
            link.classList.add('active');
          }
        }
      });
    });

    // Set Home as active by default on page load (top of page)
    const homeLink = findLinkForSection('hero');
    if (homeLink) {
      clearActive();
      homeLink.classList.add('active');
    }
  }

  /* ========================
     ABOUT PAGE SPLIT-LAYOUT ANIMATIONS
     ======================== */
  function initAboutAnimations() {
    const splitSection = document.querySelector('.about-split-section');
    if (!splitSection) return;

    // Smooth fade/slide stagger for scrolling right technical blocks
    const techBlocks = splitSection.querySelectorAll('.tech-block');
    techBlocks.forEach((block, index) => {
      gsap.fromTo(block, {
        opacity: 0.2,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: block,
          start: 'top 85%',
          end: 'top 45%',
          scrub: true
        }
      });
    });
  }

  /* ========================
     CERTIFICATIONS SPLIT SECTION ANIMATIONS
     ======================== */
  function initCertificationsAnimations() {
    const certSplit = document.querySelector('.certifications-split');
    if (certSplit) {
      // Animate the horizontal divider lines (scaleX from 0 to 1)
      const lines = certSplit.querySelectorAll('.cert-row-line');
      lines.forEach(line => {
        gsap.fromTo(line, {
          scaleX: 0
        }, {
          scaleX: 1,
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: line,
            start: 'top 92%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Animate the row contents (fade and slide up)
      const rows = certSplit.querySelectorAll('.cert-row-content');
      rows.forEach((row, i) => {
        gsap.fromTo(row, {
          opacity: 0,
          y: 40
        }, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        });
      });
    }

    const certStack = document.querySelector('.certs-right-scroll-stack');
    if (certStack) {
      const certCards = certStack.querySelectorAll('.cert-premium-card');
      if (certCards.length) {
        gsap.fromTo(certCards, {
          opacity: 0,
          y: 60,
          scale: 0.97
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: certStack,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      }
    }
  }

  /* ========================
     SVG CURVED FOOTER TRANSITION
     ======================== */
  function initFooterCurve() {
    const curveWrapper = document.querySelector('.snellenberg-curve-wrapper');

    if (curveWrapper) {
      gsap.to(curveWrapper, {
        height: 0, // Curve ko smooth khinch kar flat line bana dega
        ease: "none",
        scrollTrigger: {
          trigger: curveWrapper,
          start: "top bottom",  /* Jaise hi curve screen ke bottom se enter kare */
          end: "bottom top",    /* Jab tak screen ke top se bahar na nikal jaye */
          scrub: true,          /* Real-time scroll speed se sync */
        }
      });
    }
  }


  /* ========================
     REFRESH (for Barba)
     ======================== */
  function refresh() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    init();
  }

  function kill() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (marqueeTickFn) {
      gsap.ticker.remove(marqueeTickFn);
      marqueeTickFn = null;
    }
  }

  return { init, refresh, kill, initHeroAnimations };
})();
