/**
 * Common actions – buttons that appear on several screens:
 * language toggle and plain "go to screen" links (data-goto).
 */
window.VAI = window.VAI || {};

VAI.commonActions = (() => {
  const { onAll } = VAI.dom;

  function init() {
    onAll('[data-action="toggle-lang"]', "click", () => {
      VAI.i18n.toggle();
      VAI.storage.set("lang", VAI.i18n.lang);
    });

    onAll("[data-goto]", "click", (event) => {
      const target = event.currentTarget.dataset.goto;
      if (target === "upload") VAI.screens.upload.clear();
      VAI.router.go(target);
    });
  }

  return { init };
})();
