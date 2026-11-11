/**
 * Screen: report – renders an inspection result and handles print / share / save.
 */
window.VAI = window.VAI || {};
VAI.screens = VAI.screens || {};

VAI.screens.report = (() => {
  const { byId: $, qs } = VAI.dom;
  const SCORE_COLORS = { excellent: "#4ade80", good: "#8cb8ff", fair: "#fbbf24" };

  let current = null; // last result + image src
  const t = (key, params) => VAI.i18n.t(key, params);

  function vehicleName(result) {
    return t(result.vehicle === "truck" ? "vehicle.truck" : "vehicle.car");
  }

  const formatDate = (iso) => VAI.format.dateTime(iso, VAI.i18n.lang);

  function listItems(list, keys) {
    list.replaceChildren(
      ...keys.map((key) => {
        const li = document.createElement("li");
        li.textContent = t(key);
        return li;
      })
    );
  }

  function renderMetrics(metrics) {
    const box = $("report-metrics");
    box.replaceChildren(
      ...Object.entries(metrics).map(([key, value]) => {
        const item = document.createElement("div");
        item.className = "metric";
        item.innerHTML = `
          <div class="metric__row"><span></span><b>${value}%</b></div>
          <span class="meter"><span class="meter__fill" style="width:${value}%"></span></span>`;
        item.querySelector("span").textContent = t(`metric.${key}`);
        return item;
      })
    );
  }

  /** Paint the whole report from the stored result (also used on language switch). */
  function render() {
    if (!current) return;
    const r = current;
    const vehicle = vehicleName(r);

    $("report-title").textContent = t("report.title", { vehicle });
    $("report-condition").textContent = t("report.condition", { vehicle });
    $("report-score").textContent = `${r.score}%`;
    $("report-summary").textContent = t(`summary.${r.grade}`);
    $("report-img").src = r.image;
    $("report-id").textContent = r.id;
    $("report-date").textContent = formatDate(r.date);

    const grade = $("report-grade");
    grade.textContent = t(`grade.${r.grade}`);
    grade.className = `grade grade--${r.grade}`;

    $("report-score").style.color = SCORE_COLORS[r.grade];

    renderMetrics(r.metrics);
    listItems($("report-notes"), r.notes);
    listItems($("report-recs"), r.recs);

    // Animate the main meter on first paint.
    const meter = $("report-meter");
    meter.style.width = "0";
    requestAnimationFrame(() => {
      meter.style.width = `${r.score}%`;
    });
  }

  /**
   * Show a fresh inspection result.
   * @param {InspectionResult & {image: string}} result
   */
  function show(result) {
    current = result;
    render();
    VAI.router.go("report");
  }

  /** Plain-text summary used for sharing and saving. */
  function summaryText() {
    const r = current;
    const vehicle = vehicleName(r);
    const lines = [
      `Vehicle AI – ${t("report.title", { vehicle })}`,
      `${t("report.id")}: ${r.id}`,
      `${t("report.date")}: ${formatDate(r.date)}`,
      "",
      `${t("report.condition", { vehicle })}: ${r.score}% – ${t(`grade.${r.grade}`)}`,
      t(`summary.${r.grade}`),
      "",
      t("report.notes"),
      ...r.notes.map((k) => `• ${t(k)}`),
      "",
      t("report.recs"),
      ...r.recs.map((k) => `• ${t(k)}`),
      "",
      t("report.disclaimer"),
    ];
    return lines.join("\n");
  }

  async function share() {
    const text = summaryText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Vehicle AI", text });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      VAI.toast.show(t("report.copied"));
    } catch (err) {
      VAI.toast.show(text.split("\n")[4]);
    }
  }

  /** Save to local history and download a text copy of the report. */
  function save() {
    VAI.storage.saveReport(current);
    const blob = new Blob([summaryText()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${current.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    VAI.toast.show(t("report.saved"));
  }

  function init() {
    qs('[data-action="print"]').addEventListener("click", () => window.print());
    qs('[data-action="share"]').addEventListener("click", share);
    qs('[data-action="save"]').addEventListener("click", save);
    VAI.i18n.onChange(render);
  }

  return {
    init,
    show,
    get current() {
      return current;
    },
  };
})();
