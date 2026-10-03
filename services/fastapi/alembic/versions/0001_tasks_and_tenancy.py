"""Create minimal tenant references, Tasks, and task audit events.

Revision ID: 0001_tasks
Revises:
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_tasks"
down_revision = None
branch_labels = None
depends_on = None

task_status = postgresql.ENUM(
    "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED", name="task_status", create_type=False
)
task_priority = postgresql.ENUM("LOW", "MEDIUM", "HIGH", name="task_priority", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    task_status.create(bind, checkfirst=True)
    task_priority.create(bind, checkfirst=True)

    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("display_name", sa.String(200), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_table(
        "organization_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("organization_id", "user_id", name="uq_membership_organization_user"),
    )
    op.create_table(
        "sites",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("organization_id", "id", name="uq_site_organization_id"),
        sa.UniqueConstraint("organization_id", "name", name="uq_site_organization_name"),
    )
    op.create_table(
        "departments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("organization_id", "id", name="uq_department_organization_id"),
        sa.UniqueConstraint("organization_id", "name", name="uq_department_organization_name"),
    )
    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("site_id", postgresql.UUID(as_uuid=True)),
        sa.Column("department_id", postgresql.UUID(as_uuid=True)),
        sa.Column("creator_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assignee_user_id", postgresql.UUID(as_uuid=True)),
        sa.Column("title", sa.String(240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("category", sa.String(100)),
        sa.Column("status", task_status, nullable=False, server_default="TODO"),
        sa.Column("priority", task_priority, nullable=False, server_default="MEDIUM"),
        sa.Column("due_at", sa.DateTime(timezone=True)),
        sa.Column("parent_task_id", postgresql.UUID(as_uuid=True)),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("archived_at", sa.DateTime(timezone=True)),
        sa.Column("archived_by_user_id", postgresql.UUID(as_uuid=True)),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["organization_id", "creator_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "assignee_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "archived_by_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "site_id"], ["sites.organization_id", "sites.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "department_id"],
            ["departments.organization_id", "departments.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "parent_task_id"],
            ["tasks.organization_id", "tasks.id"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("organization_id", "id", name="uq_task_organization_id"),
        sa.CheckConstraint(
            "(archived_at IS NULL AND archived_by_user_id IS NULL) OR "
            "(archived_at IS NOT NULL AND archived_by_user_id IS NOT NULL)",
            name="ck_task_archive_actor_pair",
        ),
        sa.CheckConstraint("status != 'COMPLETED' OR completed_at IS NOT NULL", name="ck_task_completed_timestamp"),
    )
    op.create_index("ix_tasks_organization_status", "tasks", ["organization_id", "status"])
    op.create_index("ix_tasks_organization_assignee", "tasks", ["organization_id", "assignee_user_id"])
    op.create_index("ix_tasks_organization_archived", "tasks", ["organization_id", "archived_at"])
    op.create_index("ix_tasks_organization_due", "tasks", ["organization_id", "due_at"])
    op.create_table(
        "task_audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("task_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("details", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["organization_id", "task_id"], ["tasks.organization_id", "tasks.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["organization_id", "actor_user_id"],
            ["organization_memberships.organization_id", "organization_memberships.user_id"],
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_task_audit_org_task_created", "task_audit_events", ["organization_id", "task_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_task_audit_org_task_created", table_name="task_audit_events")
    op.drop_table("task_audit_events")
    op.drop_index("ix_tasks_organization_due", table_name="tasks")
    op.drop_index("ix_tasks_organization_archived", table_name="tasks")
    op.drop_index("ix_tasks_organization_assignee", table_name="tasks")
    op.drop_index("ix_tasks_organization_status", table_name="tasks")
    op.drop_table("tasks")
    op.drop_table("departments")
    op.drop_table("sites")
    op.drop_table("organization_memberships")
    op.drop_table("users")
    op.drop_table("organizations")
    task_priority.drop(op.get_bind(), checkfirst=True)
    task_status.drop(op.get_bind(), checkfirst=True)