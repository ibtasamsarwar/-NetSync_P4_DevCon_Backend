from fastapi import APIRouter, Depends
from app.api.deps import require_roles

router = APIRouter()

@router.get("/organizer")
async def organizer_dashboard(user=Depends(require_roles("organizer"))):
    return {"message": "Welcome Organizer"}

@router.get("/attendee")
async def attendee_dashboard(user=Depends(require_roles("attendee"))):
    return {"message": "Welcome Attendee"}

@router.get("/staff")
async def staff_dashboard(user=Depends(require_roles("staff"))):
    return {"message": "Welcome Staff"}

@router.get("/super-admin")
async def admin_dashboard(user=Depends(require_roles("super_admin"))):
    return {"message": "Welcome Super Admin"}
