/**
 * Image helpers: loading images and reading picked files.
 */
window.VAI = window.VAI || {};

VAI.image = (() => {
  /**
   * Load an image and resolve once it can be drawn.
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  function load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Read a File as a data: URL.
   * @param {File} file
   * @returns {Promise<string>}
   */
  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return { load, readAsDataUrl };
})();
