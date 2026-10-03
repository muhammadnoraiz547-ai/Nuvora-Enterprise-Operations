# Nuvora FastAPI Tasks API

This service is the primary business API for the Tasks vertical slice. The existing Express health service and Drizzle package remain in the workspace and are not used for Task persistence.

## Windows PowerShell Setup

From the repository root:

```powershell
py -3.12 -m venv services/fastapi/.venv
services/fastapi/.venv/Scripts/python.exe -m pip install -e "services/fastapi[dev]"
Copy-Item services/fastapi/.env.example services/fastapi/.env
```

Set `DATABASE_URL` to the PostgreSQL database and configure `JWT_SECRET_KEY`, `JWT_ISSUER`, and `JWT_AUDIENCE` to match the trusted JWT issuer. The API verifies bearer tokens; it does not issue tokens or implement login.

Run Alembic and the API from the FastAPI directory:

```powershell
Push-Location services/fastapi
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
Pop-Location
```

Run the isolated backend tests:

```powershell
Push-Location services/fastapi
.\.venv\Scripts\pytest.exe -q
Pop-Location
```

The tests use SQLite in-memory with foreign-key enforcement. PostgreSQL migration DDL can be inspected without a database using:

```powershell
Push-Location services/fastapi
$env:DATABASE_URL = "postgresql+psycopg://user:password@localhost/nuvora"
.\.venv\Scripts\alembic.exe upgrade head --sql
Remove-Item Env:DATABASE_URL
Pop-Location
```

## OpenAPI Contract

FastAPI is the source of truth. After changing routes or Pydantic schemas, regenerate the checked-in contract and TypeScript clients:

```powershell
Push-Location services/fastapi
.\.venv\Scripts\python.exe -m app.export_openapi
Pop-Location
npm run codegen --workspace=@workspace/api-spec
```

Configure the Next.js frontend with `NEXT_PUBLIC_API_URL` and an active `NEXT_PUBLIC_ORGANIZATION_ID` in `artifacts/nuvora/.env.local`. The organization header is a requested context only; the API verifies membership against the authenticated JWT on every request.