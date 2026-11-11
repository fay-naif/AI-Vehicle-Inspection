/**
 * Router – shows one screen at a time and keeps the browser history in step,
 * so the system back button / gesture moves between screens like a native app.
 */
window.VAI = window.VAI || {};

VAI.router = (() => {
  const { byId, qsa } = VAI.dom;
  const guards = [];
  let current = null;

  /**
   * Register a guard that may redirect a navigation.
   * @param {(name: string) => string | null} guard returns another screen name, or null to allow
   */
  function addGuard(guard) {
    guards.push(guard);
  }

  /** Run every guard and return the screen we are actually allowed to open. */
  function resolve(name) {
    for (const guard of guards) {
      const redirect = guard(name);
      if (redirect && redirect !== name) return resolve(redirect);
    }
    return name;
  }

  /** Swap the visible screen, with a forward or backward transition. */
  function render(name, isBack) {
    const app = byId("app");
    app.classList.toggle("is-going-back", isBack);
    qsa(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === name));
    current = name;
    // Inside the desktop phone frame the app box is the scroll area.
    app.scrollTop = 0;
    window.scrollTo({ top: 0 });
  }

  /**
   * Open a screen.
   * @param {string} name screen name (data-screen)
   * @param {{replace?: boolean}} [options] replace the history entry instead of adding one
   */
  function go(name, { replace = false } = {}) {
    const target = resolve(name);
    if (target === current) return;
    const state = { screen: target };
    if (replace || current === null) history.replaceState(state, "", `#${target}`);
    else history.pushState(state, "", `#${target}`);
    render(target, false);
  }

  /** Go one step back, or home when there is nothing to go back to. */
  function back() {
    if (history.state && history.length > 1) history.back();
    else go("about", { replace: true });
  }

  /**
   * Start listening to back / forward and open the first screen.
   * @param {string} initial screen to show when the URL names none
   */
  function start(initial) {
    window.addEventListener("popstate", (event) => {
      const wanted = (event.state && event.state.screen) || location.hash.slice(1) || initial;
      const target = resolve(wanted);
      if (target !== wanted) history.replaceState({ screen: target }, "", `#${target}`);
      render(target, true);
    });
    go(location.hash.slice(1) || initial, { replace: true });
  }

  return {
    addGuard,
    go,
    back,
    start,
    get current() {
      return current;
    },
  };
})();
