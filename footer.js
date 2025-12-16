(function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <p class="tech-footer">
      Written in HTML5, JavaScript &amp; CSS3
      <img src="footer-images/sm-html.png" alt="HTML5" class="tech-icon">
      <img src="footer-images/sm-java.png" alt="JavaScript" class="tech-icon">
      <img src="footer-images/sm-css.png" alt="CSS3" class="tech-icon">
      . Powered by VS Code &amp; GitHub 
      <img src="footer-images/sm-vscode.png" alt="Visual Studio Code" class="tech-icon">
      <img src="footer-images/sm-github.png" alt="GitHub" class="tech-icon">
      .
    </p>
    <p>&copy; ${year} Christopher Pink. All rights reserved.</p>
  `;
})();
