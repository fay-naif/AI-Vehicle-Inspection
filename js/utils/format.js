/**
 * Formatting and timing helpers.
 */
window.VAI = window.VAI || {};

VAI.format = (() => {
  /**
   * Date and time in the user's language (Latin digits in Arabic, like the design).
   * @param {string} iso
   * @param {"ar" | "en"} lang
   * @returns {string}
   */
  function dateTime(iso, lang) {
    const locale = lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB";
    return new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  }

  /**
   * Promise that resolves after the given time.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return { dateTime, wait };
})();
