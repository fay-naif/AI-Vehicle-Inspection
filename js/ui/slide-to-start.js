/**
 * Slide-to-start – a "slide to unlock" style control.
 *
 * Drag the knob to the far end (mouse or touch), or tap / press Enter.
 * At the end the bar turns green and shows a tick, then onComplete runs.
 * The knob always travels left → right, in Arabic and English alike.
 */
window.VAI = window.VAI || {};

VAI.slideToStart = (() => {
  const COMPLETE_AT = 0.6; // released past 60% of the way, it finishes by itself
  const HOLD_MS = 650; // let the green state show before moving on
  const TAP_PX = 6; // anything shorter counts as a tap

  /**
   * @param {HTMLElement} bar the .slide-start element
   * @param {{onComplete: () => void}} options
   * @returns {{reset: () => void}}
   */
  function create(bar, { onComplete }) {
    const knob = bar.querySelector(".slide-start__knob");
    let startX = null;
    let moved = 0;
    let completed = false;

    const gap = () => parseFloat(getComputedStyle(bar).getPropertyValue("--gap")) || 7;
    const maxTravel = () => bar.clientWidth - knob.offsetWidth - gap() * 2;

    /** Move the knob (CSS reads --travel and --progress). */
    function setTravel(px) {
      moved = px;
      const max = maxTravel();
      bar.style.setProperty("--travel", `${px}px`);
      bar.style.setProperty("--progress", max > 0 ? (px / max).toFixed(3) : 0);
    }

    function reset() {
      completed = false;
      bar.classList.remove("is-complete", "is-dragging");
      bar.setAttribute("aria-pressed", "false");
      setTravel(0);
    }

    function complete() {
      if (completed) return;
      completed = true;
      bar.classList.remove("is-dragging");
      setTravel(maxTravel());
      bar.classList.add("is-complete");
      bar.setAttribute("aria-pressed", "true");
      navigator.vibrate?.(15);
      setTimeout(() => {
        onComplete();
        setTimeout(reset, 400); // ready again if the user comes back
      }, HOLD_MS);
    }

    bar.addEventListener("pointerdown", (e) => {
      if (completed || e.button > 0) return;
      startX = e.clientX;
      moved = 0;
      bar.classList.add("is-dragging");
      bar.setPointerCapture(e.pointerId);
    });

    bar.addEventListener("pointermove", (e) => {
      if (startX === null || completed) return;
      setTravel(Math.max(0, Math.min(maxTravel(), e.clientX - startX)));
      if (moved >= maxTravel() - 1) {
        startX = null;
        complete();
      }
    });

    const release = (e) => {
      if (startX === null) return;
      startX = null;
      bar.classList.remove("is-dragging");
      const isTap = e.type === "pointerup" && moved < TAP_PX;
      if (isTap || moved > maxTravel() * COMPLETE_AT) complete();
      else setTravel(0); // not far enough: slide back
    };
    bar.addEventListener("pointerup", release);
    bar.addEventListener("pointercancel", release);

    bar.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        complete();
      }
    });

    window.addEventListener("resize", () => !completed && setTravel(0));
    return { reset };
  }

  return { create };
})();
