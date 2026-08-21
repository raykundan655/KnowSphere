/**
 * settings.js
 * Settings page logic: display user profile, theme preference management, profile changes, and password changes.
 */

(function () {
  "use strict";

  // Route guard
  if (!Auth.requireAuth()) return;

  Theme.init();
  initSidebar();

  const user = Auth.getUser();

  // Sidebar user info & Avatar initialization
  const userAvatar = document.getElementById("user-avatar");
  const userName   = document.getElementById("user-name");
  const userEmail  = document.getElementById("user-email");

  function refreshSidebarUser(u) {
    if (!u) return;
    const initials = (u.name || u.email || "?")
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    if (userAvatar) userAvatar.textContent = initials;
    if (userName)   userName.textContent  = u.name || u.email?.split("@")[0] || "User";
    if (userEmail)  userEmail.textContent = u.email || "";
  }

  refreshSidebarUser(user);

  // Logout button
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    Auth.logout();
  });

  // Theme toggle top bar
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newTheme = Theme.toggle();
      updateThemeButtons(newTheme);
    });
  });

  // ── Populate Profile Form ──────────────────────────────────────────────────

  const profileForm = document.getElementById("profile-form");
  const nameInput   = document.getElementById("profile-name");
  const emailInput  = document.getElementById("profile-email");

  if (user) {
    nameInput.value  = user.name || "";
    emailInput.value = user.email || "";
  }

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      Toast.error("Name cannot be empty.");
      return;
    }

    // Save profile changes to local storage & mock backend update
    const updatedUser = { ...user, name: nameVal };
    Auth.setUser(updatedUser);
    refreshSidebarUser(updatedUser);
    Toast.success("Profile updated successfully!");
  });

  // ── Preferences Mode (Light / Dark Mode Explicit Toggle) ───────────────────

  const lightThemeBtn = document.getElementById("theme-light-btn");
  const darkThemeBtn  = document.getElementById("theme-dark-btn");

  function updateThemeButtons(currentTheme) {
    if (currentTheme === "dark") {
      darkThemeBtn.classList.remove("btn--secondary");
      darkThemeBtn.classList.add("btn--primary");
      lightThemeBtn.classList.remove("btn--primary");
      lightThemeBtn.classList.add("btn--secondary");
    } else {
      lightThemeBtn.classList.remove("btn--secondary");
      lightThemeBtn.classList.add("btn--primary");
      darkThemeBtn.classList.remove("btn--primary");
      darkThemeBtn.classList.add("btn--secondary");
    }
  }

  // Set initial preferences state
  updateThemeButtons(Theme.get());

  lightThemeBtn.addEventListener("click", () => {
    Theme.set("light");
    updateThemeButtons("light");
    Toast.success("Theme changed to Light Mode");
  });

  darkThemeBtn.addEventListener("click", () => {
    Theme.set("dark");
    updateThemeButtons("dark");
    Toast.success("Theme changed to Dark Mode");
  });

  // ── Password Changes Form ──────────────────────────────────────────────────

  const passwordForm     = document.getElementById("password-form");
  const currentPassInput = document.getElementById("current-password");
  const newPassInput     = document.getElementById("new-password");
  const confirmPassInput = document.getElementById("confirm-new-password");
  const submitPasswordBtn = document.getElementById("change-password-btn");

  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentPass = currentPassInput.value;
    const newPass     = newPassInput.value;
    const confirmPass = confirmPassInput.value;

    if (!currentPass || !newPass || !confirmPass) {
      Toast.error("Please fill in all security fields.");
      return;
    }

    if (newPass.length < 8) {
      Toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPass !== confirmPass) {
      Toast.error("Passwords do not match.");
      return;
    }

    setButtonLoading(submitPasswordBtn, true, "Updating...");

    // Mock API call to update security credentials
    setTimeout(() => {
      setButtonLoading(submitPasswordBtn, false, "Update Password");
      currentPassInput.value = "";
      newPassInput.value = "";
      confirmPassInput.value = "";
      Toast.success("Password changed successfully!");
    }, 1000);
  });
})();
