/* =========================================
   MOBILE MENU — GLASS OVERLAY
   Abre/fecha com GSAP, trava o scroll,
   fecha com Esc / X / clique no link.
   ========================================= */

(function () {
  var panel = document.getElementById('mobile-nav');
  var toggle = document.querySelector('.elevate-hamburger');

  if (!panel || !toggle) return;

  var closeButton = panel.querySelector('.elevate-mobile-nav__close');
  var links = Array.prototype.slice.call(
    panel.querySelectorAll('.elevate-mobile-nav__links a')
  );
  var fadeItems = Array.prototype.slice.call(
    panel.querySelectorAll(
      '.elevate-mobile-nav__logo, .elevate-mobile-nav__close, .elevate-mobile-nav__cta, .elevate-mobile-nav__note'
    )
  );

  var body = document.body;
  var gsap = window.gsap;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !!gsap && !reduceMotion;

  var isOpen = false;
  var lastFocused = null;
  var openTimeline = null;
  var closeTimeline = null;

  /* ---------- Timeline GSAP ---------- */

  if (canAnimate) {
    // zera o translateX herdado do CSS antes de usar xPercent
    gsap.set(panel, { x: 0, xPercent: 100, autoAlpha: 0 });

    openTimeline = gsap.timeline({ paused: true })
      .set(panel, { autoAlpha: 1 })
      .fromTo(panel, { xPercent: 100 }, {
        xPercent: 0,
        duration: 0.62,
        ease: 'power4.out'
      }, 0)
      .fromTo(fadeItems, { autoAlpha: 0 }, {
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
      }, 0.12)
      .fromTo(links, { autoAlpha: 0, y: 26 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out'
      }, 0.2);

    closeTimeline = gsap.timeline({ paused: true })
      .to(links, {
        autoAlpha: 0,
        y: 12,
        duration: 0.22,
        stagger: { each: 0.03, from: 'end' },
        ease: 'power1.in'
      }, 0)
      .to(fadeItems, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0)
      .to(panel, {
        xPercent: 100,
        duration: 0.46,
        ease: 'power3.inOut'
      }, 0.08)
      .set(panel, { autoAlpha: 0 });
  }

  /* ---------- Estado / acessibilidade ---------- */

  function setExpanded(state) {
    isOpen = state;
    toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
    toggle.setAttribute('aria-label', state ? 'Fechar menu' : 'Abrir menu');
    panel.setAttribute('aria-hidden', state ? 'false' : 'true');
  }

  function focusables() {
    return Array.prototype.slice.call(
      panel.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function openMenu() {
    if (isOpen) return;

    lastFocused = document.activeElement;
    body.classList.add('menu-open');
    panel.classList.add('open');
    setExpanded(true);

    if (canAnimate) {
      closeTimeline.pause();
      openTimeline.restart();
    }

    if (closeButton) {
      window.setTimeout(function () {
        closeButton.focus({ preventScroll: true });
      }, canAnimate ? 220 : 0);
    }
  }

  function closeMenu(returnFocus) {
    if (!isOpen) return;

    body.classList.remove('menu-open');
    panel.classList.remove('open');
    setExpanded(false);

    if (canAnimate) {
      openTimeline.pause();
      closeTimeline.restart();
    }

    if (returnFocus !== false) {
      var target = lastFocused || toggle;
      if (target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }
  }

  /* ---------- Eventos ---------- */

  toggle.addEventListener('click', function (event) {
    event.preventDefault();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      closeMenu();
    });
  }

  // Qualquer link do painel fecha o menu (o salto da âncora continua normal)
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu(false);
    });
  });

  panel.querySelectorAll('a').forEach(function (link) {
    if (links.indexOf(link) !== -1) return;

    link.addEventListener('click', function () {
      closeMenu(false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    // Mantém o foco dentro do painel
    if (event.key === 'Tab') {
      var items = focusables();
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }
  });

  // Ao voltar para o desktop, limpa o estado do menu
  window.addEventListener('resize', function () {
    if (window.innerWidth > 700 && isOpen) {
      if (canAnimate) {
        openTimeline.pause();
        closeTimeline.pause();
        closeTimeline.progress(1);
      }
      body.classList.remove('menu-open');
      panel.classList.remove('open');
      setExpanded(false);
    }
  });

  // Evita abrir o menu em desktop se algo disparar o botão
  var desktopQuery = window.matchMedia('(max-width: 700px)');

  function handleBreakpointChange(event) {
    if (!event.matches && isOpen) {
      body.classList.remove('menu-open');
      panel.classList.remove('open');
      setExpanded(false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleBreakpointChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleBreakpointChange);
  }
})();
