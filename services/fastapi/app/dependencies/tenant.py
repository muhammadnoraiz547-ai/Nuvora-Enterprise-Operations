from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies.auth import AuthenticatedIdentity, get_authenticated_identity
from app.db.session import get_db
from app.models.identity import OrganizationMembership


@dataclass(frozen=True)
class TenantContext:
    organization_id: UUID
    user_id: UUID
    permissions: frozenset[str]


def get_tenant_context(
    organization_id: Annotated[UUID, Header(alias="Organization-ID")],
    identity: Annotated[AuthenticatedIdentity, Depends(get_authenticated_identity)],
    db: Annotated[Session, Depends(get_db)],
) -> TenantContext:
    membership = db.scalar(
        select(OrganizationMembership)
        .join(OrganizationMembership.user)
        .where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == identity.user_id,
            OrganizationMembership.is_active.is_(True),
            OrganizationMembership.user.has(is_active=True),
        )
    )
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an active member of the requested organization",
        )
    return TenantContext(
        organization_id=organization_id,
        user_id=identity.user_id,
        permissions=identity.permissions,
    )