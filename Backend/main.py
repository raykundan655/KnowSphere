from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import app as auth_router
from knowledge_base import app as kb_router
from documents import app as document_router
from chat import app as chat_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://know-sphere-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(kb_router)
app.include_router(document_router)
app.include_router(chat_router)

@app.get("/health")
def health():
    return {"status": "ok"}