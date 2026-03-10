# Quick Start Guide - RDTR Spasial

Quick setup guide for local development.

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm 8+

---

## Installation

### 1. Install Node Dependencies

```bash
# From root directory
npm install
```

### 2. Install Python Dependencies

```bash
cd apps/backend
pip install -r requirements.txt
```

---

## Development

### Run Both Backend and Frontend

```bash
# From root directory
pnpm dev
```

This starts:

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Run Individually

```bash
# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend
```

---

## Data Setup

### Option 1: Symlink from Existing Project

```bash
cd packages
ln -s ../../RDTR-Spasial-Rev2/output data
```

### Option 2: Copy Data Files

```bash
mkdir -p packages/data
cp -r ../RDTR-Spasial-Rev2/output/* packages/data/
```

---

## API Documentation

Once backend is running:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Project Structure

```
rdtr-spasial-app/
├── apps/
│   ├── backend/          # FastAPI backend
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── api/      # API routes
│   │   │       ├── core/     # Config, spatial index, cache
│   │   │       ├── models/   # Pydantic models
│   │   │       ├── services/ # Business logic
│   │   │       └── main.py   # FastAPI app
│   │   └── requirements.txt
│   └── frontend/         # Next.js frontend
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   ├── components/    # React components
│       │   ├── lib/           # Utilities, API client
│       │   └── store/         # Zustand state
│       └── package.json
├── packages/
│   ├── shared/           # Shared types
│   └── data/             # GeoJSON data files
├── ecosystem.config.cjs  # PM2 configuration
├── docker-compose.yml    # Docker configuration
└── DEPLOYMENT.md         # Deployment guide
```

---

## Available Scripts

```bash
pnpm dev           # Start both backend and frontend
pnpm dev:backend   # Start backend only
pnpm dev:frontend  # Start frontend only
pnpm build         # Build both
pnpm build:backend # Build backend (prepare)
pnpm build:frontend # Build frontend
pnpm start         # Start with PM2
pnpm lint          # Lint all
pnpm clean         # Clean node_modules
```

---

## Troubleshooting

### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend can't connect to backend

1. Check if backend is running: http://localhost:8000/health
2. Check CORS settings in `apps/backend/src/app/core/config.py`
3. Check API_URL in `apps/frontend/.env.local`

### Data not loading

1. Check if data files exist in `packages/data/`
2. Check file structure matches expected format
3. Check backend logs for errors

---

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS deployment
- Read [README.md](./README.md) for project overview
