/**
 * auth.js
 * Centralized authentication management.
 * Handles JWT storage, retrieval, and route protection.
 */

const AUTH_TOKEN_KEY = "knowsphere_token";
const AUTH_USER_KEY = "knowsphere_user";

const Auth = {
  /**
   * Store JWT token and user data after successful login.
   * @param {string} token - JWT access token
   * @param {Object} user - User object { name, email }
   */
  login(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Remove token and user data, redirect to login.
   */
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.location.href = "login.html";
  },

  /**
   * Check if user has a stored token.
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get the stored JWT token.
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored user data.
   * @returns {Object|null}
   */
  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Update stored user data.
   * @param {Object} user
   */
  setUser(user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  /**
   * Route guard: redirect to login if not authenticated.
   * Call at the top of every protected page.
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  /**
   * Build Authorization header object for fetch calls.
   * @returns {Object}
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Handle 401/403 from backend: clear session and redirect.
   */
  handleUnauthorized() {
    this.logout();
  },
};
