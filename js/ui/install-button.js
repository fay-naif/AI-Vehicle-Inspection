/**
 * Install button – shows "Install app" when the browser allows it and
 * explains "Add to Home Screen" on iPhone, where there is no prompt.
 */
window.VAI = window.VAI || {};

VAI.installButton = (() => {
  const { qsa } = VAI.dom;

  async function handleClick() {
    const outcome = await VAI.pwa.promptInstall();
    if (outcome === "ios-hint") VAI.toast.show(VAI.i18n.t("install.iosHint"));
    else if (outcome === "accepted") VAI.toast.show(VAI.i18n.t("install.done"));
  }

  function init() {
    const buttons = qsa('[data-action="install"]');
    buttons.forEach((btn) => btn.addEventListener("click", handleClick));
    VAI.pwa.onAvailabilityChange((installable) => {
      buttons.forEach((btn) => {
        btn.hidden = !installable;
      });
    });
  }

  return { init };
})();
