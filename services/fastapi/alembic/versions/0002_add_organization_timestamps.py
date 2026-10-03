"""Add created_at and updated_at to organizations table.

Revision ID: 0002_add_org_timestamps
Revises: 0001_tasks
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_add_org_timestamps"
down_revision = "0001_tasks"
branch_labels = None
depends_on = "0001_tasks"


def upgrade() -> None:
    op.add_column(
        "organizations",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.add_column(
        "organizations",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("organizations", "updated_at")
    op.drop_column("organizations", "created_at")
