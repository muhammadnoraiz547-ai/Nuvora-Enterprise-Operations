from uuid import UUID

from sqlalchemy.orm import Session

from app.models.identity import Organization
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationResponse, OrganizationUpdate


class OrganizationService:
    @staticmethod
    def get_organization(db: Session, organization_id: UUID) -> OrganizationResponse:
        organization = OrganizationRepository.get_by_id(db, organization_id)
        if organization is None:
            raise ValueError(f"Organization {organization_id} not found")
        return OrganizationResponse.model_validate(organization)

    @staticmethod
    def update_organization(
        db: Session, organization_id: UUID, payload: OrganizationUpdate
    ) -> OrganizationResponse:
        organization = OrganizationRepository.update(db, organization_id, payload.name)
        return OrganizationResponse.model_validate(organization)
