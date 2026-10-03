from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.identity import Organization


class OrganizationRepository:
    @staticmethod
    def get_by_id(db: Session, organization_id: UUID) -> Organization | None:
        return db.scalar(
            select(Organization).where(Organization.id == organization_id)
        )

    @staticmethod
    def update(db: Session, organization_id: UUID, name: str) -> Organization:
        organization = db.scalar(
            select(Organization).where(Organization.id == organization_id)
        )
        if organization is None:
            raise ValueError(f"Organization {organization_id} not found")
        organization.name = name
        organization.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(organization)
        return organization
