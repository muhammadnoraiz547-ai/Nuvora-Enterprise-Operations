from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import TaskStatus
from app.models.identity import User
from app.models.task import Task
from app.repositories import task_repository
from app.schemas.task import TaskCreate, TaskFilters, TaskListResponse, TaskResponse, TaskUpdate
from app.services.audit_service import record_task_event

VALID_STATUS_TRANSITIONS: dict[TaskStatus, frozenset[TaskStatus]] = {
    TaskStatus.TODO: frozenset({TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED}),
    TaskStatus.IN_PROGRESS: frozenset(
        {TaskStatus.BLOCKED, TaskStatus.COMPLETED, TaskStatus.CANCELLED}
    ),
    TaskStatus.BLOCKED: frozenset({TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED}),
    TaskStatus.COMPLETED: frozenset(),
    TaskStatus.CANCELLED: frozenset(),
}


def _task_response(
    task: Task,
    *,
    creator_display_name: str,
    assignee_display_name: str | None,
) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        organization_id=task.organization_id,
        site_id=task.site_id,
        department_id=task.department_id,
        creator_user_id=task.creator_user_id,
        assignee_user_id=task.assignee_user_id,
        creator_display_name=creator_display_name,
        assignee_display_name=assignee_display_name,
        title=task.title,
        description=task.description,
        category=task.category,
        status=task.status,
        allowed_status_transitions=sorted(
            VALID_STATUS_TRANSITIONS[task.status], key=lambda transition: transition.value
        ),
        priority=task.priority,
        due_at=task.due_at,
        parent_task_id=task.parent_task_id,
        metadata=task.metadata_json,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
        archived_at=task.archived_at,
        archived_by_user_id=task.archived_by_user_id,
    )


def _response_for_task(db: Session, task: Task) -> TaskResponse:
    creator_name = db.scalar(select(User.display_name).where(User.id == task.creator_user_id))
    assignee_name = (
        db.scalar(select(User.display_name).where(User.id == task.assignee_user_id))
        if task.assignee_user_id
        else None
    )
    if creator_name is None:
        raise HTTPException(status_code=500, detail="Task creator record is missing")
    return _task_response(
        task,
        creator_display_name=creator_name,
        assignee_display_name=assignee_name,
    )


def _response_from_row(row: tuple[Task, str, str | None]) -> TaskResponse:
    task, creator_name, assignee_name = row
    return _task_response(
        task,
        creator_display_name=creator_name,
        assignee_display_name=assignee_name,
    )


def _validate_scope(
    db: Session,
    *,
    organization_id: UUID,
    assignee_user_id: UUID | None,
    site_id: UUID | None,
    department_id: UUID | None,
    parent_task_id: UUID | None,
    current_task_id: UUID | None = None,
) -> None:
    if assignee_user_id and not task_repository.valid_assignee(
        db, organization_id=organization_id, user_id=assignee_user_id
    ):
        raise HTTPException(status_code=422, detail="Assignee is not an active member of this organization")
    if site_id and not task_repository.valid_site(db, organization_id=organization_id, site_id=site_id):
        raise HTTPException(status_code=422, detail="Site does not belong to this organization")
    if department_id and not task_repository.valid_department(
        db, organization_id=organization_id, department_id=department_id
    ):
        raise HTTPException(status_code=422, detail="Department does not belong to this organization")
    if parent_task_id:
        if current_task_id == parent_task_id:
            raise HTTPException(status_code=422, detail="A task cannot be its own parent")
        parent = task_repository.get_task(
            db,
            organization_id=organization_id,
            task_id=parent_task_id,
        )
        if parent is None:
            raise HTTPException(status_code=422, detail="Parent task is not available in this organization")


def list_tasks(
    db: Session,
    *,
    organization_id: UUID,
    filters: TaskFilters,
) -> TaskListResponse:
    rows, total = task_repository.list_tasks(
        db,
        organization_id=organization_id,
        filters=filters,
    )
    return TaskListResponse(
        items=[_response_from_row(row) for row in rows],
        page=filters.page,
        page_size=filters.page_size,
        total=total,
    )


def get_task(
    db: Session,
    *,
    organization_id: UUID,
    task_id: UUID,
    include_archived: bool = False,
) -> TaskResponse:
    task = task_repository.get_task(
        db,
        organization_id=organization_id,
        task_id=task_id,
        include_archived=include_archived,
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _response_for_task(db, task)


def create_task(
    db: Session,
    *,
    organization_id: UUID,
    creator_user_id: UUID,
    payload: TaskCreate,
) -> TaskResponse:
    _validate_scope(
        db,
        organization_id=organization_id,
        assignee_user_id=payload.assignee_user_id,
        site_id=payload.site_id,
        department_id=payload.department_id,
        parent_task_id=payload.parent_task_id,
    )
    task = Task(
        organization_id=organization_id,
        creator_user_id=creator_user_id,
        title=payload.title.strip(),
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        due_at=payload.due_at,
        assignee_user_id=payload.assignee_user_id,
        site_id=payload.site_id,
        department_id=payload.department_id,
        parent_task_id=payload.parent_task_id,
        metadata_json=payload.metadata,
    )
    try:
        db.add(task)
        db.flush()
        record_task_event(
            db,
            organization_id=organization_id,
            task_id=task.id,
            actor_user_id=creator_user_id,
            event_type="task.created",
            details={"title": task.title},
        )
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise
    return _response_for_task(db, task)


def update_task(
    db: Session,
    *,
    organization_id: UUID,
    task_id: UUID,
    actor_user_id: UUID,
    payload: TaskUpdate,
) -> TaskResponse:
    task = task_repository.get_task(db, organization_id=organization_id, task_id=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one field must be supplied")

    for required in ("title", "priority", "status", "metadata"):
        if required in changes and changes[required] is None:
            raise HTTPException(status_code=422, detail=f"{required} cannot be null")
    if "title" in changes:
        changes["title"] = changes["title"].strip()
        if not changes["title"]:
            raise HTTPException(status_code=422, detail="title cannot be empty")

    _validate_scope(
        db,
        organization_id=organization_id,
        assignee_user_id=changes.get("assignee_user_id", task.assignee_user_id),
        site_id=changes.get("site_id", task.site_id),
        department_id=changes.get("department_id", task.department_id),
        parent_task_id=changes.get("parent_task_id", task.parent_task_id),
        current_task_id=task.id,
    )

    old_assignee = task.assignee_user_id
    old_status = task.status
    next_status = changes.get("status", old_status)
    if next_status != old_status:
        if next_status not in VALID_STATUS_TRANSITIONS[old_status]:
            raise HTTPException(
                status_code=409,
                detail=f"Invalid task status transition: {old_status.value} -> {next_status.value}",
            )
        task.completed_at = datetime.now(UTC) if next_status == TaskStatus.COMPLETED else None

    try:
        for field_name, value in changes.items():
            if field_name != "status":
                setattr(task, "metadata_json" if field_name == "metadata" else field_name, value)
        if "status" in changes:
            task.status = next_status
        db.flush()
        record_task_event(
            db,
            organization_id=organization_id,
            task_id=task.id,
            actor_user_id=actor_user_id,
            event_type="task.updated",
            details={"fields": sorted(changes)},
        )
        if old_assignee != task.assignee_user_id:
            record_task_event(
                db,
                organization_id=organization_id,
                task_id=task.id,
                actor_user_id=actor_user_id,
                event_type="task.assigned",
                details={"from_user_id": str(old_assignee) if old_assignee else None,
                         "to_user_id": str(task.assignee_user_id) if task.assignee_user_id else None},
            )
        if old_status != task.status:
            record_task_event(
                db,
                organization_id=organization_id,
                task_id=task.id,
                actor_user_id=actor_user_id,
                event_type="task.status_changed",
                details={"from_status": old_status.value, "to_status": task.status.value},
            )
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise
    return _response_for_task(db, task)


def archive_task(
    db: Session,
    *,
    organization_id: UUID,
    task_id: UUID,
    actor_user_id: UUID,
) -> None:
    task = task_repository.get_task(db, organization_id=organization_id, task_id=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    try:
        task.archived_at = datetime.now(UTC)
        task.archived_by_user_id = actor_user_id
        db.flush()
        record_task_event(
            db,
            organization_id=organization_id,
            task_id=task.id,
            actor_user_id=actor_user_id,
            event_type="task.archived",
            details={},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise