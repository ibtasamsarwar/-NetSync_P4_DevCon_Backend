from fastapi import FastAPI
from app.api.auth.routes import router as auth_router
from app.api.dashboards.routes import router as dashboard_router
from app.api.dev.routes import router as dev_router

app = FastAPI(
    title="NetSync",
    description="Smart Event Management & Networking Platform",
    version="1.0.0",
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboards"])
app.include_router(dev_router, prefix="/dev", tags=["Development"])

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "platform": "NetSync"}
