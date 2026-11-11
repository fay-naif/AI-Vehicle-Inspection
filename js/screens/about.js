/**
 * Screen: about the system – feature overview and sign out.
 */
window.VAI = window.VAI || {};
VAI.screens = VAI.screens || {};

VAI.screens.about = (() => {
  function signOut() {
    VAI.auth.signOut();
    VAI.screens.login.setMode("login");
    VAI.router.go("login", { replace: true });
  }

  function init() {
    VAI.dom.qs('[data-action="logout"]').addEventListener("click", signOut);
  }

  return { init };
})();
