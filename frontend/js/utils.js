/**
 * utils.js
 * Shared utility functions used across all pages.
 */

// ─── Theme Management ─────────────────────────────────────────────────────────

const Theme = {
  STORAGE_KEY: "knowsphere_theme",

  get() {
    return localStorage.getItem(this.STORAGE_KEY) || "light";
  },

  set(theme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    this._updateToggleButtons(theme);
  },

  toggle() {
    const current = this.get();
    this.set(current === "dark" ? "light" : "dark");
    return this.get();
  },

  init() {
    const saved = this.get();
    document.documentElement.setAttribute("data-theme", saved);
    this._updateToggleButtons(saved);
  },

  _updateToggleButtons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const sunIcon = btn.querySelector(".icon-sun");
      const moonIcon = btn.querySelector(".icon-moon");
      if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === "dark" ? "block" : "none";
        moonIcon.style.display = theme === "light" ? "block" : "none";
      }
    });
  },
};

// ─── Toast Notifications ──────────────────────────────────────────────────────

const Toast = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.className = "toast-container";
      this._container.setAttribute("aria-live", "polite");
      this._container.setAttribute("aria-atomic", "false");
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = "info", duration = CONFIG.TOAST_DURATION_MS) {
    const container = this._getContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", "alert");

    const iconMap = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    toast.innerHTML = `
      <span class="toast__icon">${iconMap[type] || iconMap.info}</span>
      <span class="toast__message">${escapeHTML(message)}</span>
      <button class="toast__close" aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    toast.querySelector(".toast__close").addEventListener("click", () => this._dismiss(toast));
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add("toast--visible"));

    const timer = setTimeout(() => this._dismiss(toast), duration);
    toast._timer = timer;

    return toast;
  },

  _dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.remove("toast--visible");
    toast.classList.add("toast--hiding");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  },

  success(msg, duration) { return this.show(msg, "success", duration); },
  error(msg, duration) { return this.show(msg, "error", duration); },
  warning(msg, duration) { return this.show(msg, "warning", duration); },
  info(msg, duration) { return this.show(msg, "info", duration); },
};

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") el.className = v;
    else if (k === "innerHTML") el.innerHTML = v;
    else if (k === "textContent") el.textContent = v;
    else el.setAttribute(k, v);
  });
  children.forEach((child) => {
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });
  return el;
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date)) return "—";
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text) {
  if (!text) return "";

  let html = escapeHTML(text);

  // Code blocks (```...```)
  html = html.replace(/```([\w]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code class="lang-${lang || "text"}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code class=\"inline-code\">$1</code>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs (double newline)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<h") || block.startsWith("<pre") || block.startsWith("<ul") || block.startsWith("<li")) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function createSkeletonCard() {
  return `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text skeleton--short"></div>
      <div class="skeleton-footer">
        <div class="skeleton skeleton--badge"></div>
        <div class="skeleton skeleton--button"></div>
      </div>
    </div>
  `;
}

function createSkeletonRow() {
  return `
    <div class="skeleton-row" aria-hidden="true">
      <div class="skeleton skeleton--icon"></div>
      <div class="skeleton-row__content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text skeleton--short"></div>
      </div>
      <div class="skeleton skeleton--badge"></div>
    </div>
  `;
}

function showSkeletons(container, count = 3, type = "card") {
  const fn = type === "row" ? createSkeletonRow : createSkeletonCard;
  container.innerHTML = Array(count).fill(fn()).join("");
}

// ─── Debounce ────────────────────────────────────────────────────────────────

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── File Utilities ───────────────────────────────────────────────────────────

function getFileIcon(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon file-icon--pdf"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    docx: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon file-icon--docx"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    txt: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon file-icon--txt"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  };
  return icons[ext] || icons.txt;
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Modal Helpers ────────────────────────────────────────────────────────────

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Focus first focusable element
  requestAnimationFrame(() => {
    const focusable = modal.querySelector("input, button, select, textarea");
    if (focusable) focusable.focus();
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initModalClosers() {
  // Close on backdrop click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal--open").forEach((m) => closeModal(m.id));
    }
  });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function initSidebar() {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("sidebar--open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (overlay) overlay.classList.toggle("overlay--visible", isOpen);
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar--open");
      toggle.setAttribute("aria-expanded", "false");
      overlay.classList.remove("overlay--visible");
    });
  }
}

// ─── Copy to Clipboard ────────────────────────────────────────────────────────

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    Toast.success("Copied to clipboard");
  }).catch(() => {
    Toast.error("Failed to copy");
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function setButtonLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${originalText || "Loading..."}`;
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || originalText || "Submit";
  }
}
