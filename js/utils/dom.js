/**
 * DOM helpers shared by every module.
 */
window.VAI = window.VAI || {};

VAI.dom = (() => {
  /**
   * @param {string} id
   * @returns {HTMLElement | null}
   */
  const byId = (id) => document.getElementById(id);

  /**
   * @param {string} selector
   * @param {ParentNode} [root]
   * @returns {HTMLElement | null}
   */
  const qs = (selector, root = document) => root.querySelector(selector);

  /**
   * @param {string} selector
   * @param {ParentNode} [root]
   * @returns {HTMLElement[]}
   */
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  /**
   * Attach the same listener to every element that matches a selector.
   * @param {string} selector
   * @param {string} type
   * @param {(event: Event) => void} handler
   */
  function onAll(selector, type, handler) {
    qsa(selector).forEach((el) => el.addEventListener(type, handler));
  }

  return { byId, qs, qsa, onAll };
})();
