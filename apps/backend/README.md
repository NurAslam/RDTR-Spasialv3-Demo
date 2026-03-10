# RDTR Spasial Backend

FastAPI backend for RDTR Spasial application.

## 📁 Structure

```
apps/backend/
├── src/
│   └── app/
│       ├── api/              # API routes
│       │   ├── v1/           # API v1 routes
│       │   └── deps.py       # Dependencies
│       ├── core/             # Core functionality
│       │   ├── config.py     # Configuration
│       │   ├── spatial.py    # Spatial indexing
│       │   └── cache.py      # Cache management
│       ├── models/           # Pydantic models
│       ├── services/         # Business logic
│       ├── main.py           # FastAPI app
│       └── __init__.py
├── tests/                    # Tests
├── pyproject.toml           # Project config
└── requirements.txt         # Python dependencies
```

## 🚀 Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the script
python -m app.main
```

## 🏗️ Build

For production, run with gunicorn:

```bash
gunicorn src.app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📝 API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
