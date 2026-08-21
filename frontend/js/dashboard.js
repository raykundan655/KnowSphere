/**
 * dashboard.js
 * Dashboard page: load KBs, stats, create, delete, search.
 */

(function () {
  "use strict";

  // Route guard
  if (!Auth.requireAuth()) return;

  Theme.init();
  initSidebar();
  initModalClosers();

  // ── Init ───────────────────────────────────────────────────────────────────

  const user = Auth.getUser();

  // Greeting
  const greetingEl = document.getElementById("greeting-text");
  const greetingSubEl = document.getElementById("greeting-sub");
  if (greetingEl) {
    const name = user?.name || user?.email?.split("@")[0] || "there";
    greetingEl.textContent = `${getGreeting()}, ${name}`;
  }

  // Sidebar user info
  const userAvatar = document.getElementById("user-avatar");
  const userName   = document.getElementById("user-name");
  const userEmail  = document.getElementById("user-email");

  if (user) {
    const initials = (user.name || user.email || "?")
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    if (userAvatar) userAvatar.textContent = initials;
    if (userName)   userName.textContent  = user.name || user.email?.split("@")[0] || "User";
    if (userEmail)  userEmail.textContent = user.email || "";
  }

  // User card → settings
  document.getElementById("sidebar-user")?.addEventListener("click", () => {
    window.location.href = "settings.html";
  });
  document.getElementById("sidebar-user")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") window.location.href = "settings.html";
  });

  // Theme toggle
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => Theme.toggle());
  });

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    Auth.logout();
  });

  // ── State ──────────────────────────────────────────────────────────────────

  let allKBs = [];
  let pendingDeleteId = null;

  // Stats counters
  let totalQueries = parseInt(localStorage.getItem("knowsphere_queries") || "0");

  // ── Load Data ──────────────────────────────────────────────────────────────

  async function loadDashboard() {
    renderSkeletons();
    try {
      allKBs = await getKnowledgeBases();
      // ASSUMPTION: array of { id, name, description, document_count, updated_at, created_at }
      renderKBs(allKBs);
      updateStats(allKBs);
    } catch (err) {
      renderError(err.message);
    }
  }

  function renderSkeletons() {
    const grid = document.getElementById("kb-grid");
    grid.innerHTML = Array(3).fill(createSkeletonCard()).join("");
    document.getElementById("kb-count-label").textContent = "Loading...";
  }

  function renderKBs(kbs) {
    const grid  = document.getElementById("kb-grid");
    const count = document.getElementById("kb-count-label");

    count.textContent = `${kbs.length} knowledge base${kbs.length !== 1 ? "s" : ""}`;

    if (kbs.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1" role="status">
          <div class="empty-state__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="empty-state__title">No knowledge bases yet</div>
          <p class="empty-state__text">Create your first knowledge base to start uploading documents and asking questions.</p>
          <button class="btn btn--primary" onclick="openModal('create-kb-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Knowledge Base
          </button>
        </div>
      `;
      return;
    }

    // Create KB card at end
    const createCard = `
      <button class="kb-card kb-card--create" onclick="openModal('create-kb-modal')" aria-label="Create new knowledge base" type="button">
        <div class="create-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <h3>New Knowledge Base</h3>
        <p>Upload documents and start asking questions</p>
      </button>
    `;

    grid.innerHTML = kbs.map(renderKBCard).join("") + createCard;

    // Attach event listeners
    grid.querySelectorAll(".kb-open-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.closest("[data-kb-id]").dataset.kbId;
        window.location.href = `knowledge-base.html?id=${id}`;
      });
    });

    grid.querySelectorAll(".kb-chat-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.closest("[data-kb-id]").dataset.kbId;
        window.location.href = `chat.html?id=${id}`;
      });
    });

    grid.querySelectorAll(".kb-delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest("[data-kb-id]");
        pendingDeleteId = card.dataset.kbId;
        const name = card.dataset.kbName;
        document.getElementById("delete-kb-name").textContent = `"${name}"`;
        openModal("delete-kb-modal");
      });
    });

    // Click card → open KB
    grid.querySelectorAll(".kb-card[data-kb-id]").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return; // don't fire if clicking a button
        window.location.href = `knowledge-base.html?id=${card.dataset.kbId}`;
      });
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.location.href = `knowledge-base.html?id=${card.dataset.kbId}`;
      });
    });
  }

  function renderKBCard(kb) {
    const docCount = kb.document_count ?? 0;
    const updated  = kb.updated_at || kb.created_at;
    const id       = kb.id || kb._id;

    return `
      <div class="kb-card" data-kb-id="${escapeHTML(String(id))}" data-kb-name="${escapeHTML(kb.name)}" aria-label="Knowledge base: ${escapeHTML(kb.name)}">
        <div class="kb-card__header">
          <div class="kb-card__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="kb-card__menu">
            <button class="btn btn--ghost btn--icon kb-delete-btn" aria-label="Delete ${escapeHTML(kb.name)}" title="Delete knowledge base">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>

        <div>
          <div class="kb-card__title" title="${escapeHTML(kb.name)}">${escapeHTML(kb.name)}</div>
          <p class="kb-card__description">${escapeHTML(kb.description || "No description provided.")}</p>
        </div>

        <div class="kb-card__meta">
          <div class="kb-card__stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
            <span>${docCount} document${docCount !== 1 ? "s" : ""}</span>
          </div>
          <div class="kb-card__stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${formatRelativeDate(updated)}</span>
          </div>
        </div>

        <div class="kb-card__footer">
          <button class="btn btn--secondary btn--sm kb-open-btn" aria-label="Open ${escapeHTML(kb.name)}">
            Open
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="btn btn--primary btn--sm kb-chat-btn" aria-label="Chat with ${escapeHTML(kb.name)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </button>
        </div>
      </div>
    `;
  }

  function renderError(msg) {
    const grid = document.getElementById("kb-grid");
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1" role="alert">
        <div class="empty-state__icon" aria-hidden="true" style="background:var(--color-error-subtle);color:var(--color-error)">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="empty-state__title">Failed to load knowledge bases</div>
        <p class="empty-state__text">${escapeHTML(msg)}</p>
        <button class="btn btn--secondary" onclick="loadDashboard()">Try again</button>
      </div>
    `;
    document.getElementById("kb-count-label").textContent = "Error loading";
  }

  function updateStats(kbs) {
    const totalDocs = kbs.reduce((sum, kb) => sum + (kb.document_count ?? 0), 0);
    document.getElementById("stat-kb").textContent    = kbs.length;
    document.getElementById("stat-docs").textContent  = totalDocs;
    document.getElementById("stat-queries").textContent = totalQueries;
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  document.getElementById("kb-search").addEventListener("input", debounce((e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = q ? allKBs.filter(kb =>
      kb.name.toLowerCase().includes(q) ||
      (kb.description || "").toLowerCase().includes(q)
    ) : allKBs;
    renderKBs(filtered);
  }, 200));

  // ── Create KB ──────────────────────────────────────────────────────────────

  document.getElementById("create-kb-btn").addEventListener("click", () => {
    document.getElementById("kb-name").value = "";
    document.getElementById("kb-description").value = "";
    openModal("create-kb-modal");
  });

  document.getElementById("create-kb-submit").addEventListener("click", async () => {
    const nameEl = document.getElementById("kb-name");
    const descEl = document.getElementById("kb-description");
    const btn    = document.getElementById("create-kb-submit");
    const errEl  = document.getElementById("kb-name-error");

    const name = nameEl.value.trim();
    if (!name) {
      nameEl.classList.add("form-input--error");
      errEl.textContent = "Knowledge base name is required.";
      nameEl.focus();
      return;
    }
    nameEl.classList.remove("form-input--error");
    errEl.textContent = "";

    setButtonLoading(btn, true, "Creating...");
    try {
      await createKnowledgeBase({ name, description: descEl.value.trim() });
      closeModal("create-kb-modal");
      Toast.success(`"${name}" created successfully!`);
      await loadDashboard();
    } catch (err) {
      Toast.error(err.message || "Failed to create knowledge base.");
    } finally {
      setButtonLoading(btn, false, "Create Knowledge Base");
    }
  });

  // Allow Enter key in KB name field
  document.getElementById("kb-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("create-kb-submit").click();
    }
  });

  // ── Delete KB ──────────────────────────────────────────────────────────────

  document.getElementById("delete-kb-confirm").addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    const btn = document.getElementById("delete-kb-confirm");
    setButtonLoading(btn, true, "Deleting...");
    try {
      await deleteKnowledgeBase(pendingDeleteId);
      closeModal("delete-kb-modal");
      Toast.success("Knowledge base deleted.");
      pendingDeleteId = null;
      await loadDashboard();
    } catch (err) {
      Toast.error(err.message || "Failed to delete knowledge base.");
    } finally {
      setButtonLoading(btn, false, "Delete Knowledge Base");
    }
  });

  // ── Boot ───────────────────────────────────────────────────────────────────

  loadDashboard();

  // Expose for inline onclick
  window.loadDashboard = loadDashboard;
})();
