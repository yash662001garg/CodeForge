
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_routes import router as auth_router
from app.api.compiler_routes import router as compiler_router

app = FastAPI(title="CodeForge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.database import engine, Base
from app import models

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"\n  WARNING: Could not connect to PostgreSQL. Make sure the database is running!\nError: {e}\n")

app.include_router(auth_router, prefix="/auth")
app.include_router(compiler_router, prefix="/compiler")

@app.get("/")
def health():
    return {"status": "running"}
