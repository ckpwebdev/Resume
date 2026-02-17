(function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <p class="tech-footer">
      Built with
      <span class="tech-stack">
        HTML5
        <img src="footer-images/sm-html.png" alt="" aria-hidden="true" class="tech-icon" loading="lazy" width="16" height="16">
        , JavaScript
        <img src="footer-images/sm-java.png" alt="" aria-hidden="true" class="tech-icon" loading="lazy" width="16" height="16">
        &amp; CSS3
        <img src="footer-images/sm-css.png" alt="" aria-hidden="true" class="tech-icon" loading="lazy" width="16" height="16">
      </span>
      using
      <span class="tech-tools">
        Visual Studio Code
        <img src="footer-images/sm-vscode.png" alt="" aria-hidden="true" class="tech-icon" loading="lazy" width="16" height="16">
        &amp; GitHub
        <img src="footer-images/sm-github.png" alt="" aria-hidden="true" class="tech-icon" loading="lazy" width="16" height="16">
      </span>
      .
    </p>
    <p>&copy; ${year} Christopher Pink. All rights reserved.</p>
  `;
})();
