/**
 * Auth – a front-end only account and session store.
 * Accounts live in localStorage so the demo works without a server.
 */
window.VAI = window.VAI || {};

VAI.auth = (() => {
  const MIN_PASSWORD = 6;

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  /**
   * Check a sign-in / sign-up form.
   * @param {{mode: "login" | "register", name: string, email: string, password: string}} input
   * @returns {string | null} locale key of the first problem, or null when valid
   */
  function validate({ mode, name, email, password }) {
    if (mode === "register" && !name) return "login.errName";
    if (!isValidEmail(email)) return "login.errEmail";
    if (password.length < MIN_PASSWORD) return "login.errPassword";
    return null;
  }

  /**
   * Sign in, creating the account first if needed.
   * @param {{mode: string, name: string, email: string}} input
   * @returns {{email: string, name: string}} the session user
   */
  function signInWith({ mode, name, email }) {
    const users = VAI.storage.get("users", {});
    if (mode === "register" || !users[email]) {
      users[email] = { name: name || email.split("@")[0] };
      VAI.storage.set("users", users);
    }
    return startSession({ email, name: users[email].name });
  }

  /**
   * @param {{email: string, name: string}} user
   * @returns {{email: string, name: string}}
   */
  function startSession(user) {
    VAI.storage.set("session", user);
    return user;
  }

  function signOut() {
    VAI.storage.remove("session");
  }

  /** @returns {boolean} */
  const isSignedIn = () => Boolean(VAI.storage.get("session"));

  return { validate, signInWith, startSession, signOut, isSignedIn };
})();
