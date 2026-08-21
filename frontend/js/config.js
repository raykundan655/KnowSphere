/**
 * config.js
 * Central configuration for the Knowledge Base AI Platform.
 * Update API_BASE_URL to point to your FastAPI backend.
 */

const CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000",

  // Supported file types for document upload
  SUPPORTED_FILE_TYPES: [".pdf", ".docx", ".txt"],
  SUPPORTED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],

  // Max file size: 50 MB
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,

  // Document status polling interval (ms)
  POLLING_INTERVAL_MS: 3000,

  // Toast display duration (ms)
  TOAST_DURATION_MS: 4000,

  // App name
  APP_NAME: "KnowSphere",
};

// Freeze so config can't be mutated at runtime
Object.freeze(CONFIG);
