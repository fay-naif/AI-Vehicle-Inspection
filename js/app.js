/**
 * App entry point – wires services, components and screens together.
 * Flow: splash → login → about → upload → (analysis) → report
 */
(() => {
  const ANALYSIS_TIME_MS = 2400;
  const { screens } = VAI;

  /** Run the analysis and the overlay animation side by side, then show the report. */
  async function analyze(selection) {
    const [result] = await Promise.all([
      VAI.analysis.inspect(selection),
      VAI.analysisOverlay.play(selection.src, ANALYSIS_TIME_MS),
    ]);
    screens.report.show({ ...result, image: selection.src });
  }

  /** Screens that need a signed-in user, and the report that needs a result. */
  function addRouteGuards() {
    const needsAuth = ["about", "upload", "report"];
    VAI.router.addGuard((name) => (needsAuth.includes(name) && !VAI.auth.isSignedIn() ? "login" : null));
    VAI.router.addGuard((name) => (name === "report" && !screens.report.current ? "upload" : null));
    VAI.router.addGuard((name) => (name === "login" && VAI.auth.isSignedIn() ? "about" : null));
    VAI.router.addGuard((name) => (document.querySelector(`[data-screen="${name}"]`) ? null : "splash"));
  }

  function renderFooter() {
    VAI.dom.byId("app-footer").textContent = VAI.i18n.t("footer", { year: new Date().getFullYear() });
  }

  function init() {
    const params = new URLSearchParams(location.search);
    VAI.i18n.onChange(renderFooter);
    VAI.i18n.setLang(params.get("lang") || VAI.storage.get("lang", "ar"));

    VAI.pwa.init();
    VAI.installButton.init();
    VAI.commonActions.init();

    screens.splash.init();
    screens.login.init();
    screens.about.init();
    screens.upload.init(analyze);
    screens.report.init();

    addRouteGuards();
    VAI.router.start("splash");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
