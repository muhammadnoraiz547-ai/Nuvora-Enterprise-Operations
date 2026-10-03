from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKeyConstraint, Index, JSON, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db.base import Base
from app.models.enums import TaskPriority, TaskStatus

task_metadata_type = JSON().with_variant(JSONB(), "postgresql")


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_task_organization_id"),
        ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        ForeignKeyConstraint(
            ["organization_id", "creator_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["organization_id", "assignee_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["organization_id", "archived_by_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["organization_id", "site_id"],
            ["sites.organization_id", "sites.id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["organization_id", "department_id"],
            ["departments.organization_id", "departments.id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["organization_id", "parent_task_id"],
            ["tasks.organization_id", "tasks.id"],
            ondelete="RESTRICT",
        ),
        CheckConstraint(
            "(archived_at IS NULL AND archived_by_user_id IS NULL) OR "
            "(archived_at IS NOT NULL AND archived_by_user_id IS NOT NULL)",
            name="ck_task_archive_actor_pair",
        ),
        CheckConstraint(
            "status != 'COMPLETED' OR completed_at IS NOT NULL",
            name="ck_task_completed_timestamp",
        ),
        Index("ix_tasks_organization_status", "organization_id", "status"),
        Index("ix_tasks_organization_assignee", "organization_id", "assignee_user_id"),
        Index("ix_tasks_organization_archived", "organization_id", "archived_at"),
        Index("ix_tasks_organization_due", "organization_id", "due_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    site_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    department_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    creator_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    assignee_user_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str | None] = mapped_column(String)
    category: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", native_enum=True, create_constraint=True),
        nullable=False,
        default=TaskStatus.TODO,
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name="task_priority", native_enum=True, create_constraint=True),
        nullable=False,
        default=TaskPriority.MEDIUM,
    )
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    parent_task_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    metadata_json: Mapped[dict[str, object]] = mapped_column("metadata", task_metadata_type, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    archived_by_user_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
