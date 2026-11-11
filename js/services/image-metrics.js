/**
 * Image metrics – the low-level measurements behind the inspection.
 *
 * Each function works on a small grey-scale copy of the photo drawn on a
 * <canvas>. They are plain heuristics (no trained model).
 */
window.VAI = window.VAI || {};

VAI.imageMetrics = (() => {
  const SAMPLE_WIDTH = 400;

  /** Keep a value inside [min, max]. */
  const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

  /** FNV-1a hash of the pixel buffer, used as a seed. */
  function hashPixels(data) {
    let h = 0x811c9dc5;
    for (let i = 0; i < data.length; i += 16) {
      h ^= data[i];
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** Small seeded PRNG (mulberry32). */
  function seededRandom(seed) {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Draw the image onto a small canvas and return its pixels. */
  function readPixels(img) {
    const ratio = img.naturalHeight / img.naturalWidth || 0.6;
    const w = SAMPLE_WIDTH;
    const h = Math.max(40, Math.round(w * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    return { w, h, data: ctx.getImageData(0, 0, w, h).data };
  }

  /** Luminance (0–255) of every pixel. */
  function toGray({ w, h, data }) {
    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; p < gray.length; i += 4, p++) {
      gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
  }

  /** Mean and standard deviation of a list of numbers. */
  function meanStd(values) {
    let sum = 0;
    for (const v of values) sum += v;
    const mean = sum / values.length;
    let sq = 0;
    for (const v of values) sq += (v - mean) ** 2;
    return { mean, std: Math.sqrt(sq / values.length) };
  }

  /** Mean absolute Laplacian – a classic sharpness/focus measure. */
  function sharpness(gray, w, h) {
    let total = 0;
    let count = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
        total += Math.abs(lap);
        count++;
      }
    }
    return total / count;
  }

  /**
   * Surface irregularity inside the central band (where the body usually is):
   * share of small blocks whose local contrast is far above the median.
   */
  function surfaceIrregularity(gray, w, h) {
    const block = 8;
    const y0 = Math.round(h * 0.3);
    const y1 = Math.round(h * 0.75);
    const x0 = Math.round(w * 0.12);
    const x1 = Math.round(w * 0.88);
    const scores = [];
    for (let by = y0; by + block <= y1; by += block) {
      for (let bx = x0; bx + block <= x1; bx += block) {
        const cells = [];
        for (let y = by; y < by + block; y++) {
          for (let x = bx; x < bx + block; x++) cells.push(gray[y * w + x]);
        }
        scores.push(meanStd(cells).std);
      }
    }
    if (!scores.length) return 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 1;
    const outliers = scores.filter((s) => s > median * 2.6 + 6).length;
    return outliers / scores.length;
  }

  /** Colour difference between the left and right halves of the body band. */
  function paintDifference({ w, h, data }) {
    const half = (fromX, toX) => {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = Math.round(h * 0.35); y < Math.round(h * 0.7); y++) {
        for (let x = fromX; x < toX; x++) {
          const i = (y * w + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
      }
      return [r / n, g / n, b / n];
    };
    const a = half(Math.round(w * 0.15), Math.round(w * 0.5));
    const b = half(Math.round(w * 0.5), Math.round(w * 0.85));
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }

  /** Rough guess of vehicle type from the shape of the busy (edge) area. */
  function guessVehicle(gray, w, h) {
    const rows = new Array(h).fill(0);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const g = Math.abs(gray[i + 1] - gray[i - 1]) + Math.abs(gray[i + w] - gray[i - w]);
        if (g > 40) rows[y]++;
      }
    }
    const active = rows.map((r, y) => (r > w * 0.08 ? y : -1)).filter((y) => y >= 0);
    if (!active.length) return "car";
    const span = (active[active.length - 1] - active[0]) / h;
    return span > 0.5 ? "truck" : "car";
  }

  return {
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
  };
})();
