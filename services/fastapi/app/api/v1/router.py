from fastapi import APIRouter

from app.api.v1.endpoints.tasks import router as tasks_router
from app.api.v1.endpoints.organizations import router as organizations_router

router = APIRouter()
router.include_router(tasks_router)
router.include_router(organizations_router)