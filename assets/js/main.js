/* =============================================================================
   Kouantchou Njeudji Nathy Ingrid — portfolio interactions
   Vanilla ES6+. Lenis is the only dependency, and it degrades gracefully.
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = () => reduced.matches;

  /* --- Smooth scroll (Lenis) ---------------------------------------------- */
  let lenis = null;

  function initLenis() {
    if (prefersReduced() || typeof window.Lenis === 'undefined') return;

    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  /* --- Anchor scrolling ---------------------------------------------------- */
  function initAnchors() {
    const NAV_OFFSET = 84;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        closeMenu();

        if (lenis) {
          lenis.scrollTo(target, { offset: -NAV_OFFSET, duration: 1.15 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          window.scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });
        }

        // Move focus for keyboard and screen-reader users — smooth scrolling
        // otherwise leaves focus stranded at the top of the document.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });

        history.pushState(null, '', id);
      });
    });
  }

  /* --- Navigation: sticky, auto-hide, mobile menu, scrollspy -------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    if (nav) nav.classList.remove('nav--menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function initNav() {
    if (!nav) return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('nav--stuck', y > 24);

      // Hide on scroll down, reveal on scroll up — but never while the mobile
      // menu is open, or the menu would slide away with it.
      const menuOpen = navLinks && navLinks.classList.contains('is-open');
      if (!menuOpen) {
        const goingDown = y > lastY && y > 320;
        nav.classList.toggle('nav--hidden', goingDown);
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        nav.classList.toggle('nav--menu-open', open);
        if (open) nav.classList.remove('nav--hidden');
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
          closeMenu();
          navToggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (!navLinks.classList.contains('is-open')) return;
        if (!nav.contains(e.target)) closeMenu();
      });
    }
  }

  /* --- Scrollspy ----------------------------------------------------------- */
  function initScrollspy() {
    const links = [...document.querySelectorAll('.nav__link')];
    const sections = links
      .map((l) => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);
    if (!sections.length) return;

    const setCurrent = (id) => {
      links.forEach((l) => {
        const on = l.getAttribute('href') === `#${id}`;
        if (on) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    };

    const io = new IntersectionObserver((entries) => {
      // Pick the entry nearest the top of the viewport among those intersecting.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setCurrent(visible[0].target.id);
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sections.forEach((s) => io.observe(s));
  }

  /* --- Reveal on scroll ---------------------------------------------------- */
  function initReveals() {
    const items = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (!items.length) return;

    if (prefersReduced() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // reveal once, then stop watching
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach((el) => io.observe(el));
  }

  /* --- Hero intro ---------------------------------------------------------- */
  function initHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    requestAnimationFrame(() => hero.classList.add('is-ready'));
  }

  /* --- Animated counters ---------------------------------------------------
     The markup already contains the real numbers, so this only ever animates
     from zero up to the value that is already there. Under reduced motion, or
     without JS, the printed value simply stands.
  -------------------------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length || prefersReduced() || !('IntersectionObserver' in window)) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (Number.isNaN(target)) return;

      const DURATION = 1400;
      let startTime = null;

      const tick = (now) => {
        if (startTime === null) startTime = now;
        const p = Math.min((now - startTime) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    // Zero them only now — JS is running and the observer is live, so the
    // count-up is guaranteed to follow.
    counters.forEach((el) => {
      el.textContent = '0';
      io.observe(el);
    });
  }

  /* --- Hero cutout drift ---------------------------------------------------- */
  /* The hero subject is a free-standing cutout layered over the name, not a photo
     inside an overflow-hidden frame, so there is no overscan to drift within.
     Instead the whole figure rises slightly as the hero scrolls away, keeping a
     little depth against the headline behind it. */
  function initParallax() {
    const figure = document.querySelector('.hero__figure');
    const target = figure && figure.querySelector('picture');
    if (!figure || !target || prefersReduced()) return;

    let ticking = false;
    const update = () => {
      const rect = figure.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2)
                     / window.innerHeight;
      target.style.setProperty('--py', `${(progress * 10).toFixed(2)}px`);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* --- Card pointer glow --------------------------------------------------- */
  function initCardGlow() {
    if (prefersReduced() || !window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('.xcard').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* --- Hero canvas: crystalline lattice ------------------------------------
     A slow-drifting node/edge field — a nod to crystal structure and the
     element maps XRF produces. Decorative, aria-hidden, and skipped entirely
     under reduced-motion.
  -------------------------------------------------------------------------- */
  function initLattice() {
    const canvas = document.getElementById('lattice');
    if (!canvas || prefersReduced()) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const COFFEE = '66, 45, 30';
    const RED = '232, 19, 57';
    const LINK_DIST = 132;

    let w = 0, h = 0, dpr = 1;
    let nodes = [];
    let raf = null;
    let running = false;

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      // Density scales with area, capped so low-end phones stay smooth.
      const count = Math.min(Math.round((w * h) / 20000), 52);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.9,
        accent: Math.random() < 0.16,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        // Wrap rather than bounce — no visible edge collisions.
        if (a.x < -20) a.x = w + 20;
        if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20;
        if (a.y > h + 20) a.y = -20;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;

          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
          ctx.strokeStyle = `rgba(${COFFEE}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        ctx.fillStyle = a.accent
          ? `rgba(${RED}, 0.5)`
          : `rgba(${COFFEE}, 0.28)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    };

    sizeCanvas();
    seed();
    start();

    // Pause when the hero scrolls away or the tab is hidden — no point burning
    // frames on something nobody is looking at.
    const io = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
        seed();
      }, 180);
    });

    reduced.addEventListener('change', (e) => {
      if (e.matches) {
        stop();
        ctx.clearRect(0, 0, w, h);
      } else {
        start();
      }
    });
  }

  /* --- Footer year --------------------------------------------------------- */
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --- Boot ---------------------------------------------------------------- */
  const boot = () => {
    initLenis();
    initAnchors();
    initNav();
    initScrollspy();
    initReveals();
    initHero();
    initCounters();
    initParallax();
    initCardGlow();
    initLattice();
    initYear();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
