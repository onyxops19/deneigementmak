/* ────────────────────────────────────────────────────────────────────
   DÉNEIGEMENT MAK EXCAVATION — main.js
   Handles: hero mask reveal · nav scroll · réalisations carousel ·
            avis carousel · mobile nav · scroll-reveal
──────────────────────────────────────────────────────────────────── */

/* ── HERO MASK REVEAL ───────────────────────────────────────────── */
(function initHeroReveal() {
  const loader  = document.getElementById('hero-loader');
  const hero    = document.getElementById('hero');
  const mClip   = document.getElementById('hero-m-clip');
  if (!loader || !hero || !mClip) return;

  /* Build the 12-point block-M polygon points in viewport pixels    */
  function buildMPoints(vw, vh) {
    const mH  = vh * 0.46;                  // M height = 46% viewport
    const mW  = mH * (200 / 160);           // aspect 200×160
    const ox  = (vw - mW) / 2;             // left origin
    const oy  = (vh - mH) / 2;             // top origin
    const sx  = mW / 200;                   // x scale
    const sy  = mH / 160;                   // y scale
    // template points in 200×160 space (block M, 30px stroke)
    const pts = [
      [0,160],[0,0],[30,0],[100,78],[170,0],[200,0],
      [200,160],[170,160],[170,36],[100,108],[30,36],[30,160]
    ];
    return pts.map(([px, py]) =>
      `${(ox + px * sx).toFixed(2)},${(oy + py * sy).toFixed(2)}`
    ).join(' ');
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  mClip.setAttribute('points', buildMPoints(vw, vh));

  /* Skip animation entirely — remove loader and clip immediately     */
  function skipReveal() {
    hero.style.clipPath = 'none';
    loader.style.display = 'none';
  }

  /* Reduced-motion: skip                                             */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipReveal();
    return;
  }

  /* Back/forward cache restore (e.g. returning from contact.html):
     pageshow fires with persisted=true — skip the animation to avoid
     the hero being stuck clipped on a bfcache restore.               */
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) skipReveal();
  });

  /* Normal path: wait for GSAP, then animate                        */
  function runReveal() {
    if (typeof gsap === 'undefined') {
      setTimeout(runReveal, 50);
      return;
    }

    const mH    = vh * 0.46;
    const mW    = mH * (200 / 160);
    const scale = Math.max(vw / mW, vh / mH) * 1.8;
    const cx    = (vw / 2).toFixed(2);
    const cy    = (vh / 2).toFixed(2);

    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(loader, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    tl.to(mClip, {
      scale,
      svgOrigin: `${cx} ${cy}`,
      duration: 1.05,
      ease: 'power2.inOut',
      onComplete() {
        hero.style.clipPath = 'none';
        loader.remove();
      }
    }, 0);
  }

  window.addEventListener('load', runReveal);
})();

/* ── NAV: TRANSPARENT → SOLID ON SCROLL ───────────────────────────── */
(function initNav() {
  const nav  = document.getElementById('main-nav');
  const hero = document.getElementById('hero');
  if (!nav) return;

  function update() {
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    const solid = window.scrollY > heroH * 0.65;
    nav.classList.toggle('nav--solid', solid);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── MOBILE NAV ────────────────────────────────────────────────────── */
(function initMobileNav() {
  const btn    = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-nav');
  if (!btn || !drawer) return;

  function open() {
    btn.classList.add('is-open');
    drawer.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    btn.classList.remove('is-open');
    drawer.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('is-open') ? close() : open();
  });

  document.querySelectorAll('[data-close-nav]').forEach(el => {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();

/* ── RÉALISATIONS — SCROLL-DRIVEN HORIZONTAL REVEAL ───────────────── */
(function initRealisations() {
  const section = document.getElementById('realisations');
  const track   = document.getElementById('real-track');
  if (!section || !track) return;

  const slides = Array.from(track.querySelectorAll('.real-slide'));
  const dots   = Array.from(document.querySelectorAll('.real-dot'));
  const total  = slides.length;

  function setup() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(setup, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Total horizontal distance to travel = (slides - 1) viewports  */
    const totalDist = () => (total - 1) * window.innerWidth;

    /* Pin the section and scrub the track left as user scrolls down  */
    gsap.to(track, {
      x: () => -totalDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalDist()}`,
        pin: true,
        scrub: 0.6,          /* slight smoothing so it feels physical */
        anticipatePin: 1,
        invalidateOnRefresh: true,

        /* Keep dots in sync with scroll progress                     */
        onUpdate(self) {
          const idx = Math.min(
            total - 1,
            Math.round(self.progress * (total - 1))
          );
          dots.forEach((d, i) => {
            d.classList.toggle('is-active', i === idx);
            d.setAttribute('aria-selected', String(i === idx));
          });
        }
      }
    });

    /* Clicking a dot scrolls to that slide's corresponding position  */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const st = ScrollTrigger.getById('real-st') ||
                   ScrollTrigger.getAll().find(t => t.vars.trigger === section);
        if (!st) return;
        const targetScroll = st.start + (i / (total - 1)) * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });
  }

  setup();
})();

/* ── PROMISE STATS — ANIMATED COUNTERS ─────────────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll('.promise__stat-num');
  if (!nums.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nums.forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el      = entry.target;
      const target  = parseFloat(el.dataset.target);
      const suffix  = el.dataset.suffix || '';
      const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
      const dur     = 1600;
      const start   = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);   /* cubic ease-out */
        el.textContent = (target * ease).toFixed(decimal) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  nums.forEach(el => io.observe(el));
})();

/* ── AVIS — INFINITE MARQUEE (duplicate cards for seamless CSS loop) ── */
(function initAvisMarquee() {
  const track = document.getElementById('avis-marquee-track');
  if (!track) return;
  Array.from(track.children).forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();

/* ── SCROLL REVEAL ──────────────────────────────────────────────────── */
(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();

/* ── GSAP SCROLL TRIGGER ────────────────────────────────────────────── */
window.addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  /* CSS IntersectionObserver handles all reveal animations.
     GSAP ScrollTrigger is reserved for the hero mask — no additional
     from() calls here that would fight the CSS reveal system. */
});
