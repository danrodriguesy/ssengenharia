(function () {
  var root = document.querySelector('.projects-catalog');
  if (!root) return;

  var viewport = root.querySelector('.projects-viewport');
  var track = root.querySelector('.projects-grid');
  var arrows = root.querySelectorAll('.catalog-arrows button');

  if (!viewport || !track) return;

  var originals = Array.prototype.slice.call(track.children);
  var count = originals.length;
  if (count < 2) return;

  var gsap = window.gsap;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var i;

  for (i = 0; i < count; i++) {
    var nextClone = originals[i].cloneNode(true);
    nextClone.setAttribute('aria-hidden', 'true');
    track.appendChild(nextClone);
  }

  for (i = count - 1; i >= 0; i--) {
    var prevClone = originals[i].cloneNode(true);
    prevClone.setAttribute('aria-hidden', 'true');
    track.insertBefore(prevClone, track.firstChild);
  }

  var slides = Array.prototype.slice.call(track.children);
  var position = count;
  var step = 0;
  var normalizeTimer = 0;

  function measure() {
    var first = track.children[0];
    if (!first) return;

    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    var transform = window.getComputedStyle(first).transform;
    var scale = 1;

    if (transform && transform !== 'none') {
      var match = transform.match(/matrix\(([^,]+)/);
      if (match) scale = parseFloat(match[1]) || 1;
    }

    step = first.getBoundingClientRect().width / scale + gap;
  }

  function paintDepth() {
    if (!gsap || reduceMotion) return;

    var x = parseFloat(gsap.getProperty(track, 'x')) || 0;

    slides.forEach(function (card, index) {
      var offset = (x + index * step) / step;
      var focus = Math.max(0, Math.min(1, 1 - Math.abs(offset)));
      var image = card.querySelector('.project-media > img');

      if (image) {
        gsap.set(image, {
          scale: 1 + 0.12 * focus,
          filter: 'brightness(' + (0.9 + 0.1 * focus).toFixed(3) + ')'
        });
      }

      gsap.set(card, {
        boxShadow:
          '0 ' + (10 * focus).toFixed(1) + 'px ' +
          (24 * focus).toFixed(1) + 'px rgba(0, 0, 0, ' +
          (0.18 * focus).toFixed(3) + ')',
        zIndex: Math.round(1 + focus * 10)
      });
    });
  }

  function render(animate) {
    var x = -position * step;

    if (!gsap || reduceMotion || !animate) {
      if (gsap) {
        gsap.set(track, { x: x });
      } else {
        track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
      }
      paintDepth();
      return;
    }

    gsap.to(track, {
      x: x,
      duration: animate ? 0.7 : 0,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: paintDepth
    });
  }

  function normalize() {
    if (position >= count * 2 || position < count) {
      position = ((position % count) + count) % count + count;
      render(false);
    }
  }

  function moveBy(delta) {
    position += delta;

    render(true);

    window.clearTimeout(normalizeTimer);
    normalizeTimer = window.setTimeout(normalize, reduceMotion ? 0 : 720);
  }

  function layout() {
    measure();
    render(false);
  }

  layout();

  if (arrows.length) {
    arrows[0].addEventListener('click', function () {
      moveBy(-1);
    });

    arrows[1].addEventListener('click', function () {
      moveBy(1);
    });
  }

  /* Swipe / drag */

  var startX = 0;
  var startY = 0;
  var tracking = false;

  viewport.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointerup', function (event) {
    if (!tracking) return;

    tracking = false;
    viewport.classList.remove('is-dragging');

    var dx = event.clientX - startX;
    var dy = event.clientY - startY;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      moveBy(dx < 0 ? 1 : -1);
    }
  });

  viewport.addEventListener('pointercancel', function () {
    tracking = false;
    viewport.classList.remove('is-dragging');
  });

  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }
})();
