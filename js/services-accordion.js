(function () {
  var root = document.querySelector('.architecture-services');
  if (!root) return;

  var items = Array.prototype.slice.call(
    root.querySelectorAll('.architecture-services__item')
  );
  if (!items.length) return;

  var gsap = window.gsap;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var openItem = null;
  var refreshTimer = 0;

  function parts(item) {
    return {
      trigger: item.querySelector('.architecture-services__trigger'),
      panel: item.querySelector('.architecture-services__panel'),
      icon: item.querySelector('.architecture-services__icon')
    };
  }

  function requestRefresh() {
    if (!window.ScrollTrigger) return;

    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function () {
      window.ScrollTrigger.refresh();
    }, 120);
  }

  function setOpen(item, open, animate) {
    var el = parts(item);
    if (!el.trigger || !el.panel) return;

    item.classList.toggle('is-open', open);
    item.classList.toggle('architecture-services__item--active', open);
    el.trigger.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (!gsap || reduceMotion || !animate) {
      el.panel.style.height = open ? 'auto' : '0px';
      el.panel.style.opacity = open ? '1' : '0';

      if (gsap) {
        gsap.set(el.icon, { rotate: open ? 45 : 0 });
      } else if (el.icon) {
        el.icon.style.transform = open ? 'rotate(45deg)' : '';
      }

      return;
    }

    gsap.killTweensOf([el.panel, el.icon]);

    if (open) {
      gsap.fromTo(el.panel, { height: 0, opacity: 0 }, {
        height: 'auto',
        opacity: 1,
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: requestRefresh
      });
      gsap.to(el.icon, { rotate: 45, duration: 0.45, ease: 'power2.out' });
    } else {
      gsap.to(el.panel, {
        height: 0,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: requestRefresh
      });
      gsap.to(el.icon, { rotate: 0, duration: 0.45, ease: 'power2.out' });
    }
  }

  function toggle(item) {
    if (item === openItem) {
      setOpen(item, false, true);
      openItem = null;
      return;
    }

    if (openItem) setOpen(openItem, false, true);

    setOpen(item, true, true);
    openItem = item;
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('.architecture-services__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      toggle(item);
    });
  });

  var initial =
    items.filter(function (item) {
      return item.classList.contains('architecture-services__item--active');
    })[0] || items[0];

  openItem = initial;

  items.forEach(function (item) {
    setOpen(item, item === initial, false);
  });
})();
