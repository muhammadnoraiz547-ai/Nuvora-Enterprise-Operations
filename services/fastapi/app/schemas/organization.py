from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class OrganizationUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
