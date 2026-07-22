(() => {
  'use strict';

  const path = window.location.pathname;
  const isLanding = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('monnadesign');

  if (isLanding) {
    const replacements = new Map([
      ['#oferta', 'oferta.html'],
      ['#portfolio', 'realizacje.html'],
      ['#kontakt', 'kontakt.html']
    ]);

    document.querySelectorAll('a[href]').forEach((link) => {
      const replacement = replacements.get(link.getAttribute('href'));
      if (replacement) link.setAttribute('href', replacement);
    });
  }

  // Podstrony mają własny, lżejszy skrypt. Nie uruchamiamy drugi raz
  // obsługi menu, revealów i galerii ze strony głównej.
  if (!isLanding) return;

  const core = document.createElement('script');
  core.src = 'script-core.js?v=67.0.0';
  core.async = false;
  document.head.appendChild(core);
})();
