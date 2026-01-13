# Info Hunter 🔥

A high-intensity data aggregation platform that dominates the web. Scrapes, processes, and consolidates data from scholarships, internships, price listings, and learning resources at scale.

Built for **LAVAPUNK Hackathon** - Data Aggregation Track.

## Features

- 🕷️ **Selenium-powered scraping** with pagination, retry logic, and configurable extraction rules
- 🔍 **ElasticSearch backend** for blazing-fast full-text search
- ⚡ **REST API** for managing sources, triggering jobs, scheduling scrapes
- 📊 **React Dashboard** for real-time monitoring and control
- 🕐 **Cron scheduling** for automated data collection
- 🎯 **Multi-source support**: scholarships, internships, prices, learning resources

## Quick Start

### 1. Install Backend

```bash
pip install -e ".[dev]"
```

### 2. Start the API Server

```bash
cd src
python -m uvicorn info_hunter.api:app --host 127.0.0.1 --port 8000
```

API available at: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### 3. Start the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at: http://localhost:5173

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard                          │
│         (Sources | Jobs | Schedules | Search)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                    FastAPI Server                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Sources  │  │   Jobs   │  │ Schedules│  │  Search  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────┐
│                    Core Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Manager  │  │ Scraper  │  │Scheduler │  │ Search   │    │
│  │          │  │(Selenium)│  │  (Cron)  │  │ Engine   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────┐
│                    Data Layer                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │    Config Store      │  │    ElasticSearch     │        │
│  │    (JSON Files)      │  │    (Documents)       │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sources` | Create data source |
| GET | `/api/sources` | List data sources |
| GET | `/api/sources/{id}` | Get data source |
| DELETE | `/api/sources/{id}` | Delete data source |
| POST | `/api/jobs/trigger/{source_id}` | Trigger scrape job |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/{id}` | Get job status |
| POST | `/api/search` | Search documents |
| POST | `/api/schedules` | Create schedule |
| GET | `/api/schedules` | List schedules |
| DELETE | `/api/schedules/{id}` | Delete schedule |

## Running Tests

```bash
pytest tests/ -v
```

121 tests covering validation, storage, scheduling, and API endpoints.

## Project Structure

```
├── src/info_hunter/
│   ├── api/          # FastAPI REST endpoints
│   ├── models/       # Pydantic data models
│   ├── scraper/      # Selenium web scraper
│   ├── search/       # ElasticSearch integration
│   ├── scheduler/    # Cron job scheduling
│   ├── storage/      # Config persistence
│   └── validation/   # Input validation
├── frontend/
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   └── pages/    # Dashboard, Sources, Jobs, Search
│   └── package.json
└── tests/
    ├── unit/         # Unit tests
    ├── property/     # Property-based tests (Hypothesis)
    └── integration/  # Integration tests
```

## Tech Stack

**Backend**: Python, FastAPI, Selenium, ElasticSearch, Pydantic, Hypothesis
**Frontend**: React, TypeScript, Vite, TanStack Query, Lucide Icons

---

Built with 🔥 for LAVAPUNK
