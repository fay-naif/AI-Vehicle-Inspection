/**
 * Toast – a short message at the bottom of the screen.
 */
window.VAI = window.VAI || {};

VAI.toast = (() => {
  const VISIBLE_MS = 2200;
  let timer = null;

  /** @param {string} message */
  function show(message) {
    const el = VAI.dom.byId("toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), VISIBLE_MS);
  }

  return { show };
})();
