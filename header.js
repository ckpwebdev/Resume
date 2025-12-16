(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const links = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'resume.html', label: 'Resume' },
    { href: 'contact.html', label: 'Contact' }
  ];

  const navLinks = links.map(link => {
    const isActive = page === '' ? link.href === 'index.html' : page === link.href;
    const activeClass = isActive ? ' class="active"' : '';
    return `<a href="${link.href}"${activeClass}>${link.label}</a>`;
  }).join('\n      ');

  header.innerHTML = `
    <div class="logo">Christopher Pink - Mobile &amp; Web Developer</div>
    <nav class="main-nav">
      ${navLinks}
    </nav>
  `;
})();
