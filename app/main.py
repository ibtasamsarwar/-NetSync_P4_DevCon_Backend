from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth.routes import router as auth_router
from app.api.dashboards.routes import router as dashboard_router
from app.api.dev.routes import router as dev_router

app = FastAPI(
    title="NetSync",
    description="Smart Event Management & Networking Platform",
    version="1.0.0",
)

# =====================================================
# CORS CONFIGURATION
# =====================================================
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[
    #     "http://localhost:3000",
    #     "http://localhost:5173",
    #     "http://127.0.0.1:5173",
    #     # add production frontend here
    #     # "https://netsync.com"
    # ],
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ROUTERS
# =====================================================
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboards"])
app.include_router(dev_router, prefix="/dev", tags=["Development"])

# =====================================================
# HEALTH
# =====================================================
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "platform": "NetSync"}
