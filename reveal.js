(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.card, .cert-panel, .page-header');

  items.forEach(el => el.classList.add('reveal'));

  if (reduced) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  items.forEach(el => obs.observe(el));
})();
