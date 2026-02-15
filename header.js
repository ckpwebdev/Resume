(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  // Determine current page file name (e.g., "index.html")
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const links = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'resume.html', label: 'Resume/Certifications' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'contact.html', label: 'Contact' }
  ];

  const navLinks = links
    .map(link => {
      const isActive = page === '' ? link.href === 'index.html' : page === link.href;
      const activeClass = isActive ? ' class="active"' : '';
      return `<a href="${link.href}"${activeClass}>${link.label}</a>`;
    })
    .join('\n      ');

  header.innerHTML = `
    <div class="logo">
      <span class="logo-mark">CKP</span>
      <span class="logo-text">
        <span class="logo-name-row">
          <span class="logo-name">Christopher Pink</span>
          <span class="status-pill" title="Job search status">Actively seeking employment</span>
        </span>
        <span class="logo-tagline">Mobile &amp; Web Developer</span>
      </span>
    </div>

    <nav class="main-nav">
      ${navLinks}
    </nav>
  `;
})();
