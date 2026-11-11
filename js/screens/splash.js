/**
 * Screen: splash – brand, hero art and the slide-to-start bar.
 */
window.VAI = window.VAI || {};
VAI.screens = VAI.screens || {};

VAI.screens.splash = (() => {
  function init() {
    const slider = VAI.slideToStart.create(VAI.dom.byId("slide-start"), {
      onComplete: () => VAI.router.go(VAI.auth.isSignedIn() ? "about" : "login"),
    });
    // Start from the rest position again whenever the language changes.
    VAI.i18n.onChange(slider.reset);
  }

  return { init };
})();
