from typing import Any
from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, aliased

from app.models.enums import TaskPriority, TaskStatus
from app.models.identity import Department, OrganizationMembership, Site, User
from app.models.task import Task
from app.schemas.task import TaskFilters


def get_task(
    db: Session,
    *,
    organization_id: UUID,
    task_id: UUID,
    include_archived: bool = False,
) -> Task | None:
    statement = select(Task).where(
        Task.organization_id == organization_id,
        Task.id == task_id,
    )
    if not include_archived:
        statement = statement.where(Task.archived_at.is_(None))
    return db.scalar(statement)


def _task_predicates(organization_id: UUID, filters: TaskFilters) -> list[Any]:
    predicates: list[Any] = [Task.organization_id == organization_id]
    if not filters.include_archived:
        predicates.append(Task.archived_at.is_(None))
    if filters.status:
        predicates.append(Task.status.in_(filters.status))
    if filters.priority:
        predicates.append(Task.priority == filters.priority)
    if filters.assignee_id:
        predicates.append(Task.assignee_user_id == filters.assignee_id)
    if filters.site_id:
        predicates.append(Task.site_id == filters.site_id)
    if filters.department_id:
        predicates.append(Task.department_id == filters.department_id)
    if filters.search:
        term = f"%{filters.search.strip()}%"
        predicates.append(or_(Task.title.ilike(term), Task.description.ilike(term)))
    return predicates


def list_tasks(
    db: Session,
    *,
    organization_id: UUID,
    filters: TaskFilters,
) -> tuple[list[tuple[Task, str, str | None]], int]:
    creator = aliased(User)
    assignee = aliased(User)
    predicates = _task_predicates(organization_id, filters)
    sort_column = getattr(Task, filters.sort_by)
    sort_expression = sort_column.asc() if filters.sort_order == "asc" else sort_column.desc()

    statement: Select[tuple[Task, str, str | None]] = (
        select(Task, creator.display_name, assignee.display_name)
        .join(creator, creator.id == Task.creator_user_id)
        .outerjoin(assignee, assignee.id == Task.assignee_user_id)
        .where(*predicates)
        .order_by(sort_expression, Task.id.asc())
        .offset((filters.page - 1) * filters.page_size)
        .limit(filters.page_size)
    )
    total = db.scalar(select(func.count(Task.id)).where(*predicates)) or 0
    return list(db.execute(statement).all()), total


def get_active_membership(db: Session, *, organization_id: UUID, user_id: UUID) -> bool:
    return bool(
        db.scalar(
            select(func.count(OrganizationMembership.id))
            .join(User, User.id == OrganizationMembership.user_id)
            .where(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.user_id == user_id,
                OrganizationMembership.is_active.is_(True),
                User.is_active.is_(True),
            )
        )
    )


def valid_assignee(db: Session, *, organization_id: UUID, user_id: UUID) -> bool:
    return get_active_membership(db, organization_id=organization_id, user_id=user_id)


def valid_site(db: Session, *, organization_id: UUID, site_id: UUID) -> bool:
    return db.scalar(select(Site.id).where(Site.organization_id == organization_id, Site.id == site_id)) is not None


def valid_department(db: Session, *, organization_id: UUID, department_id: UUID) -> bool:
    return (
        db.scalar(
            select(Department.id).where(
                Department.organization_id == organization_id,
                Department.id == department_id,
            )
        )
        is not None
    )