(() => {
  'use strict';

  // Windows rasterizes the embedded social screenshot more aggressively than
  // macOS/iOS. The class lets CSS soften only that platform.
  document.documentElement.classList.toggle('is-windows', /Windows/i.test(navigator.userAgent));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    mobileMenu.hidden = !open;
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const frames = [...document.querySelectorAll('.hero__frame')];
  let frameIndex = 0;
  if (frames.length > 1 && !reducedMotion) {
    window.setInterval(() => {
      frames[frameIndex].classList.remove('is-active');
      frameIndex = (frameIndex + 1) % frames.length;
      frames[frameIndex].classList.add('is-active');
    }, 2700);
  }

  const revealItems = document.querySelectorAll('.reveal');
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 0.05, 0.25)}s`);
  });
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.07 });
    revealItems.forEach((item) => observer.observe(item));
    window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 2200);
  }

  const rotator = document.querySelector('[data-rotator]');
  const rotatorLines = rotator ? [...rotator.querySelectorAll('.studio-rotator__line')] : [];

  rotatorLines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.style.setProperty('--word-count', words.length);
    line.innerHTML = words.map((word, index) =>
      `<span class="studio-rotator__word" style="--word-index:${index}">${word}</span>`
    ).join(' ');
  });

  if (rotator) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => rotator.classList.add('is-ready'));
    });
  }

  if (rotatorLines.length > 1 && !reducedMotion) {
    let rotatorIndex = 0;
    let rotationTimer = null;

    const changeLine = () => {
      const current = rotatorLines[rotatorIndex];
      const nextIndex = (rotatorIndex + 1) % rotatorLines.length;
      const next = rotatorLines[nextIndex];

      current.classList.add('is-leaving');
      window.setTimeout(() => {
        current.classList.remove('is-active', 'is-leaving');
        next.classList.add('is-active');
        rotatorIndex = nextIndex;
      }, 520);
    };

    window.setTimeout(() => {
      rotationTimer = window.setInterval(changeLine, 3400);
    }, 1600);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rotationTimer) {
        window.clearInterval(rotationTimer);
        rotationTimer = null;
      } else if (!document.hidden && !rotationTimer) {
        rotationTimer = window.setInterval(changeLine, 3400);
      }
    });
  }


  // V24 keep landing accordions closed on first paint
  document.querySelectorAll('.service-item.is-open').forEach((item) => {
    item.classList.remove('is-open');
    item.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });

  const serviceItems = [...document.querySelectorAll('.service-item')];
  const measureService = (item) => {
    const panel = item.querySelector('.service-item__panel');
    if (!panel) return;
    panel.hidden = false;
    item.style.setProperty('--service-panel-height', `${panel.scrollHeight + 28}px`);
  };
  const closeService = (item) => {
    item.classList.remove('is-open');
    item.querySelector('button')?.setAttribute('aria-expanded', 'false');
  };
  const openService = (item) => {
    measureService(item);
    item.classList.add('is-open');
    item.querySelector('button')?.setAttribute('aria-expanded', 'true');
  };

  serviceItems.forEach((item) => {
    const button = item.querySelector('button');
    const panel = item.querySelector('.service-item__panel');
    if (!button || !panel) return;
    panel.hidden = false;
    measureService(item);
    button.addEventListener('click', () => {
      const opening = !item.classList.contains('is-open');
      serviceItems.forEach((other) => { if (other !== item) closeService(other); });
      if (opening) openService(item);
      else closeService(item);
    });
  });

  const marquee = document.querySelector('[data-project-marquee]');
  const rail = document.querySelector('[data-project-rail]');
  let resumeTimer = null;

  if (marquee && rail) {
    const originals = [...rail.children];
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      rail.appendChild(clone);
    });

    const measureMarquee = () => {
      if (!originals.length || window.innerWidth <= 820 || reducedMotion) {
        rail.classList.remove('is-running');
        return;
      }
      const first = originals[0];
      const firstClone = rail.children[originals.length];
      if (!first || !firstClone) return;
      const distance = firstClone.offsetLeft - first.offsetLeft;
      if (distance <= 0) return;
      rail.style.setProperty('--marquee-distance', `${distance}px`);
      rail.style.setProperty('--marquee-shift', `${-distance}px`);
      rail.style.setProperty('--marquee-duration', `${Math.max(34, distance / 48)}s`);
      rail.classList.remove('is-running');
      void rail.offsetWidth;
      rail.classList.add('is-running');
    };

    const pause = () => marquee.classList.add('is-paused');
    const resume = () => marquee.classList.remove('is-paused');

    marquee.addEventListener('pointerenter', pause);
    marquee.addEventListener('pointerleave', resume);
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', resume);
    marquee.addEventListener('touchstart', () => {
      pause();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(resume, 2600);
    }, { passive: true });

    window.requestAnimationFrame(measureMarquee);
    window.setTimeout(measureMarquee, 450);
    rail.querySelectorAll('img').forEach((image) => {
      image.addEventListener('load', measureMarquee, { once: true });
      image.addEventListener('error', measureMarquee, { once: true });
    });
    window.addEventListener('resize', () => window.requestAnimationFrame(measureMarquee), { passive: true });
  }

  const faqItems = [...document.querySelectorAll('.faq-list details')];
  const closeFaq = (details) => {
    details.classList.remove('is-open-v66');
    details.querySelector('summary')?.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!details.classList.contains('is-open-v66')) details.open = false;
    }, 440);
  };
  const openFaq = (details) => {
    const answer = details.querySelector('p');
    details.open = true;
    details.style.setProperty('--faq-panel-height', `${(answer?.scrollHeight || 0) + 28}px`);
    details.querySelector('summary')?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => requestAnimationFrame(() => details.classList.add('is-open-v66')));
  };

  faqItems.forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    details.open = false;
    summary.setAttribute('aria-expanded', 'false');
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (details.classList.contains('is-open-v66')) {
        closeFaq(details);
        return;
      }
      faqItems.forEach((other) => { if (other !== details && other.classList.contains('is-open-v66')) closeFaq(other); });
      openFaq(details);
    });
  });

  const galleries = {
    'ciechanow': {
      title: 'Ciechanów',
      images: [
        ['realizacja-ciechanow-01.webp', 'Salon z kuchnią i jadalnią w Ciechanowie']
      ]
    },
    'dom-bialoleka': {
      title: 'Dom Białołęka',
      images: [
        ['realizacja-dom-bialoleka-04.webp', 'Salon połączony z jadalnią w domu na Białołęce'],
        ['realizacja-dom-bialoleka-02.webp', 'Salon z jadalnią i kuchnią w domu na Białołęce'],
        ['realizacja-dom-bialoleka-03.webp', 'Kuchnia i jadalnia w domu na Białołęce'],
        ['realizacja-dom-bialoleka-01.webp', 'Sypialnia w domu na Białołęce']
      ]
    },
    'dom-ciechanow': {
      title: 'Dom Ciechanów',
      images: [
        ['realizacja-dom-ciechanow-02.webp', 'Kuchnia z wyspą w domu w Ciechanowie'],
        ['realizacja-dom-ciechanow-01.webp', 'Sypialnia w domu w Ciechanowie']
      ]
    },
    'dom-nasielsk': {
      title: 'Dom Nasielsk',
      images: [
        ['realizacja-dom-nasielsk-01.webp', 'Sypialnia ze skosami w domu w Nasielsku'],
        ['realizacja-dom-nasielsk-02.webp', 'Jasna sypialnia w domu w Nasielsku'],
        ['realizacja-dom-nasielsk-03.webp', 'Łazienka pod skosami w domu w Nasielsku']
      ]
    },
    'gabinet-stomatologiczny': {
      title: 'Gabinet stomatologiczny',
      images: [
        ['realizacja-gabinet-stomatologiczny-nowa-01.webp', 'Poczekalnia gabinetu stomatologicznego'],
        ['realizacja-gabinet-stomatologiczny-nowa-03.webp', 'Strefa oczekiwania w gabinecie stomatologicznym'],
        ['realizacja-gabinet-stomatologiczny-nowa-02.webp', 'Gabinet stomatologiczny']
      ]
    },
    'mieszkanie-ciechanow': {
      title: 'Mieszkanie Ciechanów',
      images: [
        ['realizacja-mieszkanie-ciechanow-01.webp', 'Salon z kuchnią w mieszkaniu w Ciechanowie'],
        ['realizacja-mieszkanie-ciechanow-02.webp', 'Łazienka w mieszkaniu w Ciechanowie']
      ]
    },
    'dom-przasnysz': {
      title: 'Dom Przasnysz',
      images: [
        ['realizacja-dom-przasnysz-01.webp', 'Salon z kuchnią w domu w Przasnyszu'],
        ['realizacja-dom-przasnysz-02.webp', 'Jadalnia i kuchnia w domu w Przasnyszu'],
        ['realizacja-dom-przasnysz-03.webp', 'Salon w domu w Przasnyszu']
      ]
    }
  };

  const dialog = document.querySelector('.gallery');
  const galleryImage = dialog?.querySelector('figure img');
  const galleryTitle = dialog?.querySelector('.gallery__title');
  const galleryCount = dialog?.querySelector('.gallery__count');
  let activeGallery = null;
  let activeImage = 0;

  const renderGallery = () => {
    if (!activeGallery || !galleryImage || !galleryTitle || !galleryCount) return;
    const [source, alt] = activeGallery.images[activeImage];
    galleryImage.classList.add('is-changing');
    window.setTimeout(() => {
      galleryImage.src = source;
      galleryImage.alt = alt;
      galleryTitle.textContent = `${activeGallery.title} — ${alt}`;
      galleryCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(activeGallery.images.length).padStart(2, '0')}`;
      galleryImage.onload = () => galleryImage.classList.remove('is-changing');
      galleryImage.onerror = () => galleryImage.classList.remove('is-changing');
    }, 90);
  };

  const openGallery = (key) => {
    if (!dialog || !galleries[key]) return;
    activeGallery = galleries[key];
    activeImage = 0;
    renderGallery();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.style.overflow = '';
  };

  const moveGallery = (direction) => {
    if (!activeGallery) return;
    activeImage = (activeImage + direction + activeGallery.images.length) % activeGallery.images.length;
    renderGallery();
  };

  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-project]');
    if (card) openGallery(card.dataset.project);
  });

  dialog?.querySelector('.gallery__close')?.addEventListener('click', closeGallery);
  dialog?.querySelector('.gallery__nav--prev')?.addEventListener('click', () => moveGallery(-1));
  dialog?.querySelector('.gallery__nav--next')?.addEventListener('click', () => moveGallery(1));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeGallery();
  });
  dialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeGallery();
  });

  window.addEventListener('keydown', (event) => {
    if (!dialog?.open) return;
    if (event.key === 'ArrowLeft') moveGallery(-1);
    if (event.key === 'ArrowRight') moveGallery(1);
    if (event.key === 'Escape') closeGallery();
  });

  let touchStartX = 0;
  dialog?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  dialog?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) moveGallery(delta > 0 ? -1 : 1);
  }, { passive: true });

  const parallaxAreas = document.querySelectorAll('[data-parallax-area]');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    parallaxAreas.forEach((area) => {
      let raf = null;
      const layers = [...area.querySelectorAll('[data-parallax]')];
      const update = (event) => {
        const rect = area.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5);
        const y = ((event.clientY - rect.top) / rect.height - 0.5);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          layers.forEach((layer) => {
            const depth = Number(layer.dataset.parallax || 0);
            layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
          });
        });
      };
      area.addEventListener('pointermove', update);
      area.addEventListener('pointerleave', () => {
        layers.forEach((layer) => { layer.style.transform = ''; });
      });
    });
  }

  const magneticTargets = document.querySelectorAll('.hero-btn, .line-link, .social-showcase__links a, .submit-btn');
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    magneticTargets.forEach((target) => {
      let raf = null;
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          target.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
      target.addEventListener('pointerleave', () => {
        target.style.transform = '';
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // V44 studio-only entry — soft hero reveal, no logo, intro only
  const initMajorEntryV25 = () => {
    const isStudioPage =
      !document.body.classList.contains('subpage') &&
      (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || document.querySelector('.hero'));

    const compactViewport = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    if (reducedMotion || compactViewport || !isStudioPage) {
      document.body.classList.add('entry-v25-finished');
      return;
    }

    const activeFrame =
      document.querySelector('.hero__frame.is-active img') ||
      document.querySelector('.hero__frame.is-active') ||
      document.querySelector('.hero__frame img') ||
      document.querySelector('main img');

    const source = activeFrame?.currentSrc || activeFrame?.src || 'hero-01.jpg';

    const gate = document.createElement('div');
    gate.className = 'premium-entry-v44';
    gate.style.setProperty('--entry-bg', `url("${source}")`);
    gate.innerHTML = `
      <div class="premium-entry-v44__image" aria-hidden="true"></div>
      <div class="premium-entry-v44__grain" aria-hidden="true"></div>
      <p class="premium-entry-v44__caption">Projektowanie wnętrz</p>`;

    document.body.classList.add('entry-v25-active');
    document.body.prepend(gate);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => gate.classList.add('is-ready'));
    });

    window.setTimeout(() => gate.classList.add('is-clear'), 720);
    window.setTimeout(() => gate.classList.add('is-leaving'), 1580);
    window.setTimeout(() => {
      gate.remove();
      document.body.classList.remove('entry-v25-active');
      document.body.classList.add('entry-v25-finished');
      window.dispatchEvent(new CustomEvent('monna:entry-complete'));
    }, 2520);
  };
  initMajorEntryV25();

  // V36 start notification — bottom right, subtle premium toast
  const initStartToastV36 = () => {
    if (reducedMotion || window.matchMedia('(max-width: 820px), (pointer: coarse)').matches) return;
    const isStudioPage =
      !document.body.classList.contains('subpage') &&
      (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html') || document.querySelector('.hero'));
    if (!isStudioPage) return;

    const toast = document.createElement('aside');
    toast.className = 'v36-start-toast';
    toast.innerHTML = `
      <button type="button" aria-label="Zamknij powiadomienie">×</button>
      <small>Projekt wnętrza</small>
      <strong>Masz mieszkanie lub dom do urządzenia?</strong>
      <p>Wyślij krótki opis, a wrócimy z uporządkowanym zakresem współpracy.</p>
      <a href="kontakt.html">Przejdź do briefu ↗</a>`;
    document.body.appendChild(toast);

    const show = () => toast.classList.add('is-visible');
    const hide = () => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 520);
    };

    toast.querySelector('button')?.addEventListener('click', hide);
    toast.querySelector('a')?.addEventListener('click', hide);
    window.setTimeout(show, 2300);
    window.setTimeout(() => {
      if (document.body.contains(toast)) hide();
    }, 9800);
  };
  initStartToastV36();


  // V46 contact form selects — replace native dropdown UI with clean custom controls
  const initContactSelectsV46 = () => {
    const forms = document.querySelectorAll('form.contact-form-v23');
    if (!forms.length) return;

    const closeAll = (except = null) => {
      document.querySelectorAll('.select-v46.is-open').forEach((box) => {
        if (box !== except) box.classList.remove('is-open');
      });
    };

    forms.forEach((form) => {
      const selects = form.querySelectorAll('select:not([data-v46-ready])');

      selects.forEach((select, index) => {
        const originalName = select.getAttribute('name') || `select-${index}`;
        const isRequired = select.hasAttribute('required');
        const idBase = `select-v46-${Math.random().toString(36).slice(2, 9)}`;
        const options = Array.from(select.options);

        const selectedOption = options.find((option) => option.selected && !option.disabled) || options.find((option) => !option.disabled);
        const placeholder = options.find((option) => option.disabled && option.selected)?.textContent?.trim() || options[0]?.textContent?.trim() || 'Wybierz';

        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = originalName;
        hidden.value = selectedOption?.value || '';
        hidden.dataset.required = isRequired ? 'true' : 'false';

        select.dataset.v46Ready = 'true';
        select.dataset.originalName = originalName;
        select.removeAttribute('name');
        select.removeAttribute('required');
        select.classList.add('select-v46-native');
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');

        const wrapper = document.createElement('div');
        wrapper.className = 'select-v46';
        wrapper.dataset.placeholder = placeholder;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'select-v46__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', `${idBase}-list`);
        trigger.innerHTML = `<span>${hidden.value ? selectedOption.textContent.trim() : placeholder}</span><i aria-hidden="true"></i>`;

        const list = document.createElement('div');
        list.className = 'select-v46__list';
        list.id = `${idBase}-list`;
        list.setAttribute('role', 'listbox');

        const update = (option) => {
          hidden.value = option.value || option.textContent.trim();
          select.value = option.value;
          trigger.querySelector('span').textContent = option.textContent.trim();
          wrapper.classList.toggle('has-value', Boolean(hidden.value));
          wrapper.classList.remove('is-invalid');
          list.querySelectorAll('[role="option"]').forEach((item) => {
            item.setAttribute('aria-selected', item.dataset.value === hidden.value ? 'true' : 'false');
          });
        };

        options.forEach((option) => {
          if (option.disabled && !option.value) return;

          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'select-v46__option';
          item.setAttribute('role', 'option');
          item.dataset.value = option.value || option.textContent.trim();
          item.textContent = option.textContent.trim();
          item.setAttribute('aria-selected', item.dataset.value === hidden.value ? 'true' : 'false');

          item.addEventListener('click', (event) => {
            event.preventDefault();
            update(option);
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus({ preventScroll:true });
          });

          list.appendChild(item);
        });

        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          const willOpen = !wrapper.classList.contains('is-open');
          closeAll(wrapper);
          wrapper.classList.toggle('is-open', willOpen);
          trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });

        trigger.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          }

          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            wrapper.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            list.querySelector('.select-v46__option')?.focus({ preventScroll:true });
          }
        });

        list.addEventListener('keydown', (event) => {
          const items = Array.from(list.querySelectorAll('.select-v46__option'));
          const current = items.indexOf(document.activeElement);
          if (event.key === 'Escape') {
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus({ preventScroll:true });
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            items[Math.min(current + 1, items.length - 1)]?.focus({ preventScroll:true });
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            items[Math.max(current - 1, 0)]?.focus({ preventScroll:true });
          }
        });

        select.insertAdjacentElement('afterend', wrapper);
        wrapper.append(trigger, list);
        wrapper.insertAdjacentElement('afterend', hidden);
      });

      form.addEventListener('submit', (event) => {
        const requiredFields = Array.from(form.querySelectorAll('input[type="hidden"][data-required="true"]'));
        const invalid = requiredFields.find((field) => !field.value);
        if (!invalid) return;

        event.preventDefault();
        const box = invalid.previousElementSibling;
        box?.classList.add('is-invalid');
        box?.querySelector('.select-v46__trigger')?.focus({ preventScroll:false });
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.select-v46')) closeAll();
    }, { passive:true });
  };
  initContactSelectsV46();

  const initFinalMotionV34 = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('motion-v34-ready');

    const cards = document.querySelectorAll('.v33-scope details, .v33-news-card, .project-card, .portfolio-card, .contact-card, .service-card');
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 10;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      }, { passive:true });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });

    document.querySelectorAll('.v33-scope details').forEach((item) => {
      const summary = item.querySelector('summary');
      if (!summary) return;
      summary.addEventListener('click', () => {
        requestAnimationFrame(() => {
          if (item.open) item.classList.add('is-opened-v34');
          else item.classList.remove('is-opened-v34');
        });
      });
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFinalMotionV34, { once:true });
  } else {
    initFinalMotionV34();
  }

})();


// V58 — social phone gap fix (accordion logic is owned by the V66 handler above)
(() => {
  const body = document.body;
  if (!body.classList.contains('page-v58')) return;

  // No parallax transform on phone — prevents flashing empty edge.
  const phone = document.querySelector('.social-phone');
  if (phone) {
    phone.removeAttribute('data-parallax');
    phone.style.transform = 'none';
  }

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      document.querySelectorAll('.service-item').forEach((item) => {
        const panel = item.querySelector('.service-item__panel');
        if (panel) item.style.setProperty('--service-panel-height', `${panel.scrollHeight + 28}px`);
      });
      [...document.querySelectorAll('.faq-list details')].filter((item) => item.classList.contains('is-open-v66')).forEach((item) => {
        const answer = item.querySelector('p');
        item.style.setProperty('--faq-panel-height', `${(answer?.scrollHeight || 0) + 28}px`);
      });
    });
  }, { passive: true });
})();
