/**
 * i18n – tiny translation helper with RTL / LTR switching.
 * Strings are edited in locales/*.json and bundled into
 * js/generated/locales.js (see scripts/build-locales.mjs).
 */
window.VAI = window.VAI || {};

VAI.i18n = (() => {
  const DEFAULT_LANG = "ar";
  const RTL_LANGS = ["ar"];
  let current = DEFAULT_LANG;
  const listeners = [];

  /**
   * Translate a key, replacing {placeholders} with values from params.
   * @param {string} key
   * @param {Record<string, string | number>} [params]
   * @returns {string}
   */
  function t(key, params = {}) {
    const table = VAI.locales[current] || {};
    const fallback = VAI.locales[DEFAULT_LANG] || {};
    let text = table[key] ?? fallback[key] ?? key;
    Object.keys(params).forEach((name) => {
      text = text.replace(`{${name}}`, params[name]);
    });
    return text;
  }

  /**
   * Fill every element marked with data-i18n / data-i18n-aria.
   * @param {ParentNode} [root]
   */
  function applyToDom(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
  }

  /**
   * Switch language, text direction and every translated string.
   * @param {string} lang "ar" or "en"
   */
  function setLang(lang) {
    current = VAI.locales[lang] ? lang : DEFAULT_LANG;
    const html = document.documentElement;
    html.lang = current;
    html.dir = RTL_LANGS.includes(current) ? "rtl" : "ltr";
    document.title = `${t("meta.title")} | AI Vehicle Inspection`;
    applyToDom();
    listeners.forEach((fn) => fn(current));
  }

  return {
    t,
    setLang,
    applyToDom,
    get lang() {
      return current;
    },
    /** Switch between Arabic and English. */
    toggle() {
      setLang(current === "ar" ? "en" : "ar");
    },
    /** @param {(lang: string) => void} fn called after every language change */
    onChange(fn) {
      listeners.push(fn);
    },
  };
})();
