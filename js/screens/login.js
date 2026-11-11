/**
 * Screen: sign in / create account.
 */
window.VAI = window.VAI || {};
VAI.screens = VAI.screens || {};

VAI.screens.login = (() => {
  const { byId, qs } = VAI.dom;
  const TEXT_IDS = ["login-title", "login-subtitle", "login-submit", "switch-text", "switch-mode"];
  const TEXT_KEYS = {
    login: ["login.title", "login.subtitle", "login.submit", "login.noAccount", "login.create"],
    register: ["login.registerTitle", "login.registerSubtitle", "login.registerSubmit", "login.haveAccount", "login.signIn"],
  };

  let mode = "login"; // "login" | "register"

  const form = () => byId("login-form");
  const errorBox = () => byId("login-error");

  /**
   * Swap texts and fields between sign in and sign up.
   * @param {"login" | "register"} next
   */
  function setMode(next) {
    mode = next;
    byId("field-name").classList.toggle("is-hidden", mode !== "register");
    TEXT_IDS.forEach((id, i) => {
      byId(id).dataset.i18n = TEXT_KEYS[mode][i];
    });
    errorBox().textContent = "";
    VAI.i18n.applyToDom(form().closest(".screen"));
  }

  function enterApp(user) {
    VAI.auth.startSession(user);
    form().reset();
    VAI.router.go("about");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(form());
    const input = {
      mode,
      name: (data.get("name") || "").trim(),
      email: (data.get("email") || "").trim().toLowerCase(),
      password: data.get("password") || "",
    };

    const error = VAI.auth.validate(input);
    if (error) {
      errorBox().textContent = VAI.i18n.t(error);
      return;
    }
    enterApp(VAI.auth.signInWith(input));
  }

  function init() {
    form().addEventListener("submit", handleSubmit);
    byId("switch-mode").addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));
    qs('[data-action="guest"]').addEventListener("click", () => enterApp({ email: "guest", name: "Guest" }));
    VAI.i18n.onChange(() => {
      errorBox().textContent = "";
    });
  }

  return { init, setMode };
})();
