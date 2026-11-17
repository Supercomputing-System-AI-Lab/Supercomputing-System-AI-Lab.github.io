// Navbar burger toggle (the only script behaviour this page uses; the template's carousel,
// slider and interpolation preloading are left out because the page has none of them).
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.navbar-burger').forEach(function (burger) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-active');
      document.querySelectorAll('.navbar-menu').forEach(function (menu) {
        menu.classList.toggle('is-active');
      });
    });
  });
});
