/**
 * api.js
 * Centralized API utility layer.
 * All backend communication goes through this module.
 *
 * ALIGNED BACKEND ENDPOINTS & SCHEMAS:
 * - POST /login -> expects { gmail, password } -> returns { Message, token }
 * - POST /register -> expects { gmail, password, confirm } -> returns { Message }
 * - GET /KnowledgeBase -> returns Array<{ id, name }>
 * - POST /KnowledgeBase -> expects { name, info } -> returns { Message }
 * - GET /knowledgeBase/{id} -> returns { Message: { name, info } }
 * - DELETE /knowledgeBase/{id} -> returns { message }
 * - GET /knowledgeBase/{id}/documents -> returns { Message: "sucess", data: Array<{ document_id, file_name, content_type }> }
 * - POST /knowledgeBase/{id}/documents -> uploads file -> returns { Message }
 * - DELETE /knowledgeBase/{id}/documents/{doc_id} -> returns { Message }
 * - POST /knowledgeBase/{id}/chat -> expects { question } -> returns { question, answer }
 */

class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Base fetch wrapper with auth headers, error handling, and timeout.
 * @param {string} endpoint
 * @param {object} options - fetch options
 * @param {number} [timeoutMs=30000] - timeout in ms. Use a large value for uploads.
 */
async function apiFetch(endpoint, options = {}, timeoutMs = 30000) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  const headers = {
    ...Auth.getAuthHeaders(),
    ...(options.headers || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError(
        "Request timed out. Please verify your FastAPI backend is running and can connect to MongoDB Atlas.",
        0
      );
    }
    throw new APIError(
      "Network error. Please check your connection and try again.",
      0
    );
  }

  // Handle auth failures
  if (response.status === 401 || response.status === 403) {
    Auth.handleUnauthorized();
    throw new APIError("Session expired. Please log in again.", response.status);
  }

  // Parse response body
  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // Try to extract a meaningful error message
    const message =
      (data && (data.detail || data.message || data.error || data.Message)) ||
      `Request failed with status ${response.status}`;
    throw new APIError(message, response.status, data);
  }

  return data;
}

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {Object} payload - { name, email, password }
 */
async function registerUser(payload) {
  // Backend expects UserRegister schema: { gmail, password, confirm }
  const backendPayload = {
    gmail: payload.email,
    password: payload.password,
    confirm: payload.password // frontend register form checks if they match first
  };

  return apiFetch("/register", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  });
}

/**
 * Log in a user.
 * @param {Object} payload - { email, password }
 */
async function loginUser(payload) {
  // Backend expects userlogin schema: { gmail, password }
  const backendPayload = {
    gmail: payload.email,
    password: payload.password
  };

  const res = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  });

  // Map to token payload expected by frontend auth system
  return {
    access_token: res.token,
    token_type: "bearer"
  };
}

// ─── Knowledge Bases ──────────────────────────────────────────────────────────

/**
 * Get all knowledge bases for the authenticated user.
 */
async function getKnowledgeBases() {
  const res = await apiFetch("/KnowledgeBase");
  // Backend returns Array<{ id, name }>. Map to frontend structure
  if (Array.isArray(res)) {
    return res.map(kb => ({
      id: kb.id,
      name: kb.name,
      description: "AI Knowledge Container",
      document_count: 0,
      updated_at: new Date().toISOString()
    }));
  }
  return [];
}

/**
 * Get a single knowledge base.
 */
async function getKnowledgeBase(kbId) {
  const res = await apiFetch(`/knowledgeBase/${kbId}`);
  // Backend returns { Message: { name, info } }
  if (res && res.Message) {
    return {
      id: kbId,
      name: res.Message.name,
      description: res.Message.info || "AI Knowledge Container",
      document_count: 0,
      created_at: new Date().toISOString()
    };
  }
  return {
    id: kbId,
    name: "Knowledge Base",
    description: "",
    document_count: 0,
    created_at: new Date().toISOString()
  };
}

/**
 * Create a new knowledge base.
 * @param {Object} payload - { name, description }
 */
async function createKnowledgeBase(payload) {
  // Backend expects knowledgeBase schema: { name, info }
  const backendPayload = {
    name: payload.name,
    info: payload.description || ""
  };

  return apiFetch("/KnowledgeBase", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  });
}

/**
 * Delete a knowledge base and all its documents.
 */
async function deleteKnowledgeBase(kbId) {
  return apiFetch(`/knowledgeBase/${kbId}`, {
    method: "DELETE",
  });
}

/**
 * Get documents for a knowledge base.
 * Backend returns: { Message: "sucess", data: Array<{ document_id, file_name, content_type }> }
 * NOTE: Backend does not return a "status" field. Since processing is synchronous
 * (embedding happens inside the upload request), all returned docs are already "ready".
 */
async function getDocuments(kbId) {
  const res = await apiFetch(`/knowledgeBase/${kbId}/documents`);
  if (res && res.data) {
    return res.data.map(doc => ({
      id: doc.document_id,
      filename: doc.file_name,
      file_type: doc.file_name.split('.').pop() || "txt",
      content_type: doc.content_type,
      // Processing is synchronous in the backend (embeddings happen during upload),
      // so every document in the list has already been processed and is "ready".
      status: "ready",
      created_at: new Date().toISOString()
    }));
  }
  return [];
}

/**
 * Upload a document to a knowledge base.
 * NOTE: The backend processes embeddings SYNCHRONOUSLY inside this single request
 * (Supabase upload → HuggingFace embedding → Qdrant store).
 * This can take 30-120 seconds for large documents, so we use a 5-minute timeout.
 */
async function uploadDocument(kbId, file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  if (typeof onProgress === "function") {
    return _uploadWithProgress(`/knowledgeBase/${kbId}/documents`, formData, onProgress);
  }

  // 5-minute timeout for upload+embedding pipeline
  return apiFetch(`/knowledgeBase/${kbId}/documents`, {
    method: "POST",
    body: formData,
  }, 300000);
}

/**
 * Upload with XHR for progress tracking.
 */
function _uploadWithProgress(endpoint, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${CONFIG.API_BASE_URL}${endpoint}`);

    const token = Auth.getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 401 || xhr.status === 403) {
        Auth.handleUnauthorized();
        reject(new APIError("Session expired.", xhr.status));
        return;
      }

      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const message = (data && (data.detail || data.message)) || `Upload failed (${xhr.status})`;
        reject(new APIError(message, xhr.status, data));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new APIError("Network error during upload.", 0));
    });

    xhr.send(formData);
  });
}

/**
 * Delete a document.
 */
async function deleteDocument(kbId, documentId) {
  return apiFetch(`/knowledgeBase/${kbId}/documents/${documentId}`, {
    method: "DELETE",
  });
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Ask a question against a knowledge base.
 * RAG pipeline: vector search → context retrieval → LLM generation.
 * This can take a long time depending on document size and LLM speed,
 * so we use a 10-minute timeout with no artificial kill.
 */
async function askQuestion(kbId, question) {
  return apiFetch(`/knowledgeBase/${kbId}/chat`, {
    method: "POST",
    body: JSON.stringify({ question }),
  }, 600000); // 10 minutes — let the RAG pipeline finish
}
