from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analyze import router
from app.routers.download import router as download_router

app = FastAPI(
    title="YtAna - YouTube Comment Analyzer",
    description="AI-powered YouTube comment analysis using transformer models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
app.include_router(download_router, prefix="/api/v1")
