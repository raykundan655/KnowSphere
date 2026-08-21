/**
 * register.js
 * Registration page: full client-side validation, API call, redirect.
 */

(function () {
  "use strict";

  Theme.init();

  // Redirect if already logged in
  if (Auth.isAuthenticated()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form        = document.getElementById("register-form");
  const emailEl     = document.getElementById("email");
  const passEl      = document.getElementById("password");
  const confirmEl   = document.getElementById("confirm-password");
  const btn         = document.getElementById("register-btn");
  const errorDiv    = document.getElementById("register-error");
  const errorTxt    = document.getElementById("register-error-text");

  // ── Password toggles ───────────────────────────────────────────────────────

  function setupToggle(toggleId, inputEl, eyeOnId, eyeOffId) {
    const toggle = document.getElementById(toggleId);
    const eyeOn  = document.getElementById(eyeOnId);
    const eyeOff = document.getElementById(eyeOffId);
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const show = inputEl.type === "password";
      inputEl.type = show ? "text" : "password";
      eyeOn.style.display  = show ? "none"  : "block";
      eyeOff.style.display = show ? "block" : "none";
      toggle.setAttribute("aria-pressed", String(show));
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  }

  setupToggle("password-toggle",         passEl,    "eye-icon",   "eye-off-icon");
  setupToggle("confirm-password-toggle", confirmEl, "eye-icon-2", "eye-off-icon-2");

  // ── Password Strength ──────────────────────────────────────────────────────

  const bars  = [1, 2, 3, 4].map(i => document.getElementById(`bar-${i}`));
  const label = document.getElementById("password-strength-label");

  const levels = [
    { label: "Too short",  class: "strength-bar--weak",   fill: 1 },
    { label: "Weak",       class: "strength-bar--weak",   fill: 1 },
    { label: "Fair",       class: "strength-bar--fair",   fill: 2 },
    { label: "Good",       class: "strength-bar--good",   fill: 3 },
    { label: "Strong",     class: "strength-bar--strong", fill: 4 },
  ];

  function getStrength(password) {
    if (!password) return -1;
    if (password.length < 8) return 0;
    let score = 1;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score - 1, 4);
  }

  passEl.addEventListener("input", () => {
    const strength = getStrength(passEl.value);
    if (strength < 0) {
      bars.forEach(b => { b.className = "strength-bar"; });
      label.textContent = "";
      return;
    }
    const level = levels[strength];
    bars.forEach((b, i) => {
      b.className = "strength-bar" + (i < level.fill ? ` ${level.class}` : "");
    });
    label.textContent = level.label;
  });

  // ── Validation helpers ─────────────────────────────────────────────────────

  function showFieldError(inputEl, errorId, msg) {
    const el = document.getElementById(errorId);
    if (!el) return;
    inputEl.classList.add("form-input--error");
    el.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${escapeHTML(msg)}
    `;
  }

  function clearFieldError(inputEl, errorId) {
    const el = document.getElementById(errorId);
    if (!el) return;
    inputEl.classList.remove("form-input--error");
    el.textContent = "";
  }

  function showBanner(msg) {
    errorTxt.textContent = msg;
    errorDiv.classList.add("auth-error--visible");
  }

  function hideBanner() {
    errorDiv.classList.remove("auth-error--visible");
  }

  const validators = {
    email:   v => !v.trim() ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address." : null,
    password:v => !v ? "Password is required." : v.length < 8 ? "Password must be at least 8 characters." : null,
    confirm: (v, p) => !v ? "Please confirm your password." : v !== p ? "Passwords do not match." : null,
  };

  // Live blur validation
  emailEl.addEventListener("blur", () => { const e = validators.email(emailEl.value);  if (e) showFieldError(emailEl, "email-error", e);  else clearFieldError(emailEl, "email-error"); });
  passEl.addEventListener("blur",  () => { const e = validators.password(passEl.value); if (e) showFieldError(passEl, "password-error", e); else clearFieldError(passEl, "password-error"); });
  confirmEl.addEventListener("blur", () => { const e = validators.confirm(confirmEl.value, passEl.value); if (e) showFieldError(confirmEl, "confirm-password-error", e); else clearFieldError(confirmEl, "confirm-password-error"); });

  // Clear on input
  emailEl.addEventListener("input",   () => clearFieldError(emailEl, "email-error"));
  passEl.addEventListener("input",    () => clearFieldError(passEl, "password-error"));
  confirmEl.addEventListener("input", () => clearFieldError(confirmEl, "confirm-password-error"));

  // ── Form Submit ────────────────────────────────────────────────────────────

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();

    const email    = emailEl.value.trim();
    const password = passEl.value;
    const confirm  = confirmEl.value;

    const emailErr   = validators.email(email);
    const passErr    = validators.password(password);
    const confirmErr = validators.confirm(confirm, password);

    let hasError = false;
    if (emailErr)   { showFieldError(emailEl,   "email-error",            emailErr);   hasError = true; }
    if (passErr)    { showFieldError(passEl,    "password-error",         passErr);    hasError = true; }
    if (confirmErr) { showFieldError(confirmEl, "confirm-password-error", confirmErr); hasError = true; }

    if (hasError) return;

    setButtonLoading(btn, true, "Creating account...");
    try {
      await registerUser({ email, password });
      Toast.success("Account created! Please sign in.");
      setTimeout(() => { window.location.href = "login.html"; }, 1200);
    } catch (err) {
      showBanner(err.message || "Registration failed. Please try again.");
    } finally {
      setButtonLoading(btn, false, "Create Account");
    }
  });
})();
