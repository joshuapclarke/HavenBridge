# HavenBridge

A nonprofit platform connecting case workers and donors to improve outcomes for vulnerable children in the Philippines. Built with **ASP.NET Core 10**, **React + TypeScript**, **Tailwind CSS**, and **SQLite**.

---

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### 1. Start the Backend

```bash
cd HavenBridge.Api
dotnet run
```

The API starts at **http://localhost:5149**. On first run, the SQLite database is auto-created and populated from 17 CSV seed files (~7,000 rows of real data).

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**. API calls are proxied to the backend automatically.

### 3. Access the App

| URL | What it is |
|-----|------------|
| `/welcome` | Public landing page |
| `/impact` | Public impact dashboard (no login) |
| `/login` | Staff login (enter any email + password) |
| `/` | Staff dashboard (requires login) |

---

## Project Structure

```
HavenBridge/
│
├── docs/                            # Documentation
│   └── SPEC.md                      # Original design spec & full ERD
│
├── HavenBridge.Api/                 # ASP.NET Core Web API
│   ├── Controllers/                 # REST API endpoints
│   │   ├── AdminController.cs       #   Admin search & activity feed
│   │   ├── DonationsController.cs   #   Donation CRUD
│   │   ├── HomeVisitationsController.cs
│   │   ├── ImpactController.cs      #   Public impact & donor impact
│   │   ├── ProcessRecordingsController.cs
│   │   ├── ResidentsController.cs   #   Resident CRUD & alerts
│   │   ├── SafehousesController.cs
│   │   └── SupportersController.cs  #   Supporter CRUD & summary
│   ├── Data/
│   │   ├── HavenBridgeContext.cs    # EF Core DbContext (17 tables)
│   │   └── CsvDataImporter.cs      # Startup CSV → SQLite importer
│   ├── Models/                      # Entity models (one per table)
│   ├── SeedData/                    # 17 CSV files with real data
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── Program.cs                   # App startup & configuration
│   ├── appsettings.json
│   └── HavenBridge.Api.csproj
│
├── frontend/                        # React + Vite + TypeScript
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── CookieConsent.tsx    #   GDPR cookie banner
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx            #   Reusable modal dialog
│   │   │   ├── StatusBadge.tsx      #   Color-coded status pills
│   │   │   └── SummaryCard.tsx      #   Metric card with icon
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx        # Staff shell: nav bar + sign out
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Public: hero, mission, live stats
│   │   │   ├── PublicImpactPage.tsx  # Public: anonymized impact data
│   │   │   ├── LoginPage.tsx        # Staff login
│   │   │   ├── PrivacyPolicyPage.tsx # Privacy policy
│   │   │   ├── DashboardPage.tsx    # Staff: overview metrics
│   │   │   ├── CaseDashboardPage.tsx # Staff: 3-panel case management
│   │   │   ├── DonorManagementPage.tsx # Staff: donor table + detail
│   │   │   ├── ReportsPage.tsx      # Staff: analytics & comparisons
│   │   │   ├── AdminPortalPage.tsx  # Staff: quick actions & search
│   │   │   └── DonorPortalPage.tsx  # External: donor self-service
│   │   ├── services/
│   │   │   └── api.ts               # Centralized API client
│   │   ├── types/
│   │   │   └── models.ts            # TypeScript interfaces (all entities)
│   │   ├── App.tsx                   # Routes & auth guard
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                # Tailwind + custom theme
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Pages & Routes

### Public (no login required)

| Route | Page | Description |
|-------|------|-------------|
| `/welcome` | Landing Page | Hero, mission statement, live stats, CTAs |
| `/impact` | Impact Dashboard | Anonymized aggregate data & published snapshots |
| `/login` | Staff Login | Email + password entry, stores auth in localStorage |
| `/privacy` | Privacy Policy | 7-section policy page |

### Staff (login required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview metrics, recent activity, quick actions |
| `/cases` | Case Dashboard | Resident list with search/filter, detail panel with tabs (Sessions, Health, Education, Visits, Notes), alerts sidebar |
| `/donors` | Donor Management | Summary cards, donor table, detail panel with giving history & impact |
| `/reports` | Reports & Analytics | Safehouse comparison table, donor overview, alert summary |
| `/admin` | Admin Portal | Quick action buttons, search, activity feed |
| `/donor-portal` | Donor Portal | External donor view with impact, history, profile |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/residents` | List all residents |
| GET | `/api/residents/{id}` | Resident detail with all related records |
| POST | `/api/residents` | Create a resident |
| GET | `/api/residents/alerts` | Active alerts (high risk, flagged, unresolved) |
| GET | `/api/supporters` | List all supporters/donors |
| GET | `/api/supporters/{id}` | Supporter detail with donation history |
| POST | `/api/supporters` | Create a supporter |
| PUT | `/api/supporters/{id}` | Update a supporter |
| GET | `/api/supporters/summary` | Donor summary statistics |
| GET | `/api/donations` | List donations (optional `?supporterId=`) |
| POST | `/api/donations` | Record a donation |
| GET | `/api/safehouses` | List all safehouses |
| GET | `/api/safehouses/{id}` | Safehouse detail |
| GET | `/api/processrecordings` | List sessions (optional `?residentId=`) |
| POST | `/api/processrecordings` | Log a session |
| GET | `/api/homevisitations` | List visits (optional `?residentId=`) |
| POST | `/api/homevisitations` | Log a visit |
| GET | `/api/impact/overview` | Platform-wide impact metrics |
| GET | `/api/impact/donor/{id}` | Per-donor impact breakdown |
| GET | `/api/impact/snapshots` | Published impact stories |
| GET | `/api/admin/recent-activity` | Recent activity feed |
| GET | `/api/admin/search?q=` | Search residents and supporters |

---

## Data Model

17 tables modeled after the full ERD (see `docs/SPEC.md`):

| Domain | Tables |
|--------|--------|
| **Facilities** | Safehouses, Safehouse Monthly Metrics |
| **Case Management** | Residents, Process Recordings, Intervention Plans, Home Visitations, Health & Wellbeing Records, Education Records, Incident Reports |
| **Fundraising** | Supporters, Donations, Donation Allocations, In-Kind Donation Items |
| **Partnerships** | Partners, Partner Assignments |
| **Outreach** | Social Media Posts, Public Impact Snapshots |

Seed data: **7,000+ rows** imported from CSV at startup.

---

## Key Features

- **Search & filter** on resident caseload (by name, status, risk level)
- **Modal forms** for adding sessions, home visits, and donations
- **Auth guard** — staff pages require login; public pages open to all
- **Cookie consent** banner with privacy policy link
- **Sign out** from the navigation bar
- **CSV data importer** populates the database on first run
