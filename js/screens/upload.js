/**
 * Screen: upload – drag & drop, file picker and sample photos, with preview.
 */
window.VAI = window.VAI || {};
VAI.screens = VAI.screens || {};

VAI.screens.upload = (() => {
  const { byId, qsa } = VAI.dom;
  const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
  const MAX_BYTES = 10 * 1024 * 1024;

  let selected = null; // { src, hints }

  /**
   * Show a photo in the drop zone and enable "Analyze".
   * @param {string} src image URL or data: URL
   * @param {{vehicle?: "truck" | "car"}} [hints]
   */
  function setImage(src, hints = {}) {
    selected = { src, hints };
    byId("preview-img").src = src;
    byId("dropzone").classList.add("has-image");
    byId("analyze-btn").disabled = false;
    byId("choose-icon").src = "assets/icons/upload.svg";
    byId("upload-error").textContent = "";
  }

  /** Back to the empty state. */
  function clear() {
    selected = null;
    byId("preview-img").removeAttribute("src");
    byId("dropzone").classList.remove("has-image");
    byId("analyze-btn").disabled = true;
    byId("choose-icon").src = "assets/icons/plus.svg";
    byId("file-input").value = "";
  }

  /** Check a picked / dropped file and preview it. */
  async function useFile(file) {
    if (!file) return;
    const error = !ACCEPTED.includes(file.type) ? "upload.errType" : file.size > MAX_BYTES ? "upload.errSize" : null;
    if (error) {
      byId("upload-error").textContent = VAI.i18n.t(error);
      return;
    }
    setImage(await VAI.image.readAsDataUrl(file));
  }

  function bindDropzone() {
    const zone = byId("dropzone");
    const openPicker = () => byId("file-input").click();

    zone.addEventListener("click", (e) => {
      if (!zone.classList.contains("has-image") && !e.target.closest("button")) openPicker();
    });
    zone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    });
    ["dragenter", "dragover"].forEach((type) =>
      zone.addEventListener(type, (e) => {
        e.preventDefault();
        zone.classList.add("is-over");
      })
    );
    ["dragleave", "drop"].forEach((type) => zone.addEventListener(type, () => zone.classList.remove("is-over")));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      useFile(e.dataTransfer.files[0]);
    });

    byId("choose-btn").addEventListener("click", openPicker);
    byId("file-input").addEventListener("change", (e) => useFile(e.target.files[0]));
    byId("remove-img").addEventListener("click", (e) => {
      e.stopPropagation();
      clear();
    });
  }

  function bindSamples() {
    qsa("[data-sample]").forEach((btn) => {
      btn.addEventListener("click", () => setImage(btn.dataset.sample, { vehicle: btn.dataset.vehicle }));
    });
  }

  /**
   * @param {(selection: {src: string, hints: object}) => void} onAnalyze
   */
  function init(onAnalyze) {
    bindDropzone();
    bindSamples();
    byId("analyze-btn").addEventListener("click", () => {
      if (selected) onAnalyze(selected);
    });
  }

  return {
    init,
    clear,
    setImage,
    get selected() {
      return selected;
    },
  };
})();
