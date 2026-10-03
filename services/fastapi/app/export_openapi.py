from pathlib import Path

import yaml

from app.main import app


def main() -> None:
    repository_root = Path(__file__).resolve().parents[3]
    output_path = repository_root / "lib" / "api-spec" / "openapi.yaml"
    contract = app.openapi()
    contract["servers"] = [{"url": "/api", "description": "Nuvora API"}]
    contract["paths"] = {
        path.removeprefix("/api"): operations
        for path, operations in contract["paths"].items()
    }
    output_path.write_text(yaml.safe_dump(contract, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"Wrote FastAPI OpenAPI contract to {output_path}")


if __name__ == "__main__":
    main()