/**
 * knowledge-base.js
 * KB detail page: load KB info, documents, upload, delete, status polling.
 */

(function () {
  "use strict";

  if (!Auth.requireAuth()) return;

  Theme.init();
  initSidebar();
  initModalClosers();

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
    const el = document.getElementById("user-avatar");
    if (el) el.textContent = initials;
    const nameEl  = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    if (nameEl) nameEl.textContent  = user.name || user.email?.split("@")[0] || "User";
    if (emailEl) emailEl.textContent = user.email || "";
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(btn => btn.addEventListener("click", () => Theme.toggle()));
  document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
  document.getElementById("sidebar-user")?.addEventListener("click", () => { window.location.href = "settings.html"; });

  // ── State ──────────────────────────────────────────────────────────────────

  let documents         = [];
  let pendingDeleteDocId = null;
  let pollingTimers     = {};

  // ── Load KB Info ───────────────────────────────────────────────────────────

  async function loadKBInfo() {
    try {
      const kb = await getKnowledgeBase(kbId);
      const id = kb.id || kb._id;

      document.title = `${kb.name} — KnowSphere`;
      document.getElementById("kb-name").textContent        = kb.name;
      document.getElementById("breadcrumb-name").textContent = kb.name;
      document.getElementById("kb-description").textContent  = kb.description || "";
      document.getElementById("stat-created").textContent    = formatRelativeDate(kb.created_at);

      // Chat button
      document.getElementById("chat-btn").addEventListener("click", () => {
        window.location.href = `chat.html?id=${encodeURIComponent(String(id))}`;
      });
    } catch (err) {
      Toast.error("Failed to load knowledge base info.");
    }
  }

  // ── Load Documents ─────────────────────────────────────────────────────────

  async function loadDocuments() {
    const listBody = document.getElementById("document-list-body");
    listBody.innerHTML = Array(3).fill(createSkeletonRow()).join("");

    try {
      documents = await getDocuments(kbId);
      renderDocuments(documents);
      updateStats(documents);
    } catch (err) {
      listBody.innerHTML = `
        <div class="empty-state" style="padding:var(--space-8)" role="alert">
          <div class="empty-state__icon" style="background:var(--color-error-subtle);color:var(--color-error)" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="empty-state__title">Failed to load documents</div>
          <p class="empty-state__text">${escapeHTML(err.message)}</p>
          <button class="btn btn--secondary" onclick="loadDocuments()">Retry</button>
        </div>
      `;
    }
  }

  function renderDocuments(docs) {
    const listBody = document.getElementById("document-list-body");

    if (docs.length === 0) {
      listBody.innerHTML = `
        <div class="empty-state" style="padding:var(--space-10)" role="status">
          <div class="empty-state__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="empty-state__title">No documents yet</div>
          <p class="empty-state__text">Upload your first document using the upload zone above.</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <table class="document-table" aria-label="Documents">
        <thead>
          <tr>
            <th scope="col">Document</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Uploaded</th>
            <th scope="col" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody id="doc-tbody">
          ${docs.map(renderDocRow).join("")}
        </tbody>
      </table>
      <div id="doc-cards-mobile">
        ${docs.map(renderDocCard).join("")}
      </div>
    `;

    listBody.innerHTML = tableHTML;

    // Attach delete buttons
    listBody.querySelectorAll(".doc-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.docId;
        const name = btn.dataset.docName;
        pendingDeleteDocId = id;
        document.getElementById("delete-doc-name").textContent = `"${name}"`;
        openModal("delete-doc-modal");
      });
    });

    // Start polling for processing docs
    stopAllPolling();
    docs.filter(d => d.status === "processing" || d.status === "uploaded").forEach(d => {
      startPolling(d.id || d._id);
    });
  }

  function renderDocRow(doc) {
    const id   = doc.id || doc._id;
    const ext  = (doc.filename || "").split(".").pop()?.toLowerCase() || "";
    return `
      <tr>
        <td>
          <div class="doc-name-cell">
            ${getFileIcon(doc.filename)}
            <span class="doc-name" title="${escapeHTML(doc.filename)}">${escapeHTML(doc.filename)}</span>
          </div>
        </td>
        <td><span class="badge badge--default" style="text-transform:uppercase">${escapeHTML(ext)}</span></td>
        <td id="status-${escapeHTML(String(id))}">${renderStatusBadge(doc.status)}</td>
        <td style="color:var(--color-text-secondary)">${formatDate(doc.created_at)}</td>
        <td>
          <div class="doc-actions">
            <button
              class="btn btn--danger btn--sm doc-delete-btn"
              data-doc-id="${escapeHTML(String(id))}"
              data-doc-name="${escapeHTML(doc.filename)}"
              aria-label="Delete ${escapeHTML(doc.filename)}"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderDocCard(doc) {
    const id  = doc.id || doc._id;
    const ext = (doc.filename || "").split(".").pop()?.toLowerCase() || "";
    return `
      <div class="doc-card">
        ${getFileIcon(doc.filename)}
        <div class="doc-card__info">
          <div class="doc-card__name" title="${escapeHTML(doc.filename)}">${escapeHTML(doc.filename)}</div>
          <div class="doc-card__meta">${escapeHTML(ext.toUpperCase())} · ${formatDate(doc.created_at)} · <span id="status-mobile-${escapeHTML(String(id))}">${renderStatusText(doc.status)}</span></div>
        </div>
        <div class="doc-card__actions">
          <button
            class="btn btn--danger btn--sm btn--icon doc-delete-btn"
            data-doc-id="${escapeHTML(String(id))}"
            data-doc-name="${escapeHTML(doc.filename)}"
            aria-label="Delete ${escapeHTML(doc.filename)}"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  function renderStatusBadge(status) {
    const map = {
      ready:      `<span class="badge badge--ready">Ready</span>`,
      processing: `<span class="badge badge--processing"><span class="processing-dot" aria-hidden="true"></span> Processing</span>`,
      uploaded:   `<span class="badge badge--uploaded">Uploaded</span>`,
      failed:     `<span class="badge badge--failed">Failed</span>`,
    };
    return map[status] || `<span class="badge badge--default">${escapeHTML(status || "Unknown")}</span>`;
  }

  function renderStatusText(status) {
    const map = { ready: "✓ Ready", processing: "Processing...", uploaded: "Uploaded", failed: "Failed" };
    return map[status] || status || "Unknown";
  }

  function updateStats(docs) {
    const ready = docs.filter(d => d.status === "ready").length;
    document.getElementById("stat-total").textContent = docs.length;
    document.getElementById("stat-ready").textContent = ready;
    document.getElementById("doc-count-badge").textContent = docs.length;
  }

  // ── Document Status Polling ────────────────────────────────────────────────

  function startPolling(docId) {
    if (pollingTimers[docId]) return;
    pollingTimers[docId] = setInterval(async () => {
      try {
        const updatedDocs = await getDocuments(kbId);
        const found = updatedDocs.find(d => (d.id || d._id) === docId);
        if (!found || found.status === "ready" || found.status === "failed") {
          stopPolling(docId);
          // Refresh if a doc changed state
          documents = updatedDocs;
          renderDocuments(documents);
          updateStats(documents);
          if (found?.status === "ready") Toast.success(`"${found.filename}" is ready.`);
          if (found?.status === "failed") Toast.error(`"${found.filename}" processing failed.`);
        } else {
          // Update just the status cell
          const cell = document.getElementById(`status-${docId}`);
          if (cell) cell.innerHTML = renderStatusBadge(found.status);
        }
      } catch (_) { /* silent */ }
    }, CONFIG.POLLING_INTERVAL_MS);
  }

  function stopPolling(docId) {
    clearInterval(pollingTimers[docId]);
    delete pollingTimers[docId];
  }

  function stopAllPolling() {
    Object.keys(pollingTimers).forEach(stopPolling);
  }

  // ── File Upload ────────────────────────────────────────────────────────────

  const uploadZone  = document.getElementById("upload-zone");
  const fileInput   = document.getElementById("file-input");
  const uploadQueue = document.getElementById("upload-queue");

  // Drag & drop
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("upload-zone--dragging");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("upload-zone--dragging");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("upload-zone--dragging");
    handleFiles(Array.from(e.dataTransfer.files));
  });

  // Click zone
  uploadZone.addEventListener("click", (e) => {
    if (e.target.id === "browse-btn" || e.target.closest("#browse-btn")) return;
    fileInput.click();
  });
  uploadZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });

  document.getElementById("browse-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  document.getElementById("upload-trigger-btn").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = ""; // reset so same file can be re-uploaded
  });

  function validateFile(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!CONFIG.SUPPORTED_FILE_TYPES.includes(ext)) {
      return `"${file.name}" is not supported. Please upload PDF, DOCX, or TXT files.`;
    }
    if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the 50 MB size limit.`;
    }
    return null;
  }

  async function handleFiles(files) {
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        Toast.error(validationError);
        continue;
      }
      await uploadFile(file);
    }
  }

  async function uploadFile(file) {
    const itemId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Add to queue UI
    const item = document.createElement("div");
    item.className = "upload-item";
    item.id = itemId;
    item.setAttribute("aria-live", "polite");
    item.innerHTML = `
      ${getFileIcon(file.name)}
      <div class="upload-item__info">
        <div class="upload-item__name">${escapeHTML(file.name)}</div>
        <div class="upload-item__meta" id="${itemId}-meta">Uploading...</div>
        <div class="progress-bar"><div class="progress-bar__fill" id="${itemId}-bar" style="width:0%"></div></div>
      </div>
      <span class="badge badge--uploaded" id="${itemId}-badge">Uploading</span>
    `;
    uploadQueue.prepend(item);

    try {
      await uploadDocument(kbId, file, (pct) => {
        const bar  = document.getElementById(`${itemId}-bar`);
        const meta = document.getElementById(`${itemId}-meta`);
        if (bar)  bar.style.width = `${pct}%`;
        if (meta) {
          if (pct < 100) {
            meta.textContent = `Uploading... ${pct}%`;
          } else {
            // File is uploaded to Supabase. Backend is now running embeddings.
            meta.textContent = "Embedding document (this may take 30–60s)...";
            const badge = document.getElementById(`${itemId}-badge`);
            if (badge) { badge.textContent = "Processing"; badge.className = "badge badge--processing"; }
          }
        }
      });

      // Success — backend has finished uploading + embedding + storing in Qdrant
      const bar   = document.getElementById(`${itemId}-bar`);
      const meta  = document.getElementById(`${itemId}-meta`);
      const badge = document.getElementById(`${itemId}-badge`);
      if (bar)   { bar.style.width = "100%"; bar.classList.add("progress-bar__fill--success"); }
      if (meta)  meta.textContent = "Ready — document indexed successfully!";
      if (badge) { badge.textContent = "Ready"; badge.className = "badge badge--ready"; }

      Toast.success(`"${file.name}" uploaded and indexed successfully!`);

      // Reload document list
      await loadDocuments();

      // Remove from queue after short delay
      setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.remove();
      }, 3000);

    } catch (err) {
      const meta  = document.getElementById(`${itemId}-meta`);
      const badge = document.getElementById(`${itemId}-badge`);
      const bar   = document.getElementById(`${itemId}-bar`);
      if (meta)  meta.textContent = `Failed: ${err.message}`;
      if (badge) { badge.textContent = "Failed"; badge.className = "badge badge--failed"; }
      if (bar)   bar.classList.add("progress-bar__fill--error");
      Toast.error(`Upload failed: ${err.message}`);
    }
  }

  // ── Delete Document ────────────────────────────────────────────────────────

  document.getElementById("delete-doc-confirm").addEventListener("click", async () => {
    if (!pendingDeleteDocId) return;
    const btn = document.getElementById("delete-doc-confirm");
    setButtonLoading(btn, true, "Deleting...");
    try {
      await deleteDocument(kbId, pendingDeleteDocId);
      closeModal("delete-doc-modal");
      Toast.success("Document deleted successfully.");
      pendingDeleteDocId = null;
      await loadDocuments();
    } catch (err) {
      Toast.error(err.message || "Failed to delete document.");
    } finally {
      setButtonLoading(btn, false, "Delete Document");
    }
  });

  // ── Boot ───────────────────────────────────────────────────────────────────

  loadKBInfo();
  loadDocuments();

  // Clean up polling on page leave
  window.addEventListener("beforeunload", stopAllPolling);

  // Expose for inline onclick
  window.loadDocuments = loadDocuments;
})();
