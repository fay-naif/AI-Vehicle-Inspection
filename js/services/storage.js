/**
 * Storage – thin wrapper around localStorage with safe JSON parsing.
 * Everything stays on the user's device; nothing is sent anywhere.
 */
window.VAI = window.VAI || {};

VAI.storage = (() => {
  const PREFIX = "vai.";

  /**
   * @param {string} key
   * @param {*} [fallback] returned when the key is missing or unreadable
   */
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  /**
   * @param {string} key
   * @param {*} value any JSON-serialisable value
   */
  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      // Storage can be full or disabled (private mode) – the app still works.
    }
  }

  /** @param {string} key */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      // Same as above: nothing to do if storage is unavailable.
    }
  }

  /** Keep the latest reports (without the image data) for later reference. */
  function saveReport(report) {
    const list = get("reports", []);
    const { image, ...rest } = report;
    list.unshift(rest);
    set("reports", list.slice(0, 20));
  }

  return { get, set, remove, saveReport };
})();
