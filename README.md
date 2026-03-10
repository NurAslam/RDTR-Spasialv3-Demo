# RDTR Spasial - Monorepo

Web aplikasi spasial interaktif untuk visualisasi RDTR (Rencana Detail Tata Ruang) dengan arsitektur monorepo.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Node](https://img.shields.io/badge/node-18%2B-green)
![Next](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)

---

## 🏗️ Arsitektur

```
rdtr-spasial-app/
├── apps/
│   ├── backend/          # FastAPI (Python 3.11+)
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── api/          # API routes (v1)
│   │   │       │   ├── deps.py
│   │   │       │   ├── health.py
│   │   │       │   ├── summary.py
│   │   │       │   ├── geojson.py
│   │   │       │   ├── locations.py
│   │   │       │   └── cache.py
│   │   │       ├── core/         # Core functionality
│   │   │       │   ├── config.py     # Settings
│   │   │       │   ├── spatial.py    # Spatial indexing
│   │   │       │   └── cache.py      # Cache management
│   │   │       ├── models/       # Pydantic models
│   │   │       ├── services/     # Business logic
│   │   │       └── main.py       # FastAPI app entry
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── frontend/         # Next.js 15 (React 19)
│       ├── src/
│       │   ├── app/                 # Next.js App Router
│       │   ├── components/          # React components
│       │   │   ├── layout/          # Header, Sidebar, DetailPanel
│       │   │   ├── map/             # MapView, GridView
│       │   │   └── ui/              # UI components
│       │   ├── lib/                # Utilities & API client
│       │   ├── store/              # Zustand state management
│       │   └── globals.css
│       ├── package.json
│       └── Dockerfile
├── packages/
│   ├── shared/           # Shared TypeScript types
│   └── data/             # GeoJSON data files
├── ecosystem.config.cjs  # PM2 configuration
├── docker-compose.yml    # Docker Compose setup
├── nginx.conf            # Nginx reverse proxy
├── README.md             # This file
├── QUICKSTART.md         # Quick start guide
└── DEPLOYMENT.md         # Deployment guide
```

---

## 🚀 Tech Stack

### Backend
- **FastAPI** 0.115+ - Modern Python web framework
- **Pydantic** 2.0+ - Data validation
- **uvicorn** - ASGI server
- **shapely** - Geospatial operations
- **Custom Spatial Index** - Grid-based spatial indexing for fast queries

### Frontend
- **Next.js** 15+ - React framework with App Router
- **React** 19 - Latest React
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Leaflet** + react-leaflet - Map visualization
- **Zustand** - Lightweight state management
- **Axios** - HTTP client

### DevOps
- **PM2** - Process manager (VPS deployment)
- **Docker** - Containerization
- **Nginx** - Reverse proxy & static serving
- **pnpm** - Fast, disk space efficient package manager

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm 8+

### Installation

```bash
# Clone repository
git clone <your-repo>
cd rdtr-spasial-app

# Install dependencies
pnpm install

# Install Python dependencies
cd apps/backend
pip install -r requirements.txt
cd ../..
```

### Setup Data

```bash
# Option 1: Symlink from existing project
cd packages
ln -s ../../RDTR-Spasial-Rev2/output data

# Option 2: Copy data files
mkdir -p packages/data
cp -r ../RDTR-Spasial-Rev2/output/* packages/data/
```

### Development

```bash
# Run both backend and frontend
pnpm dev

# Backend only: http://localhost:8000
pnpm dev:backend

# Frontend only: http://localhost:3000
pnpm dev:frontend
```

---

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - VPS deployment guide

---

## 🔗 API Endpoints

### Base URL: `http://localhost:8000`

#### Health & Status
- `GET /health` - Health check
- `GET /api/v1/health` - Detailed health status

#### Summary
- `GET /api/v1/summary` - Get summary statistics

#### GeoJSON Data
- `GET /api/v1/geojson/{area_name}` - Get GeoJSON with viewport filtering
  - Query params: `minx`, `miny`, `maxx`, `maxy` (viewport bounds)
  - Query params: `zones` (zone codes to filter)
- `GET /api/v1/geojson/list/all` - List all available GeoJSON files

#### Locations
- `GET /api/v1/locations/provinces` - List all provinces
- `GET /api/v1/locations/regencies/{province}` - List regencies by province
- `GET /api/v1/locations/rdtr/{province}/{regency}` - List RDTR by province & regency

#### Cache
- `POST /api/v1/cache/clear` - Clear all cached data
- `GET /api/v1/cache/status` - Get cache status

#### Documentation
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc

---

## 🏗️ Build & Production

### Build All

```bash
pnpm build
```

### Production with PM2 (Recommended for VPS)

```bash
# Build frontend
cd apps/frontend
pnpm build
cd ../..

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Production with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📁 Data Structure

GeoJSON files should follow this structure:

```
packages/data/
├── Kalimantan Barat/
│   ├── Kab. Sambas/
│   │   └── rdtr/
│   │       ├── RDTR Kab. Sambas - Sambas.geojson
│   │       ├── RDTR Kab. Sambas - KPN Pada Pusat Kegiatan Strategis Nasional Paloh-Aruk.geojson
│   │       └── ...
│   ├── Kab. Mempawah/
│   │   └── rdtr/
│   │       └── ...
│   └── ...
└── Kalimantan Timur/
    ├── Kota Samarinda/
    │   └── rdtr/
    │       └── ...
    └── ...
```

---

## 🎨 Features

### Backend
- ✅ Modular structure with separation of concerns
- ✅ Fast async I/O with uvicorn
- ✅ Pydantic v2 for request/response validation
- ✅ Grid-based spatial indexing for fast viewport queries
- ✅ In-memory caching with optional Redis support
- ✅ Automatic API documentation (Swagger/ReDoc)
- ✅ CORS support

### Frontend
- ✅ Next.js App Router with Server Components
- ✅ TypeScript for type safety
- ✅ Zustand for lightweight state management
- ✅ Interactive map with Leaflet
- ✅ Viewport filtering for performance
- ✅ Zone filtering
- ✅ Responsive design with Tailwind CSS

---

## 🔧 Configuration

### Backend Environment Variables

See `.env.example`:
- `DEBUG` - Debug mode (default: false)
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `FRONTEND_URL` - Frontend URL for CORS
- `CORS_ORIGINS` - Allowed CORS origins
- `DATA_DIR` - Path to GeoJSON data directory

### Frontend Environment Variables

See `apps/frontend/.env.local.example`:
- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS deployment guide including:
- Server preparation
- PM2 setup
- Docker setup
- Nginx configuration
- SSL with Certbot
- Monitoring & logging

---

## 📝 Scripts

```bash
pnpm dev           # Start both backend and frontend
pnpm dev:backend   # Start backend only
pnpm dev:frontend  # Start frontend only
pnpm build         # Build all
pnpm build:backend # Prepare backend
pnpm build:frontend # Build frontend
pnpm start         # Start with PM2
pnpm lint          # Lint all
pnpm clean         # Clean node_modules
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 👥 Team

RDTR Spasial Development Team

---

## 🙏 Acknowledgments

- Permen ATR BPN Nomor 11 Tahun 2023 for zone color standards
- GISTARU ATR/BPN for RDTR data source
- OpenStreetMap for map tiles
