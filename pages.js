(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
    window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 1800);
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const tiles = [...document.querySelectorAll('.project-tile[data-category]')];
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      tiles.forEach((tile) => {
        const show = value === 'all' || tile.dataset.category === value;
        tile.hidden = !show;
      });
    });
  });

  const lightbox = document.querySelector('.page-lightbox');
  const lightboxImage = lightbox?.querySelector('figure img');
  const lightboxTitle = lightbox?.querySelector('figcaption strong');
  const lightboxCount = lightbox?.querySelector('figcaption span');
  let items = [];
  let index = 0;
  const visibleTiles = () => tiles.filter((tile) => !tile.hidden);
  const render = () => {
    const item = items[index];
    if (!item || !lightboxImage || !lightboxTitle || !lightboxCount) return;
    lightboxImage.classList.add('is-changing');
    window.setTimeout(() => {
      lightboxImage.src = item.dataset.lightbox;
      lightboxImage.alt = item.dataset.title || '';
      lightboxTitle.textContent = item.dataset.title || '';
      lightboxCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      lightboxImage.onload = () => lightboxImage.classList.remove('is-changing');
      lightboxImage.onerror = () => lightboxImage.classList.remove('is-changing');
    }, 80);
  };
  const open = (tile) => {
    if (!lightbox) return;
    items = visibleTiles();
    index = Math.max(0, items.indexOf(tile));
    render();
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function') lightbox.close();
    else lightbox.removeAttribute('open');
    document.body.style.overflow = '';
  };
  const move = (direction) => {
    if (!items.length) return;
    index = (index + direction + items.length) % items.length;
    render();
  };
  tiles.forEach((tile) => tile.addEventListener('click', () => open(tile)));
  lightbox?.querySelector('.page-lightbox__close')?.addEventListener('click', close);
  lightbox?.querySelector('.page-lightbox__nav--prev')?.addEventListener('click', () => move(-1));
  lightbox?.querySelector('.page-lightbox__nav--next')?.addEventListener('click', () => move(1));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  lightbox?.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  window.addEventListener('keydown', (event) => {
    if (!lightbox?.open) return;
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.key === 'Escape') close();
  });

  if (!document.body.classList.contains('page-kontakt')) {
    document.querySelectorAll('.faq-list details').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        document.querySelectorAll('.faq-list details').forEach((other) => { if (other !== details) other.open = false; });
      });
    });
  }
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
  // V31: no entry animation on subpages.
  document.body.classList.add('entry-v25-finished');
const initBriefPopup = () => {
    if (window.localStorage?.getItem('monnaBriefPopupClosed') === '1') return;
    const popup = document.createElement('aside');
    popup.className = 'premium-brief-popup';
    popup.innerHTML = '<button type="button" aria-label="Zamknij">×</button><small>Brief</small><strong>Masz metraż i kilka zdjęć?</strong><p>Wyślij krótki opis, a wrócimy z uporządkowanym zakresem rozmowy.</p><a href="kontakt.html">Wyślij zapytanie ↗</a>';
    const show = () => popup.classList.add('is-visible');
    const hide = () => { popup.classList.remove('is-visible'); window.localStorage?.setItem('monnaBriefPopupClosed','1'); };
    popup.querySelector('button')?.addEventListener('click', hide);
    document.body.appendChild(popup);
    let triggered = false;
    const trigger = () => { if (triggered) return; triggered = true; show(); };
    window.setTimeout(trigger, 5200);
    window.addEventListener('scroll', () => { if (window.scrollY > window.innerHeight * 0.7) trigger(); }, { passive:true });
  };
  initBriefPopup();

  document.querySelectorAll('.scope-image-bars-v23 details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.scope-image-bars-v23 details').forEach((other) => { if (other !== details) other.open = false; });
    });
  });

  document.querySelectorAll('.scope-showcase-v24 details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.scope-showcase-v24 details').forEach((other) => { if (other !== details) other.open = false; });
    });
  });


  // V25 premium interactions: progress, magnetic buttons, scope/axis motion
  const initMajorInteractionsV25 = () => {
    document.body.classList.add('lux-v25-ready');

    const progress = document.createElement('div');
    progress.className = 'scroll-progress-v25';
    document.body.appendChild(progress);
    const updateProgress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });

    if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
      // V26: cursor glow removed. Magnetic interactions stay active.
const magnetSelectors = [
        '.hero-btn', '.header-cta', '.line-link', '.editorial-link', '.submit-btn',
        '.scope-showcase-v24 summary', '.scope-showcase-v24__panel a',
        '.process-orbit-v16__line article', '.contact-direct-v23 a', '.contact-socials-v21 a', '.contact-socials-v23 a', '.premium-brief-popup a'
      ].join(',');

      document.querySelectorAll(magnetSelectors).forEach((target) => {
        let raf = null;
        target.addEventListener('pointermove', (event) => {
          const rect = target.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
          target.style.setProperty('--mx', `${x.toFixed(3)}`);
          target.style.setProperty('--my', `${y.toFixed(3)}`);
          if (target.matches('.hero-btn, .header-cta, .line-link, .editorial-link, .submit-btn, .scope-showcase-v24__panel a, .contact-direct-v23 a, .contact-socials-v21 a, .contact-socials-v23 a')) {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              target.style.transform = `translate3d(${x * 10}px, ${y * 9}px, 0)`;
            });
          }
        });
        target.addEventListener('pointerleave', () => {
          target.style.removeProperty('--mx');
          target.style.removeProperty('--my');
          target.style.transform = '';
        });
      });
    }

    document.querySelectorAll('.scope-showcase-v24 details').forEach((details) => {
      const summary = details.querySelector('summary');
      summary?.setAttribute('aria-expanded', String(details.open));
      details.addEventListener('toggle', () => {
        summary?.setAttribute('aria-expanded', String(details.open));
        if (details.open) details.classList.add('has-opened');
      });
    });
  };
  initMajorInteractionsV25();



  // V34 final motion polish: progressive reveal, subtle parallax + details accessibility
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






// V61 — targeted fixes
(() => {
  const body = document.body;
  if (!body.classList.contains('page-v61')) return;

  // Oferta: zakres współpracy ma być cały czas rozwinięty i nieklikalny.
  if (body.classList.contains('page-oferta')) {
    document.querySelectorAll('.v33-scope details').forEach((details) => {
      details.open = true;
      details.classList.add('is-open-v61');
      const summary = details.querySelector('summary');
      const panel = details.querySelector('.v33-scope__panel');
      summary?.setAttribute('aria-expanded', 'true');
      if (panel) {
        panel.style.maxHeight = 'none';
        panel.style.opacity = '1';
      }

      summary?.addEventListener('click', (event) => {
        event.preventDefault();
        details.open = true;
      });

      details.addEventListener('toggle', () => {
        if (!details.open) details.open = true;
      });
    });
  }

  // Kontakt: strzałki/linkowe span-y nie biorą udziału w fokusie/czytnikach.
  if (body.classList.contains('page-kontakt')) {
    document.querySelectorAll('.contact-direct-v23 a span').forEach((span) => {
      span.setAttribute('aria-hidden', 'true');
    });
  }
})();


// V62 — contact FAQ smooth measured animation like homepage accordions
(() => {
  const body = document.body;
  if (!body.classList.contains('page-v62') || !body.classList.contains('page-kontakt') || body.classList.contains('page-v65')) return;

  const faqs = [...document.querySelectorAll('.faq-list--page details')];

  const openFaq = (details) => {
    const paragraph = details.querySelector('p');
    const summary = details.querySelector('summary');
    if (!paragraph) return;

    details.open = true;
    details.classList.add('is-open-v62');
    summary?.setAttribute('aria-expanded', 'true');

    paragraph.style.maxHeight = '0px';
    paragraph.style.opacity = '0';

    requestAnimationFrame(() => {
      paragraph.style.maxHeight = `${paragraph.scrollHeight + 34}px`;
      paragraph.style.opacity = '1';
    });
  };

  const closeFaq = (details) => {
    const paragraph = details.querySelector('p');
    const summary = details.querySelector('summary');
    if (!paragraph) return;

    paragraph.style.maxHeight = `${paragraph.scrollHeight + 34}px`;
    paragraph.style.opacity = '1';
    details.classList.remove('is-open-v62');
    summary?.setAttribute('aria-expanded', 'false');

    requestAnimationFrame(() => {
      paragraph.style.maxHeight = '0px';
      paragraph.style.opacity = '0';
    });

    window.setTimeout(() => {
      if (!details.classList.contains('is-open-v62')) {
        details.open = false;
      }
    }, 420);
  };

  faqs.forEach((details) => {
    const summary = details.querySelector('summary');
    const paragraph = details.querySelector('p');
    if (!summary || !paragraph) return;

    summary.setAttribute('aria-expanded', String(details.open));
    paragraph.style.maxHeight = details.open ? `${paragraph.scrollHeight + 34}px` : '0px';
    paragraph.style.opacity = details.open ? '1' : '0';

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (details.classList.contains('is-open-v62') || details.open) {
        closeFaq(details);
      } else {
        faqs.forEach((other) => {
          if (other !== details && (other.classList.contains('is-open-v62') || other.open)) closeFaq(other);
        });
        openFaq(details);
      }
    });
  });

  window.addEventListener('resize', () => {
    faqs.forEach((details) => {
      const paragraph = details.querySelector('p');
      if (paragraph && (details.open || details.classList.contains('is-open-v62'))) {
        paragraph.style.maxHeight = `${paragraph.scrollHeight + 34}px`;
      }
    });
  }, { passive: true });
})();


// V65 — contact FAQ: one animation owner, immune to older !important rules
(() => {
  const body = document.body;
  if (!body.classList.contains('page-v65') || !body.classList.contains('page-kontakt')) return;

  const items = [...document.querySelectorAll('.faq-list--page details')];
  const duration = 520;

  const setHeight = (item) => {
    const panel = item.querySelector('p');
    if (!panel) return;
    item.style.setProperty('--faq-height', `${panel.scrollHeight + 34}px`);
  };

  const openItem = (item) => {
    const summary = item.querySelector('summary');
    item.open = true;
    setHeight(item);
    summary?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => item.classList.add('is-open-v65'));
    });
  };

  const closeItem = (item) => {
    const summary = item.querySelector('summary');
    setHeight(item);
    summary?.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open-v65');
    window.setTimeout(() => {
      if (!item.classList.contains('is-open-v65')) item.open = false;
    }, duration);
  };

  items.forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;

    item.classList.remove('is-open-v62');
    summary.setAttribute('aria-expanded', 'false');
    item.open = false;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (item.classList.contains('is-open-v65')) {
        closeItem(item);
        return;
      }
      items.forEach((other) => {
        if (other !== item && other.classList.contains('is-open-v65')) closeItem(other);
      });
      openItem(item);
    });
  });

  window.addEventListener('resize', () => {
    items.filter((item) => item.classList.contains('is-open-v65')).forEach(setHeight);
  }, { passive: true });
})();
