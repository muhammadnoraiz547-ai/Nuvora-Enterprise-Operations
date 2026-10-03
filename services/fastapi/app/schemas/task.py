from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=240)
    description: str | None = Field(default=None, max_length=10000)
    category: str | None = Field(default=None, max_length=100)
    priority: TaskPriority = TaskPriority.MEDIUM
    due_at: datetime | None = None
    assignee_user_id: UUID | None = None
    site_id: UUID | None = None
    department_id: UUID | None = None
    parent_task_id: UUID | None = None
    metadata: dict[str, object] = Field(default_factory=dict)


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = Field(default=None, max_length=10000)
    category: str | None = Field(default=None, max_length=100)
    priority: TaskPriority | None = None
    due_at: datetime | None = None
    assignee_user_id: UUID | None = None
    site_id: UUID | None = None
    department_id: UUID | None = None
    parent_task_id: UUID | None = None
    status: TaskStatus | None = None
    metadata: dict[str, object] | None = None

    @model_validator(mode="after")
    def reject_null_for_non_nullable_fields(self) -> "TaskUpdate":
        for field_name in ("title", "priority", "status", "metadata"):
            if field_name in self.model_fields_set and getattr(self, field_name) is None:
                raise ValueError(f"{field_name} cannot be null")
        return self


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    site_id: UUID | None
    department_id: UUID | None
    creator_user_id: UUID
    assignee_user_id: UUID | None
    creator_display_name: str
    assignee_display_name: str | None
    title: str
    description: str | None
    category: str | None
    status: TaskStatus
    allowed_status_transitions: list[TaskStatus]
    priority: TaskPriority
    due_at: datetime | None
    parent_task_id: UUID | None
    metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    archived_at: datetime | None
    archived_by_user_id: UUID | None


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    page: int
    page_size: int
    total: int


class TaskFilters(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: list[TaskStatus] | None = None
    priority: TaskPriority | None = None
    assignee_id: UUID | None = None
    site_id: UUID | None = None
    department_id: UUID | None = None
    search: str | None = Field(default=None, max_length=200)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)
    sort_by: Literal["created_at", "updated_at", "due_at", "title", "status", "priority"] = "updated_at"
    sort_order: Literal["asc", "desc"] = "desc"
    include_archived: bool = False