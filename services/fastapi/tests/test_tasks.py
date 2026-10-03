from uuid import UUID

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import sessionmaker

from app.models.audit import TaskAuditEvent
from app.models.task import Task
from conftest import auth_headers


def _headers(context, user_key="user_a", organization_key="organization_a", permissions=()):
    return auth_headers(
        getattr(context[user_key], "id"),
        getattr(context[organization_key], "id"),
        permissions=permissions,
    )


def _create_task(client, headers, title="Plan quarterly work", **fields):
    payload = {"title": title, **fields}
    return client.post("/api/tasks", headers=headers, json=payload)


def test_authenticated_member_can_list_and_create_in_their_organization(client, test_context):
    headers = _headers(test_context)
    response = _create_task(client, headers)

    assert response.status_code == 201
    assert response.json()["title"] == "Plan quarterly work"
    assert response.json()["creator_user_id"] == str(test_context["user_a"].id)
    assert response.json()["status"] == "TODO"
    assert set(response.json()["allowed_status_transitions"]) == {"IN_PROGRESS", "CANCELLED"}

    listed = client.get("/api/tasks", headers=headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["id"] == response.json()["id"]


def test_missing_or_invalid_organization_header_is_rejected(client, test_context):
    token_only = _headers(test_context)["Authorization"]
    missing = client.get("/api/tasks", headers={"Authorization": token_only})
    invalid = client.get("/api/tasks", headers={"Authorization": token_only, "Organization-ID": "not-a-uuid"})

    assert missing.status_code == 422
    assert invalid.status_code == 422


def test_unauthenticated_and_invalid_jwt_are_rejected(client, test_context):
    organization_id = str(test_context["organization_a"].id)
    missing = client.get("/api/tasks", headers={"Organization-ID": organization_id})
    invalid = client.get(
        "/api/tasks",
        headers={"Authorization": "Bearer not.a.jwt", "Organization-ID": organization_id},
    )

    assert missing.status_code == 401
    assert invalid.status_code == 401


def test_user_cannot_select_an_organization_without_active_membership(client, test_context):
    response = client.get(
        "/api/tasks",
        headers=_headers(test_context, organization_key="organization_b"),
    )

    assert response.status_code == 403


def test_task_lookup_is_tenant_scoped(client, test_context):
    task = _create_task(client, _headers(test_context), title="Tenant A task").json()
    response = client.get(
        f"/api/tasks/{task['id']}",
        headers=_headers(test_context, user_key="user_b", organization_key="organization_b"),
    )

    assert response.status_code == 404


def test_create_rejects_client_supplied_organization_or_creator(client, test_context):
    payload = {
        "title": "Spoofed task",
        "organization_id": str(test_context["organization_b"].id),
        "creator_user_id": str(test_context["user_b"].id),
    }
    response = client.post("/api/tasks", headers=_headers(test_context), json=payload)

    assert response.status_code == 422


def test_create_validates_assignee_site_and_department_scope(client, test_context):
    headers = _headers(test_context)
    valid = _create_task(
        client,
        headers,
        assignee_user_id=str(test_context["user_a2"].id),
        site_id=str(test_context["site_a"].id),
        department_id=str(test_context["department_a"].id),
    )
    invalid_assignee = _create_task(
        client,
        headers,
        title="Cross-organization assignee",
        assignee_user_id=str(test_context["user_b"].id),
    )

    assert valid.status_code == 201
    assert valid.json()["assignee_user_id"] == str(test_context["user_a2"].id)
    assert invalid_assignee.status_code == 422


def test_create_rejects_inactive_assignee(client, test_context):
    with test_context["factory"]() as db:
        user = db.get(type(test_context["user_a2"]), test_context["user_a2"].id)
        user.is_active = False
        db.commit()

    response = _create_task(
        client,
        _headers(test_context),
        assignee_user_id=str(test_context["user_a2"].id),
    )

    assert response.status_code == 422


def test_update_and_valid_status_transition_create_audit_events(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    response = client.patch(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"title": "Updated title", "status": "IN_PROGRESS"},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"
    assert response.json()["status"] == "IN_PROGRESS"
    with test_context["factory"]() as db:
        event_types = set(db.scalars(select(TaskAuditEvent.event_type)).all())
    assert {"task.created", "task.updated", "task.status_changed"}.issubset(event_types)


def test_assignment_change_creates_assignment_audit_event(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    response = client.patch(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"assignee_user_id": str(test_context["user_a2"].id)},
    )

    assert response.status_code == 200
    with test_context["factory"]() as db:
        assignment_events = db.scalars(
            select(TaskAuditEvent).where(TaskAuditEvent.event_type == "task.assigned")
        ).all()
    assert len(assignment_events) == 1


def test_invalid_status_transition_returns_conflict(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    response = client.patch(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"status": "COMPLETED"},
    )

    assert response.status_code == 409


@pytest.mark.parametrize(
    ("setup_transitions", "target_status"),
    [
        ([], "IN_PROGRESS"),
        ([], "CANCELLED"),
        (["IN_PROGRESS"], "BLOCKED"),
        (["IN_PROGRESS"], "COMPLETED"),
        (["IN_PROGRESS"], "CANCELLED"),
        (["IN_PROGRESS", "BLOCKED"], "IN_PROGRESS"),
        (["IN_PROGRESS", "BLOCKED"], "CANCELLED"),
    ],
)
def test_each_allowed_status_transition(
    client,
    test_context,
    setup_transitions: list[str],
    target_status: str,
):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    for transition in setup_transitions:
        response = client.patch(
            f"/api/tasks/{task['id']}",
            headers=headers,
            json={"status": transition},
        )
        assert response.status_code == 200

    response = client.patch(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"status": target_status},
    )
    assert response.status_code == 200
    assert response.json()["status"] == target_status


def test_terminal_status_cannot_be_changed_through_normal_transition(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    client.patch(f"/api/tasks/{task['id']}", headers=headers, json={"status": "CANCELLED"})
    response = client.patch(
        f"/api/tasks/{task['id']}",
        headers=headers,
        json={"status": "TODO"},
    )

    assert response.status_code == 409


def test_completed_task_cannot_be_reopened_normally(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    client.patch(f"/api/tasks/{task['id']}", headers=headers, json={"status": "IN_PROGRESS"})
    client.patch(f"/api/tasks/{task['id']}", headers=headers, json={"status": "COMPLETED"})
    response = client.patch(f"/api/tasks/{task['id']}", headers=headers, json={"status": "TODO"})

    assert response.status_code == 409


def test_archive_is_soft_and_excluded_from_normal_lists(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    archived = client.delete(f"/api/tasks/{task['id']}", headers=headers)
    listed = client.get("/api/tasks", headers=headers)
    detail = client.get(f"/api/tasks/{task['id']}", headers=headers)

    assert archived.status_code == 204
    assert listed.json()["total"] == 0
    assert detail.status_code == 404
    with test_context["factory"]() as db:
        stored = db.scalar(select(Task).where(Task.id == UUID(task["id"])))
        audit_exists = db.scalar(
            select(func.count(TaskAuditEvent.id)).where(TaskAuditEvent.event_type == "task.archived")
        )
    assert stored is not None
    assert stored.archived_at is not None
    assert stored.archived_by_user_id == test_context["user_a"].id
    assert audit_exists == 1


def test_archived_history_requires_capability_and_does_not_physically_delete(client, test_context):
    headers = _headers(test_context)
    task = _create_task(client, headers).json()
    client.delete(f"/api/tasks/{task['id']}", headers=headers)

    forbidden = client.get("/api/tasks?include_archived=true", headers=headers)
    allowed_headers = _headers(test_context, permissions=("tasks.read_archived",))
    history = client.get("/api/tasks?include_archived=true", headers=allowed_headers)
    second_archive = client.delete(f"/api/tasks/{task['id']}", headers=headers)

    assert forbidden.status_code == 403
    assert history.status_code == 200
    assert history.json()["total"] == 1
    assert second_archive.status_code == 404
    with test_context["factory"]() as db:
        assert db.scalar(select(func.count(Task.id)).where(Task.id == UUID(task["id"]))) == 1


def test_filter_search_pagination_and_sorting(client, test_context):
    headers = _headers(test_context)
    created = [
        _create_task(client, headers, "Planning Alpha", priority="HIGH", category="Planning").json(),
        _create_task(client, headers, "Planning Beta", priority="LOW", category="Planning").json(),
        _create_task(client, headers, "Support Gamma", priority="HIGH", category="Support").json(),
    ]
    client.patch(f"/api/tasks/{created[1]['id']}", headers=headers, json={"status": "IN_PROGRESS"})

    filtered = client.get(
        "/api/tasks?status=IN_PROGRESS&priority=LOW&search=Planning&page=1&page_size=1&sort_by=title&sort_order=asc",
        headers=headers,
    )

    assert filtered.status_code == 200
    body = filtered.json()
    assert body["total"] == 1
    assert body["page"] == 1
    assert body["page_size"] == 1
    assert body["items"][0]["title"] == "Planning Beta"


def test_pagination_and_sort_are_stable_across_pages(client, test_context):
    headers = _headers(test_context)
    for title in ("Charlie", "Alpha", "Bravo"):
        assert _create_task(client, headers, title).status_code == 201

    first_page = client.get(
        "/api/tasks?page=1&page_size=2&sort_by=title&sort_order=asc",
        headers=headers,
    ).json()
    second_page = client.get(
        "/api/tasks?page=2&page_size=2&sort_by=title&sort_order=asc",
        headers=headers,
    ).json()

    assert first_page["total"] == 3
    assert [task["title"] for task in first_page["items"]] == ["Alpha", "Bravo"]
    assert [task["title"] for task in second_page["items"]] == ["Charlie"]


def test_site_department_and_assignee_filters(client, test_context):
    headers = _headers(test_context)
    task = _create_task(
        client,
        headers,
        assignee_user_id=str(test_context["user_a2"].id),
        site_id=str(test_context["site_a"].id),
        department_id=str(test_context["department_a"].id),
    ).json()

    response = client.get(
        "/api/tasks",
        headers=headers,
        params={
            "assignee_id": str(test_context["user_a2"].id),
            "site_id": str(test_context["site_a"].id),
            "department_id": str(test_context["department_a"].id),
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()["items"]] == [task["id"]]


def test_unrecognized_status_and_sort_field_are_rejected(client, test_context):
    headers = _headers(test_context)
    bad_status = client.get("/api/tasks?status=WAITING", headers=headers)
    bad_sort = client.get("/api/tasks?sort_by=organization_id", headers=headers)

    assert bad_status.status_code == 422
    assert bad_sort.status_code == 422


def test_task_not_found_inside_authorized_tenant_returns_404(client, test_context):
    response = client.get(
        f"/api/tasks/{UUID(int=0)}",
        headers=_headers(test_context),
    )

    assert response.status_code == 404