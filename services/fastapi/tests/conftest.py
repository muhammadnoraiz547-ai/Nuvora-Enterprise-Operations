from collections.abc import Generator
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings, get_settings
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.identity import Department, Organization, OrganizationMembership, Site, User

TEST_SECRET = "test-only-secret-key-that-is-at-least-32-characters"


@pytest.fixture
def test_context() -> Generator[dict[str, object], None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(connection, _record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    organization_a = Organization(id=uuid4(), name="Northstar A")
    organization_b = Organization(id=uuid4(), name="Northstar B")
    user_a = User(id=uuid4(), email="a@example.test", display_name="User A", is_active=True)
    user_a2 = User(id=uuid4(), email="a2@example.test", display_name="User A2", is_active=True)
    user_b = User(id=uuid4(), email="b@example.test", display_name="User B", is_active=True)
    site_a = Site(id=uuid4(), organization_id=organization_a.id, name="A Site")
    department_a = Department(id=uuid4(), organization_id=organization_a.id, name="A Department")

    with factory() as db:
        db.add_all([organization_a, organization_b, user_a, user_a2, user_b])
        db.flush()
        db.add_all([site_a, department_a])
        db.flush()
        db.add_all(
            [
                OrganizationMembership(
                    id=uuid4(), organization_id=organization_a.id, user_id=user_a.id, is_active=True
                ),
                OrganizationMembership(
                    id=uuid4(), organization_id=organization_a.id, user_id=user_a2.id, is_active=True
                ),
                OrganizationMembership(
                    id=uuid4(), organization_id=organization_b.id, user_id=user_b.id, is_active=True
                ),
            ]
        )
        db.commit()

    settings = Settings(
        database_url="sqlite://",
        jwt_secret_key=TEST_SECRET,
        jwt_algorithm="HS256",
        tasks_cors_origins="http://localhost:3000",
    )

    def override_get_db() -> Generator[Session, None, None]:
        with factory() as session:
            yield session

    application = create_app()
    application.dependency_overrides[get_db] = override_get_db
    application.dependency_overrides[get_settings] = lambda: settings

    context: dict[str, object] = {
        "engine": engine,
        "factory": factory,
        "organization_a": organization_a,
        "organization_b": organization_b,
        "user_a": user_a,
        "user_a2": user_a2,
        "user_b": user_b,
        "site_a": site_a,
        "department_a": department_a,
        "settings": settings,
        "app": application,
    }
    yield context
    application.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(test_context: dict[str, object]) -> Generator[TestClient, None, None]:
    with TestClient(test_context["app"]) as test_client:
        yield test_client


def auth_headers(
    user_id: UUID,
    organization_id: UUID,
    *,
    permissions: tuple[str, ...] = (),
) -> dict[str, str]:
    token = jwt.encode(
        {
            "sub": str(user_id),
            "exp": datetime.now(UTC) + timedelta(minutes=10),
            "permissions": list(permissions),
        },
        TEST_SECRET,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}", "Organization-ID": str(organization_id)}