(function () {
  var gsap = window.gsap;
  if (!gsap) return;

  var ScrollTrigger = window.ScrollTrigger;

  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasScroll = typeof ScrollTrigger === 'function';
  var hasSplit = typeof window.SplitText === 'function';

  var footerYear = document.querySelector('.vucko-footer__year');

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* =========================================
     PARTNERS — INFINITE RAIN
     ========================================= */

  var partnersLogos = document.querySelector('.partners-section__logos');
  var partnerColumns = [];

  if (partnersLogos) {
    partnerColumns = Array.prototype.slice.call(
      partnersLogos.querySelectorAll('.partners-section__column')
    );

    partnerColumns.forEach(function (column) {
      var originals = Array.prototype.slice.call(column.children);

      for (var copy = 0; copy < 3; copy++) {
        originals.forEach(function (logo) {
          var clone = logo.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          var image = clone.querySelector('img');
          if (image) image.setAttribute('alt', '');
          column.appendChild(clone);
        });
      }
    });

    if (!reduceMotion) {
      var rainDurations = [20, 26, 23];

      partnerColumns.forEach(function (column, index) {
        var period = 100 / 4;
        var start = -(period * (1 + index * (1 / 3)));
        var end = start + period;

        gsap.fromTo(column, { yPercent: start }, {
          yPercent: end,
          duration: rainDurations[index % rainDurations.length],
          ease: 'none',
          repeat: -1,
          delay: index * 0.6
        });
      });
    }
  }

  var hero = document.querySelector('.elevate-hero');
  var sectionTwo =
    (hero && hero.nextElementSibling) ||
    document.querySelector('.engineering-showcase') ||
    document.querySelector('.construction-section') ||
    document.querySelector('.vision-section');
  var vision = document.querySelector('.vision-section');

  if (reduceMotion) {
    if (hasScroll) ScrollTrigger.refresh();
    return;
  }

  /* =========================================
     HERO — INTRO
     ========================================= */

  if (hero) {
    var header = Array.prototype.slice.call(
      hero.querySelectorAll('.elevate-header > *')
    );
    var eyebrow = hero.querySelector('.elevate-eyebrow');
    var title = hero.querySelector('.elevate-title');
    var description = hero.querySelector('.elevate-description');
    var button = hero.querySelector('.elevate-button');
    var buttonIcon = hero.querySelector('.elevate-button__icon');
    var stats = Array.prototype.slice.call(hero.querySelectorAll('.elevate-stat'));
    var bgImage = hero.querySelector('.elevate-hero__background img');
    var content = hero.querySelector('.elevate-content');

    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (header.length) {
      intro.from(header, {
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1
      }, 0);
    }

    if (eyebrow) {
      intro.from(eyebrow, {
        y: 18,
        autoAlpha: 0,
        duration: 0.8
      }, 0.15);
    }

    if (title && hasSplit) {
      window.SplitText.create(title, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'hero-line',
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.15,
            ease: 'power4.out',
            stagger: 0.09,
            delay: 0.25
          });
        }
      });
    } else if (title) {
      intro.from(title, { y: 36, autoAlpha: 0, duration: 1 }, 0.25);
    }

    if (description && hasSplit) {
      window.SplitText.create(description, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 100,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.08,
            delay: 0.8
          });
        }
      });
    } else if (description) {
      intro.from(description, { y: 24, autoAlpha: 0, duration: 0.9 }, 0.55);
    }

    if (button) {
      intro.from(button, {
        y: 28,
        autoAlpha: 0,
        duration: 0.9
      }, 0.95);
    }

    if (buttonIcon) {
      gsap.to(buttonIcon, {
        y: -2,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2
      });
    }

    /* STATS — REVEAL + COUNTERS */

    function countUp(el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
      if (!match) return;

      var prefix = match[1];
      var number = match[2];
      var suffix = match[3];
      var decimals = number.indexOf(',') > -1 ? 1 : 0;
      var target = parseFloat(number.replace(/\./g, '').replace(',', '.'));
      if (!isFinite(target)) return;

      var state = { value: 0 };

      gsap.to(state, {
        value: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent =
            prefix + state.value.toFixed(decimals).replace('.', ',') + suffix;
        },
        onComplete: function () {
          el.textContent = raw;
        }
      });
    }

    if (stats.length) {
      intro.from(stats, {
        y: 42,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12
      }, 1.05);

      stats.forEach(function (stat) {
        var value = stat.querySelector('strong');
        if (!value) return;

        if (hasScroll) {
          ScrollTrigger.create({
            trigger: stat,
            start: 'top 96%',
            once: true,
            onEnter: function () {
              countUp(value);
            }
          });
        } else {
          countUp(value);
        }
      });
    }

    /* HERO — SCROLL PARALLAX */

    if (hasScroll && bgImage) {
      gsap.fromTo(bgImage, { scale: 1.12, yPercent: -2 }, {
        yPercent: 5,
        scale: 1.22,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    if (hasScroll && content) {
      gsap.to(content, {
        yPercent: -12,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '70% top',
          scrub: true
        }
      });
    }

    /* HERO — PIN + NEXT SECTION COVER */

    if (hasScroll) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      });

      if (vision) {
        var visionContainer = vision.querySelector('.vision-container');

        if (visionContainer) {
          gsap.fromTo(visionContainer, { yPercent: 10 }, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: vision,
              start: 'top bottom',
              end: 'top 30%',
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        }
      }

      if (sectionTwo) {
        var sectionContainer = sectionTwo.querySelector(
          '.showcase-top, .construction-container, .vision-container'
        );

        if (sectionContainer) {
          gsap.fromTo(sectionContainer, { yPercent: 8 }, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionTwo,
              start: 'top bottom',
              end: 'top 30%',
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        }
      }
    }
  }

  /* =========================================
     SECTION 2 — SCROLL EFFECTS
     ========================================= */

  if (sectionTwo) {
    var constructionHeading = sectionTwo.querySelector(
      '.showcase-intro h2, .construction-heading h2, .vision-heading h2'
    );
    var constructionParagraph = sectionTwo.querySelector(
      '.showcase-intro > p, .construction-heading p, .vision-description p'
    );
    var constructionVisual = sectionTwo.querySelector(
      '.showcase-main-image, .construction-visual'
    );
    var featureCards = Array.prototype.slice.call(
      sectionTwo.querySelectorAll('.benefit-card, .feature-card, .vision-partner')
    );
    var featuresWrap = sectionTwo.querySelector(
      '.showcase-benefits, .construction-features, .vision-partners'
    );
    var projectCards = Array.prototype.slice.call(
      sectionTwo.querySelectorAll('.project-card')
    );
    var projectsGrid = sectionTwo.querySelector('.projects-grid');
    var projectsViewport = sectionTwo.querySelector('.projects-viewport');
    var projectsReveal = projectsViewport || projectsGrid;
    var catalogHeader = sectionTwo.querySelector('.catalog-header');

    if (constructionHeading) {
      if (hasSplit && hasScroll) {
        window.SplitText.create(constructionHeading, {
          type: 'words',
          autoSplit: true,
          wordsClass: 'vision-word',
          onSplit: function (self) {
            return gsap.fromTo(self.words, { opacity: 0.16 }, {
              opacity: 1,
              ease: 'none',
              stagger: 0.12,
              scrollTrigger: {
                trigger: constructionHeading,
                start: 'top 85%',
                end: 'bottom 55%',
                scrub: true
              }
            });
          }
        });
      } else if (hasScroll) {
        gsap.from(constructionHeading, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: constructionHeading,
            start: 'top 90%',
            end: 'top 55%',
            scrub: true
          }
        });
      }
    }

    if (constructionParagraph) {
      if (hasSplit && hasScroll) {
        window.SplitText.create(constructionParagraph, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: function (self) {
            return gsap.from(self.lines, {
              yPercent: 100,
              autoAlpha: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: constructionParagraph,
                start: 'top 90%',
                end: 'top 55%',
                scrub: true
              }
            });
          }
        });
      } else if (hasScroll) {
        gsap.from(constructionParagraph, {
          y: 26,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: constructionParagraph,
            start: 'top 90%',
            end: 'top 55%',
            scrub: true
          }
        });
      }
    }

    if (constructionVisual && hasScroll) {
      gsap.from(constructionVisual, {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: constructionVisual,
          start: 'top 92%',
          end: 'top 55%',
          scrub: true
        }
      });
    }

    if (featureCards.length && hasScroll) {
      gsap.from(featureCards, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresWrap || featureCards[0],
          start: 'top 90%',
          end: 'top 45%',
          scrub: true
        }
      });
    }

    if (catalogHeader && hasScroll) {
      gsap.from(catalogHeader.children, {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: catalogHeader,
          start: 'top 92%',
          end: 'top 60%',
          scrub: true
        }
      });
    }

    if (projectsReveal && hasScroll) {
      gsap.from(projectsReveal, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: projectsGrid || projectCards[0],
          start: 'top 90%',
          end: 'top 50%',
          scrub: true
        }
      });
    } else if (projectCards.length && hasScroll) {
      gsap.from(projectCards, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: projectCards[0],
          start: 'top 90%',
          end: 'top 50%',
          scrub: true
        }
      });
    }
  }

  /* =========================================
     SERVICES — SCROLL EFFECTS
     ========================================= */

  var servicesSection = document.querySelector('.architecture-services');

  if (servicesSection && hasScroll) {
    var servicesEyebrow = servicesSection.querySelector(
      '.architecture-services__eyebrow'
    );
    var servicesHeading = servicesSection.querySelector(
      '.architecture-services__description'
    );
    var servicesList = servicesSection.querySelector(
      '.architecture-services__list'
    );
    var servicesItems = Array.prototype.slice.call(
      servicesSection.querySelectorAll('.architecture-services__item')
    );

    if (servicesEyebrow) {
      gsap.from(servicesEyebrow, {
        y: 18,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: servicesEyebrow,
          start: 'top 92%',
          end: 'top 70%',
          scrub: true
        }
      });
    }

    if (servicesHeading) {
      if (hasSplit) {
        window.SplitText.create(servicesHeading, {
          type: 'words',
          autoSplit: true,
          wordsClass: 'vision-word',
          onSplit: function (self) {
            return gsap.fromTo(self.words, { opacity: 0.16 }, {
              opacity: 1,
              ease: 'none',
              stagger: 0.08,
              scrollTrigger: {
                trigger: servicesHeading,
                start: 'top 85%',
                end: 'bottom 60%',
                scrub: true
              }
            });
          }
        });
      } else {
        gsap.from(servicesHeading, {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: servicesHeading,
            start: 'top 90%',
            end: 'top 60%',
            scrub: true
          }
        });
      }
    }

    if (servicesItems.length) {
      gsap.from(servicesItems, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: servicesList || servicesItems[0],
          start: 'top 90%',
          end: 'top 45%',
          scrub: true
        }
      });
    }


  }

  /* =========================================
     ABOUT — SCROLL EFFECTS
     ========================================= */

  var aboutSection = document.querySelector('.marwa-about');

  if (aboutSection && hasScroll) {
    var aboutLabel = aboutSection.querySelector('.marwa-about__label');
    var aboutHeading = aboutSection.querySelector('.marwa-about__heading');
    var aboutDescription = aboutSection.querySelector('.marwa-about__description');
    var aboutFeatures = Array.prototype.slice.call(
      aboutSection.querySelectorAll('.marwa-about__feature')
    );
    var aboutActions = aboutSection.querySelector('.marwa-about__actions');
    var aboutCards = Array.prototype.slice.call(
      aboutSection.querySelectorAll('.marwa-about__card')
    );
    var aboutStats = Array.prototype.slice.call(
      aboutSection.querySelectorAll('.marwa-about__stat')
    );

    if (aboutLabel) {
      gsap.from(aboutLabel, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutLabel,
          start: 'top 92%',
          end: 'top 70%',
          scrub: true
        }
      });
    }

    if (aboutHeading) {
      if (hasSplit) {
        window.SplitText.create(aboutHeading, {
          type: 'words',
          autoSplit: true,
          wordsClass: 'vision-word',
          onSplit: function (self) {
            return gsap.fromTo(self.words, { opacity: 0.16 }, {
              opacity: 1,
              ease: 'none',
              stagger: 0.06,
              scrollTrigger: {
                trigger: aboutHeading,
                start: 'top 88%',
                end: 'bottom 55%',
                scrub: true
              }
            });
          }
        });
      } else {
        gsap.from(aboutHeading, {
            autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: aboutHeading,
            start: 'top 90%',
            end: 'top 60%',
            scrub: true
          }
        });
      }
    }

    if (aboutDescription) {
      gsap.from(aboutDescription, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutDescription,
          start: 'top 92%',
          end: 'top 68%',
          scrub: true
        }
      });
    }

    if (aboutFeatures.length) {
      gsap.from(aboutFeatures, {
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutDescription || aboutFeatures[0],
          start: 'top 88%',
          end: 'top 60%',
          scrub: true
        }
      });
    }

    if (aboutActions) {
      gsap.from(aboutActions, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutActions,
          start: 'top 100%',
          end: 'top 80%',
          scrub: true
        }
      });
    }

    if (aboutCards.length) {
      gsap.from(aboutCards, {
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutSection.querySelector('.marwa-about__grid') || aboutCards[0],
          start: 'top 88%',
          end: 'top 40%',
          scrub: true
        }
      });
    }

    if (aboutStats.length) {
      gsap.from(aboutStats, {
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutSection.querySelector('.marwa-about__stats') || aboutStats[0],
          start: 'top 100%',
          end: 'top 82%',
          scrub: true
        }
      });
    }

  }



  /* =========================================
     SECTION COVER — same transition as home → section 2
     Each section holds its last screen while the next
     one slides over it.
     ========================================= */

  if (hasScroll) {
    [sectionTwo, servicesSection, aboutSection].forEach(function (section) {
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'bottom bottom',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      });
    });

    var partnersSection = document.querySelector('.partners-section');

    if (partnersSection) {
      ScrollTrigger.create({
        trigger: partnersSection,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      });
    }
  }

  if (hasScroll) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }

    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  }
})();
