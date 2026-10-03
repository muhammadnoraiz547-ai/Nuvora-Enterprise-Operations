from typing import Literal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit import TaskAuditEvent

TaskAuditType = Literal[
    "task.created",
    "task.updated",
    "task.assigned",
    "task.status_changed",
    "task.archived",
]


def record_task_event(
    db: Session,
    *,
    organization_id: UUID,
    task_id: UUID,
    actor_user_id: UUID,
    event_type: TaskAuditType,
    details: dict[str, object],
) -> None:
    db.add(
        TaskAuditEvent(
            organization_id=organization_id,
            task_id=task_id,
            actor_user_id=actor_user_id,
            event_type=event_type,
            details=details,
        )
    )