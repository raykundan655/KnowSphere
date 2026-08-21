/**
 * login.js
 * Login page logic: form validation, API call, redirect.
 */

(function () {
  "use strict";

  Theme.init();

  // Redirect if already logged in
  if (Auth.isAuthenticated()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form     = document.getElementById("login-form");
  const emailEl  = document.getElementById("email");
  const passEl   = document.getElementById("password");
  const btn      = document.getElementById("login-btn");
  const errorDiv = document.getElementById("login-error");
  const errorTxt = document.getElementById("login-error-text");

  // Password toggle
  const toggle   = document.getElementById("password-toggle");
  const eyeOn    = document.getElementById("eye-icon");
  const eyeOff   = document.getElementById("eye-off-icon");

  toggle.addEventListener("click", () => {
    const isPassword = passEl.type === "password";
    passEl.type = isPassword ? "text" : "password";
    eyeOn.style.display  = isPassword ? "none"  : "block";
    eyeOff.style.display = isPassword ? "block" : "none";
    toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    toggle.setAttribute("aria-pressed", String(isPassword));
  });

  // Inline validation helpers
  function showError(inputEl, errorElId, msg) {
    const errorEl = document.getElementById(errorElId);
    if (!errorEl) return;
    inputEl.classList.add("form-input--error");
    errorEl.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${escapeHTML(msg)}
    `;
  }

  function clearError(inputEl, errorElId) {
    const errorEl = document.getElementById(errorElId);
    if (!errorEl) return;
    inputEl.classList.remove("form-input--error");
    errorEl.textContent = "";
  }

  function showBanner(msg) {
    errorTxt.textContent = msg;
    errorDiv.classList.add("auth-error--visible");
  }

  function hideBanner() {
    errorDiv.classList.remove("auth-error--visible");
  }

  function validateEmail(value) {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return null;
  }

  function validatePassword(value) {
    if (!value) return "Password is required.";
    return null;
  }

  // Live validation on blur
  emailEl.addEventListener("blur", () => {
    const err = validateEmail(emailEl.value);
    if (err) showError(emailEl, "email-error", err);
    else clearError(emailEl, "email-error");
  });
  emailEl.addEventListener("input", () => clearError(emailEl, "email-error"));

  passEl.addEventListener("blur", () => {
    const err = validatePassword(passEl.value);
    if (err) showError(passEl, "password-error", err);
    else clearError(passEl, "password-error");
  });
  passEl.addEventListener("input", () => clearError(passEl, "password-error"));

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();

    const email    = emailEl.value.trim();
    const password = passEl.value;

    // Validate
    let hasError = false;
    const emailErr = validateEmail(email);
    const passErr  = validatePassword(password);

    if (emailErr) { showError(emailEl, "email-error", emailErr); hasError = true; }
    else clearError(emailEl, "email-error");

    if (passErr) { showError(passEl, "password-error", passErr); hasError = true; }
    else clearError(passEl, "password-error");

    if (hasError) return;

    // Submit
    setButtonLoading(btn, true, "Signing in...");
    try {
      const data = await loginUser({ email, password });

      // ASSUMPTION: backend returns { access_token, token_type }
      const token = data.access_token;
      if (!token) throw new Error("No access token received.");

      Auth.login(token, { email });

      Toast.success("Signed in successfully!");
      window.location.href = "dashboard.html";

    } catch (err) {
      showBanner(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setButtonLoading(btn, false, "Sign In");
    }
  });
})();
