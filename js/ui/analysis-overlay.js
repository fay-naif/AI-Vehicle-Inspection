/**
 * Analysis overlay – the scanning animation and step list shown while a
 * photo is being analysed.
 */
window.VAI = window.VAI || {};

VAI.analysisOverlay = (() => {
  const { byId, qsa } = VAI.dom;

  /**
   * Walk through the step list over the given time.
   * @param {string} imageSrc photo shown under the scan line
   * @param {number} durationMs total time for all steps
   * @returns {Promise<void>}
   */
  async function play(imageSrc, durationMs) {
    const overlay = byId("analyzing");
    const steps = qsa("#analyzing-steps li");
    byId("scan-img").src = imageSrc;
    steps.forEach((li) => li.classList.remove("is-active", "is-done"));
    overlay.hidden = false;

    const perStep = durationMs / steps.length;
    for (const li of steps) {
      li.classList.add("is-active");
      await VAI.format.wait(perStep);
      li.classList.replace("is-active", "is-done");
    }
    overlay.hidden = true;
  }

  return { play };
})();
