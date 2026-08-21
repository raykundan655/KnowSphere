/**
 * chat.js
 * RAG Chat page: send questions, display AI answers with markdown,
 * show sources panel, copy answers, auto-grow textarea.
 */

(function () {
  "use strict";

  if (!Auth.requireAuth()) return;

  Theme.init();
  initSidebar();

  // ── URL params ─────────────────────────────────────────────────────────────

  const params = new URLSearchParams(window.location.search);
  const kbId   = params.get("id");

  if (!kbId) {
    window.location.href = "dashboard.html";
    return;
  }

  // ── Sidebar user ───────────────────────────────────────────────────────────

  const user = Auth.getUser();
  if (user) {
    const initials = (user.name || user.email || "?").split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
    const avatarEl = document.getElementById("user-avatar");
    if (avatarEl) avatarEl.textContent = initials;
    const nameEl  = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    if (nameEl)  nameEl.textContent  = user.name || user.email?.split("@")[0] || "User";
    if (emailEl) emailEl.textContent = user.email || "";
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => btn.addEventListener("click", () => Theme.toggle()));
  document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
  document.getElementById("sidebar-user")?.addEventListener("click", () => { window.location.href = "settings.html"; });

  // ── State ──────────────────────────────────────────────────────────────────

  let isLoading    = false;
  let messageCount = 0;
  let latestSources = [];
  let chatHistory  = []; // { role: "user"|"ai", content: string, sources?: [] }

  const userInitials = (user?.name || user?.email || "U")
    .split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  // ── DOM refs ───────────────────────────────────────────────────────────────

  const messagesEl    = document.getElementById("chat-messages");
  const inputEl       = document.getElementById("chat-input");
  const sendBtn       = document.getElementById("send-btn");
  const clearBtn      = document.getElementById("clear-chat-btn");
  const sourcesPanel  = document.getElementById("sources-panel");
  const sourcesPanelBody = document.getElementById("sources-panel-body");
  const toggleSources = document.getElementById("toggle-sources-btn");
  const closeSources  = document.getElementById("close-sources-btn");

  // ── Load KB Info ───────────────────────────────────────────────────────────

  async function loadKBInfo() {
    try {
      // Load KB metadata and actual documents in parallel
      const [kb, docs] = await Promise.all([
        getKnowledgeBase(kbId),
        getDocuments(kbId)
      ]);

      const id = kb.id || kb._id;
      const kbName = kb.name;
      const docCount = docs.length;

      document.title = `Chat — ${kbName} — KnowSphere`;
      document.getElementById("sidebar-kb-name").textContent   = kbName;
      document.getElementById("sidebar-kb-desc").textContent   = kb.description || "";
      document.getElementById("chat-title").textContent        = `Chat with ${kbName}`;
      document.getElementById("chat-sub").textContent          = `${docCount} document${docCount !== 1 ? "s" : ""} indexed`;
      document.getElementById("sidebar-doc-count").textContent = docCount;
      document.getElementById("sidebar-status").innerHTML      =
        docCount > 0
          ? `<span class="badge badge--ready" style="font-size:var(--text-xs)">Ready</span>`
          : `<span class="badge badge--default" style="font-size:var(--text-xs)">No documents</span>`;

      // Render document list in sidebar
      renderSidebarDocs(docs);

      // Breadcrumb + view link
      const kbLink  = document.getElementById("kb-breadcrumb-link");
      const viewLink = document.getElementById("view-kb-link");
      if (kbLink)   { kbLink.href = `knowledge-base.html?id=${encodeURIComponent(String(id))}`; kbLink.textContent = kbName; }
      if (viewLink)  viewLink.href = `knowledge-base.html?id=${encodeURIComponent(String(id))}`;

      // Warn user if no docs
      if (docCount === 0) {
        Toast.warning("This knowledge base has no documents yet. Upload documents before chatting.");
      }

    } catch (err) {
      Toast.error("Failed to load knowledge base info.");
    }
  }

  // ── Sidebar Document List ───────────────────────────────────────────────────

  function renderSidebarDocs(docs) {
    // Check if a sidebar-docs container exists, create it if not
    let container = document.getElementById("sidebar-doc-list");
    if (!container) {
      // Insert after the stats section
      const statsEl = document.querySelector(".chat-sidebar__stats");
      if (!statsEl) return;
      container = document.createElement("div");
      container.id = "sidebar-doc-list";
      container.style.cssText = "padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border);";
      statsEl.after(container);
    }

    if (docs.length === 0) {
      container.innerHTML = `
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);padding:var(--space-2) 0;">No documents uploaded yet.</div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-2);">Documents</div>
      ${docs.map(doc => `
        <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1) 0;font-size:var(--text-xs);color:var(--color-text-secondary);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHTML(doc.filename)}">${escapeHTML(doc.filename)}</span>
        </div>
      `).join("")}
    `;
  }

  // ── Welcome State ──────────────────────────────────────────────────────────

  function showWelcome() {
    messagesEl.innerHTML = `
      <div class="chat-welcome" id="chat-welcome" role="status">
        <div class="chat-welcome__icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="chat-welcome__title">Ask anything about your documents</div>
        <p class="chat-welcome__text">Your knowledge base is ready. Ask a question and the AI will retrieve the most relevant context to give you an accurate, grounded answer.</p>
        <div class="chat-suggestions" id="chat-suggestions" aria-label="Suggested questions">
          <button class="chat-suggestion" type="button">What are the main topics covered?</button>
          <button class="chat-suggestion" type="button">Summarize the key points</button>
          <button class="chat-suggestion" type="button">What are the most important findings?</button>
          <button class="chat-suggestion" type="button">List the main conclusions</button>
        </div>
      </div>
    `;

    // Suggestion click → populate input
    messagesEl.querySelectorAll(".chat-suggestion").forEach(btn => {
      btn.addEventListener("click", () => {
        inputEl.value = btn.textContent;
        autoGrow(inputEl);
        updateSendButton();
        inputEl.focus();
      });
    });
  }

  // ── Message Rendering ──────────────────────────────────────────────────────

  function removeWelcome() {
    const welcome = document.getElementById("chat-welcome");
    if (welcome) welcome.remove();
  }

  function appendUserMessage(text) {
    removeWelcome();
    messageCount++;
    const id = `msg-${messageCount}`;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const el = document.createElement("div");
    el.className = "message message--user";
    el.id = id;
    el.setAttribute("aria-label", `You: ${text}`);
    el.innerHTML = `
      <div class="message__avatar" aria-hidden="true">${escapeHTML(userInitials)}</div>
      <div class="message__content">
        <div class="message__bubble">${escapeHTML(text)}</div>
        <div class="message__meta">
          <span class="message__time">${timeStr}</span>
        </div>
      </div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
    return id;
  }

  function appendThinking() {
    const id = `thinking-${Date.now()}`;
    const el = document.createElement("div");
    el.className = "message message--ai";
    el.id = id;
    el.setAttribute("aria-label", "AI is thinking");
    el.innerHTML = `
      <div class="message__avatar" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <div class="message__content">
        <div class="thinking" role="status" aria-label="AI is thinking">
          <span class="thinking__label">Thinking</span>
          <span class="thinking__dot" aria-hidden="true"></span>
          <span class="thinking__dot" aria-hidden="true"></span>
          <span class="thinking__dot" aria-hidden="true"></span>
        </div>
      </div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
    return id;
  }

  function replaceThinkingWithAnswer(thinkingId, answer, sources) {
    const thinkingEl = document.getElementById(thinkingId);
    if (!thinkingEl) return;

    messageCount++;
    const msgId  = `msg-${messageCount}`;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const sourcesHTML = sources && sources.length
      ? renderSourcesInline(sources)
      : "";

    const el = document.createElement("div");
    el.className = "message message--ai";
    el.id = msgId;
    el.setAttribute("aria-label", "AI response");
    el.innerHTML = `
      <div class="message__avatar" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <div class="message__content">
        <div class="message__bubble">
          <div class="md-content">${renderMarkdown(answer)}</div>
          ${sourcesHTML}
        </div>
        <div class="message__meta">
          <span class="message__time">${timeStr}</span>
          <button class="message__copy" onclick="copyToClipboard(${JSON.stringify(answer)})" aria-label="Copy answer" title="Copy">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>
    `;

    thinkingEl.replaceWith(el);
    scrollToBottom();

    return msgId;
  }

  function appendErrorMessage(errorText) {
    const thinkings = messagesEl.querySelectorAll('[aria-label="AI is thinking"]');
    thinkings.forEach(el => el.closest(".message")?.remove());

    messageCount++;
    const el = document.createElement("div");
    el.className = "message message--ai";
    el.setAttribute("role", "alert");
    el.innerHTML = `
      <div class="message__avatar" style="background:var(--color-error-subtle);color:var(--color-error)" aria-hidden="true">!</div>
      <div class="message__content">
        <div class="message__bubble" style="border-color:rgba(220,38,38,0.2);background:var(--color-error-subtle)">
          <div style="color:var(--color-error);font-size:var(--text-sm)">${escapeHTML(errorText)}</div>
        </div>
      </div>
    `;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  // ── Sources ────────────────────────────────────────────────────────────────

  function renderSourcesInline(sources) {
    if (!sources || !sources.length) return "";
    return `
      <div class="message__sources" aria-label="Sources">
        <div class="sources-label">Sources</div>
        ${sources.map(s => `
          <div class="source-card">
            <div class="source-card__icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="source-card__body">
              <div class="source-card__name">${escapeHTML(s.document_name || s.source || "Document")}</div>
              ${s.page ? `<div class="source-card__page">Page ${escapeHTML(String(s.page))}</div>` : ""}
              ${s.snippet ? `<div class="source-card__snippet">${escapeHTML(s.snippet)}</div>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function updateSourcesPanel(sources) {
    if (!sources || !sources.length) {
      sourcesPanelBody.innerHTML = `
        <div class="sources-panel__empty" role="status">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>No sources for this response.</span>
        </div>
      `;
      return;
    }

    sourcesPanelBody.innerHTML = sources.map(s => `
      <div class="source-card">
        <div class="source-card__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="source-card__body">
          <div class="source-card__name">${escapeHTML(s.document_name || s.source || "Document")}</div>
          ${s.page ? `<div class="source-card__page">Page ${escapeHTML(String(s.page))}</div>` : ""}
          ${s.snippet ? `<div class="source-card__snippet">${escapeHTML(s.snippet)}</div>` : ""}
        </div>
      </div>
    `).join("");
  }

  // ── Sources Panel Toggle ───────────────────────────────────────────────────

  let sourcesOpen = false;

  function openSourcesPanel() {
    sourcesOpen = true;
    sourcesPanel.classList.remove("sources-panel--hidden");
    toggleSources.setAttribute("aria-expanded", "true");
  }

  function closeSourcesPanel() {
    sourcesOpen = false;
    sourcesPanel.classList.add("sources-panel--hidden");
    toggleSources.setAttribute("aria-expanded", "false");
  }

  toggleSources.addEventListener("click", () => {
    if (sourcesOpen) closeSourcesPanel();
    else openSourcesPanel();
  });

  closeSources.addEventListener("click", closeSourcesPanel);

  // ── Send Message ───────────────────────────────────────────────────────────

  async function sendMessage() {
    const question = inputEl.value.trim();
    if (!question || isLoading) return;

    isLoading = true;
    updateSendButton();

    inputEl.value = "";
    autoGrow(inputEl);
    updateSendButton();

    appendUserMessage(question);
    const thinkingId = appendThinking();

    try {
      // Track query count
      const prevCount = parseInt(localStorage.getItem("knowsphere_queries") || "0");
      localStorage.setItem("knowsphere_queries", String(prevCount + 1));

      const data = await askQuestion(kbId, question);

      // ASSUMPTION: { question, answer, sources?: [...] }
      const answer  = data.answer || "I couldn't generate an answer. Please try again.";
      const sources = data.sources || [];

      latestSources = sources;
      replaceThinkingWithAnswer(thinkingId, answer, sources);
      updateSourcesPanel(sources);

      // Auto-open sources panel if sources exist
      if (sources.length && !sourcesOpen) {
        openSourcesPanel();
      }

      chatHistory.push({ role: "user", content: question });
      chatHistory.push({ role: "ai", content: answer, sources });

    } catch (err) {
      appendErrorMessage(err.message || "Failed to get an answer. Please try again.");
    } finally {
      isLoading = false;
      updateSendButton();
    }
  }

  // ── Clear Chat ─────────────────────────────────────────────────────────────

  clearBtn.addEventListener("click", () => {
    chatHistory = [];
    latestSources = [];
    showWelcome();
    updateSourcesPanel([]);
    Toast.info("Chat cleared.");
  });

  // ── Input Handling ─────────────────────────────────────────────────────────

  function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  function updateSendButton() {
    const hasText = inputEl.value.trim().length > 0;
    sendBtn.disabled = !hasText || isLoading;
    if (isLoading) {
      sendBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span>`;
    } else {
      sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    }
  }

  inputEl.addEventListener("input", () => {
    autoGrow(inputEl);
    updateSendButton();
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // ── Scroll ─────────────────────────────────────────────────────────────────

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  showWelcome();
  loadKBInfo();
  inputEl.focus();
})();
