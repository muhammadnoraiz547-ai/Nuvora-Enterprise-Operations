from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.task import TaskCreate, TaskFilters, TaskListResponse, TaskResponse, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse, summary="List organization tasks")
def list_tasks(
    filters: Annotated[TaskFilters, Query()],
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> TaskListResponse:
    if filters.include_archived and "tasks.read_archived" not in tenant.permissions:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Archived task access is not authorized")
    return task_service.list_tasks(db, organization_id=tenant.organization_id, filters=filters)


@router.get("/{task_id}", response_model=TaskResponse, summary="Get an organization task")
def get_task(
    task_id: UUID,
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
    include_archived: bool = Query(default=False),
) -> TaskResponse:
    if include_archived and "tasks.read_archived" not in tenant.permissions:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Archived task access is not authorized")
    return task_service.get_task(
        db,
        organization_id=tenant.organization_id,
        task_id=task_id,
        include_archived=include_archived,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, summary="Create a task")
def create_task(
    payload: TaskCreate,
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> TaskResponse:
    return task_service.create_task(
        db,
        organization_id=tenant.organization_id,
        creator_user_id=tenant.user_id,
        payload=payload,
    )


@router.patch("/{task_id}", response_model=TaskResponse, summary="Update a task")
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> TaskResponse:
    return task_service.update_task(
        db,
        organization_id=tenant.organization_id,
        task_id=task_id,
        actor_user_id=tenant.user_id,
        payload=payload,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Archive a task")
def archive_task(
    task_id: UUID,
    tenant: Annotated[TenantContext, Depends(get_tenant_context)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    task_service.archive_task(
        db,
        organization_id=tenant.organization_id,
        task_id=task_id,
        actor_user_id=tenant.user_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)