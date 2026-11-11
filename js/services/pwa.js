/**
 * PWA – service worker registration and the "install app" prompt.
 *
 * The service worker is only registered over http(s); opening index.html
 * straight from disk keeps working as a normal page.
 */
window.VAI = window.VAI || {};

VAI.pwa = (() => {
  let deferredPrompt = null;
  const listeners = [];

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  /** iPhone / iPad Safari has no install prompt; users add the app from the Share menu. */
  const isIos = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const notify = () => listeners.forEach((fn) => fn(canInstall()));

  /** @returns {boolean} true when an install button makes sense right now */
  const canInstall = () => !isStandalone() && (deferredPrompt !== null || isIos());

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        // Offline support is a bonus; the app works without it.
      });
    });
  }

  /**
   * Show the browser's install dialog.
   * @returns {Promise<"accepted" | "dismissed" | "ios-hint">}
   */
  async function promptInstall() {
    if (!deferredPrompt) return "ios-hint";
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return outcome;
  }

  /** @param {(installable: boolean) => void} fn */
  function onAvailabilityChange(fn) {
    listeners.push(fn);
    fn(canInstall());
  }

  function init() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault(); // we show our own button instead of the mini-infobar
      deferredPrompt = event;
      notify();
    });
    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      notify();
    });
    document.documentElement.classList.toggle("is-standalone", isStandalone());
    registerServiceWorker();
  }

  return { init, canInstall, promptInstall, onAvailabilityChange, isStandalone };
})();
