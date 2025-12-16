(function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <p class="tech-footer">
      Built with
      <span class="tech-stack">
        HTML5
        <img src="footer-images/sm-html.png" alt="HTML5" class="tech-icon">
        , JavaScript
        <img src="footer-images/sm-java.png" alt="JavaScript" class="tech-icon">
        &amp; CSS3
        <img src="footer-images/sm-css.png" alt="CSS3" class="tech-icon">
      </span>
      using
      <span class="tech-tools">
        Visual Studio Code
        <img src="footer-images/sm-vscode.png" alt="Visual Studio Code" class="tech-icon">
        &amp; GitHub
        <img src="footer-images/sm-github.png" alt="GitHub" class="tech-icon">
      </span>
      .
    </p>
    <p>&copy; ${year} Christopher Pink. All rights reserved.</p>
  `;
})();
