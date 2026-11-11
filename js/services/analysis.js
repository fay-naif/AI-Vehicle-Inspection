/**
 * Analysis – turns a vehicle photo into an inspection result.
 *
 * A lightweight, deterministic engine: the same photo always gives the same
 * report, because any variation is seeded from the pixel data. It is a visual
 * estimate for demos and learning, not a trained model.
 *
 * @typedef {object} InspectionResult
 * @property {string} id        report id, e.g. "VAI-149689"
 * @property {string} date      ISO date of the inspection
 * @property {"truck" | "car"} vehicle
 * @property {number} score     overall condition, 0–100
 * @property {"excellent" | "good" | "fair"} grade
 * @property {{clarity: number, lighting: number, body: number, paint: number}} metrics
 * @property {string[]} notes   locale keys
 * @property {string[]} recs    locale keys
 */
window.VAI = window.VAI || {};

VAI.analysis = (() => {
  /**
   * Run the inspection.
   * @param {HTMLImageElement} img  a fully loaded image
   * @param {object} hints          optional { vehicle: "truck" | "car" }
   * @returns {InspectionResult}
   */
  function analyze(img, hints = {}) {
    const {
      clamp,
      hashPixels,
      seededRandom,
      readPixels,
      toGray,
      meanStd,
      sharpness,
      surfaceIrregularity,
      paintDifference,
      guessVehicle,
    } = VAI.imageMetrics;

    const pixels = readPixels(img);
    const { w, h } = pixels;
    const gray = toGray(pixels);
    const random = seededRandom(hashPixels(pixels.data));

    const light = meanStd(gray);
    const sharp = sharpness(gray, w, h);
    const irregular = surfaceIrregularity(gray, w, h);
    const paintDiff = paintDifference(pixels);

    const metrics = {
      clarity: Math.round(clamp(((sharp - 1) / 3) * 100)),
      lighting: Math.round(clamp(100 - (Math.abs(light.mean - 140) / 140) * 160)),
      body: Math.round(clamp(100 - Math.max(0, irregular - 0.2) * 250)),
      paint: Math.round(clamp(100 - Math.max(0, paintDiff - 30) * 0.25)),
    };

    const weighted =
      metrics.clarity * 0.25 + metrics.lighting * 0.2 + metrics.body * 0.35 + metrics.paint * 0.2;
    const jitter = Math.round(random() * 4 - 2);
    const score = Math.round(clamp(28 + weighted * 0.7 + jitter, 35, 98));

    const grade = score >= 85 ? "excellent" : score >= 70 ? "good" : "fair";

    // Notes: start with findings, then the always-useful suggestions.
    const notes = [];
    if (metrics.body >= 75) notes.push("note.noDamage");
    else notes.push("note.surfaceMarks");
    if (metrics.paint < 70) notes.push("note.paintUneven");
    if (metrics.lighting < 55) notes.push(light.mean < 140 ? "note.dark" : "note.bright");
    else notes.push("note.lightsOk");
    if (metrics.clarity < 50) notes.push("note.blurry");
    notes.push("note.rearPhoto");

    const recs = ["rec.quickCheck", "rec.tires"];
    if (metrics.body < 75) recs.unshift("rec.bodyShop");
    if (metrics.clarity < 50 || metrics.lighting < 55) recs.push("rec.retake");
    if (grade === "fair") recs.push("rec.service");

    return {
      id: `VAI-${(hashPixels(pixels.data) % 1e6).toString().padStart(6, "0")}`,
      date: new Date().toISOString(),
      vehicle: hints.vehicle || guessVehicle(gray, w, h),
      score,
      grade,
      metrics,
      notes,
      recs,
    };
  }

  /**
   * Analyse a selected photo. When the browser blocks reading pixels
   * (index.html opened from disk), the bundled sample photos fall back to
   * their stored results.
   * @param {{src: string, hints?: object}} selection
   * @returns {Promise<InspectionResult>}
   */
  async function inspect({ src, hints }) {
    const img = await VAI.image.load(src);
    try {
      return analyze(img, hints);
    } catch (err) {
      const preset = VAI.sampleResults[src];
      if (!preset) throw err;
      return { ...preset, date: new Date().toISOString() };
    }
  }

  return { analyze, inspect };
})();
