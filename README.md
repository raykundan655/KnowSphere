# KnowSphere — Knowledge Base AI Platform

**Live Demo:** [https://know-sphere-three.vercel.app/](https://know-sphere-three.vercel.app/)

KnowSphere is a Retrieval-Augmented Generation (RAG) platform that allows users to upload documents (PDF, DOCX, TXT) and engage in grounded AI chats based on their contents. It is built using FastAPI for the backend, vanilla ES6 JavaScript/HTML5 for the frontend, and utilizes Google Gemini, Qdrant Cloud, MongoDB Atlas, and Supabase.

---

## 🚀 Features
* **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens) and Bcrypt password hashing.
* **Knowledge Base Management:** Organize documents into separate, distinct Knowledge Bases.
* **Document Processing:** Streamlined uploading to Supabase Storage, automatic document chunking (RecursiveCharacterTextSplitter), and local vector embeddings (`SentenceTransformers`).
* **Vector Search:** Fast semantic lookup using Qdrant Cloud vector database.
* **Grounded AI Chat (RAG):** Interactive chatbot powered by Google Gemini (`gemini-3.6-flash`) returning answers backed by document references and sources.

---

## 🛠️ Tech Stack
* **Backend:** FastAPI, Python 3.11+, LangChain, PyMongo (MongoDB Atlas), Qdrant Client, Supabase Python SDK, PyJWT, Uvicorn.
* **Frontend:** Vanilla HTML5, Modern CSS3 (Variables, flexbox/grid layouts), ES6 JavaScript.
* **Database & Storage:**
  * **MongoDB Atlas:** User credentials, knowledge bases, and document metadata.
  * **Qdrant Cloud:** Vector store for semantic text chunks.
  * **Supabase Storage:** Direct storage for uploaded files.

---

## 💻 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/raykundan655/KnowSphere.git
cd KnowSphere
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URL="your-mongodb-connection-string"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_KEY="your-supabase-service-key"
QDRANT_URL="your-qdrant-cluster-url"
QDRANT_API_KEY="your-qdrant-api-key"
GOOGLE_API_KEY="your-google-ai-studio-gemini-api-key"
```

### 3. Setup Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv myenv

# Activate virtual environment
# On Windows:
myenv\Scripts\activate
# On macOS/Linux:
source myenv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 4. Start the Backend API
```bash
cd Backend
python -m uvicorn main:app --reload
```
The local server will start on `http://127.0.0.1:8000`.

### 5. Launch the Frontend
1. Open [`frontend/js/config.js`](frontend/js/config.js).
2. Ensure the `API_BASE_URL` is pointed to the local backend:
   ```javascript
   API_BASE_URL: "http://127.0.0.1:8000"
   ```
3. Open `frontend/index.html` using a local web server (such as VS Code's **Live Server** extension) or by hosting it on `http://localhost:5500`.

---

## 🐳 Docker Deployment
To run the backend inside a Docker container:

```bash
# Build the Docker image
docker build -t knowsphere-backend .

# Run the container loaded with env variables on port 8000
docker run -d \
  --name knowsphere-api \
  -p 8000:8000 \
  --env-file .env \
  --restart unless-stopped \
  knowsphere-backend
```
