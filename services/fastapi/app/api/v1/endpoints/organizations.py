from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.organization import OrganizationResponse, OrganizationUpdate
from app.services import organization_service

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/current", response_model=OrganizationResponse, summary="Get current organization")
def get_current_organization(
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationResponse:
    try:
        return organization_service.get_organization(db, tenant.organization_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch("/current", response_model=OrganizationResponse, summary="Update current organization")
def update_current_organization(
    payload: OrganizationUpdate,
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationResponse:
    try:
        return organization_service.update_organization(db, tenant.organization_id, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
