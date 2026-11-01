(function () {
  'use strict';

  var modal = document.getElementById('project-modal');
  if (!modal) return;

  var dialog = modal.querySelector('.project-modal__dialog');
  var closeButton = modal.querySelector('.project-modal__close');
  var titleElement = modal.querySelector('.project-modal__title');
  var subtitleElement = modal.querySelector('.project-modal__subtitle');
  var track = modal.querySelector('.project-modal__gallery-track');

  var fields = {};
  Array.prototype.forEach.call(
    modal.querySelectorAll('[data-project-field]'),
    function (element) {
      fields[element.getAttribute('data-project-field')] = element;
    }
  );

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lastFocused = null;
  var galleryTween = null;
  var isOpen = false;
  var downX = 0;
  var downY = 0;

  var originals = Array.prototype.slice.call(
    document.querySelectorAll('.projects-grid > .project-card')
  ).filter(function (card) {
    return card.getAttribute('aria-hidden') !== 'true';
  });

  originals.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');

    var heading = card.querySelector('h3');
    if (heading) {
      card.setAttribute('aria-label', 'Abrir detalhes do projeto ' + heading.textContent.trim());
    }
  });

  function getProject(card) {
    var heading = card.querySelector('h3');
    var subtitle = card.querySelector('p');

    return {
      title: heading ? heading.textContent.trim() : 'Projeto',
      subtitle: subtitle ? subtitle.textContent.trim() : ''
    };
  }

  function buildGallery(card) {
    track.innerHTML = '';

    if (galleryTween && galleryTween.kill) galleryTween.kill();
    galleryTween = null;

    if (window.gsap) gsap.set(track, { yPercent: 0 });

    var sources = (card.getAttribute('data-gallery') || '')
      .split(',')
      .map(function (source) { return source.trim(); })
      .filter(Boolean);

    if (!sources.length) {
      var cover = card.querySelector('.project-media img');
      if (cover) sources = [cover.getAttribute('src')];
    }

    if (!sources.length) return;

    for (var copy = 0; copy < 2; copy++) {
      var set = document.createElement('div');
      set.className = 'project-modal__gallery-set';
      if (copy === 1) set.setAttribute('aria-hidden', 'true');

      sources.forEach(function (source) {
        var slide = document.createElement('div');
        var image = document.createElement('img');

        slide.className = 'project-modal__gallery-slide';
        image.src = source;
        image.alt = '';
        image.decoding = 'async';

        slide.appendChild(image);
        set.appendChild(slide);
      });

      track.appendChild(set);
    }

    if (!reduceMotion && window.gsap) {
      galleryTween = gsap.to(track, {
        yPercent: -50,
        duration: Math.max(16, sources.length * 6),
        ease: 'none',
        repeat: -1
      });
    }
  }

  function open(card) {
    if (isOpen) return;

    isOpen = true;
    lastFocused = document.activeElement;

    var project = getProject(card);

    titleElement.textContent = project.title;
    subtitleElement.textContent = project.subtitle;

    ['location', 'year', 'area', 'type'].forEach(function (key) {
      if (fields[key]) {
        fields[key].textContent = card.getAttribute('data-' + key) || '—';
      }
    });

    buildGallery(card);

    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('project-modal-open');
    modal.classList.add('is-open');

    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;

    isOpen = false;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('project-modal-open');

    if (galleryTween && galleryTween.kill) galleryTween.kill();
    galleryTween = null;
    track.innerHTML = '';

    if (lastFocused && lastFocused.focus) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function trapFocus(event) {
    var focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusables.length) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('pointerdown', function (event) {
    downX = event.clientX;
    downY = event.clientY;
  }, true);

  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('[data-project-close]')) {
      close();
      return;
    }

    var card = event.target.closest && event.target.closest('.project-card');
    if (!card || isOpen) return;

    if (event.detail > 0) {
      var distance = Math.abs(event.clientX - downX) + Math.abs(event.clientY - downY);
      if (distance > 12) return;
    }

    open(card);
  });

  document.addEventListener('keydown', function (event) {
    if (isOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === 'Tab') trapFocus(event);
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;

    var active = document.activeElement;
    var card = active && active.closest ? active.closest('.project-card') : null;

    if (!card) return;

    event.preventDefault();
    open(card);
  });
})();
