# HavenBridge

A nonprofit platform connecting case workers and donors to improve outcomes for vulnerable residents. Built with **ASP.NET Core**, **React + TypeScript**, **Tailwind CSS**, and **SQLite**.

## Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### 1. Start the Backend

```bash
cd HavenBridge.Api
dotnet run
```

The API starts at **http://localhost:5149**. The SQLite database (`havenbridge.db`) is auto-created with seed data on first run.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**. API calls are proxied to the backend automatically.

## Project Structure

```
HavenBridge/
├── HavenBridge.Api/          # ASP.NET Core Web API
│   ├── Controllers/          # REST endpoints
│   ├── Data/                 # DbContext + seed data
│   ├── Models/               # Entity models (17 tables)
│   └── Program.cs            # App configuration
├── frontend/                 # React + Vite + TypeScript
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── layouts/          # App shell with navigation
│       ├── pages/            # 5 page views
│       ├── services/         # API client
│       └── types/            # TypeScript interfaces
└── README.md
```

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Home Dashboard | `/` | Overview metrics, recent activity, quick actions |
| Resident Cases | `/cases` | Three-panel case management with alerts sidebar |
| Donor Management | `/donors` | Internal staff view with summary cards and detail panel |
| Admin Portal | `/admin` | Quick data entry actions, search, activity feed |
| Donor Portal | `/donor-portal` | External donor view with impact, history, profile |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/residents` | List all residents |
| `GET /api/residents/{id}` | Resident detail with related records |
| `GET /api/residents/alerts` | Active alerts (high risk, flagged, unresolved) |
| `GET /api/supporters` | List all supporters/donors |
| `GET /api/supporters/summary` | Donor summary statistics |
| `GET /api/donations` | List donations |
| `GET /api/impact/overview` | Platform-wide impact metrics |
| `GET /api/impact/donor/{id}` | Per-donor impact breakdown |
| `GET /api/impact/snapshots` | Published impact stories |
| `GET /api/admin/recent-activity` | Recent activity feed |
| `GET /api/admin/search?q=` | Search residents and supporters |

## Data Model

17 tables matching the full ERD: Safehouses, Residents, Process Recordings, Intervention Plans, Home Visitations, Health & Wellbeing Records, Education Records, Incident Reports, Supporters, Donations, Donation Allocations, In-Kind Items, Partners, Partner Assignments, Safehouse Monthly Metrics, Social Media Posts, Public Impact Snapshots.
