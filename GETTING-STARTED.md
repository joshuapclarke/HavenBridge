# Getting Started — HavenBridge

## First-Time Setup (do this once)

1. Install [.NET 10 SDK](https://dotnet.microsoft.com/download) and [Node.js 20+](https://nodejs.org/)
2. Clone the repo and open a terminal in the `HavenBridge` folder
3. Run:

```powershell
.\setup.ps1
```

This installs all backend and frontend dependencies.

---

## Day-to-Day: Start the App

```powershell
.\start.ps1
```

This starts both the backend and frontend. Open **http://localhost:5173** in your browser.

To stop, press **Ctrl+C**.

---

## When Someone Pushes Changes

### If the change is code only (no database changes)

```powershell
git pull
.\start.ps1
```

That's it. The frontend hot-reloads most changes automatically, but restarting is the safest bet.

### If the change involves database/CSV updates

```powershell
git pull
.\reset-db.ps1
.\start.ps1
```

`reset-db.ps1` deletes your local database so it gets rebuilt from the latest CSV seed files on next startup.

**How do I know if the DB changed?** Check if any files in `HavenBridge.Api/SeedData/` or `HavenBridge.Api/Models/` were modified in the pull.

---

## Quick Reference

| I want to... | Run this |
|--------------|----------|
| Start the app | `.\start.ps1` |
| Stop the app | `Ctrl+C` in the terminal |
| Reset the database | `.\reset-db.ps1` |
| Install dependencies after a fresh clone | `.\setup.ps1` |
| Start backend only | `cd HavenBridge.Api` then `dotnet run` |
| Start frontend only | `cd frontend` then `npm run dev` |

---

## App URLs

| URL | Who it's for | Login needed? |
|-----|-------------|---------------|
| http://localhost:5173 | Everyone (welcome page) | No |
| http://localhost:5173/impact | Everyone (public impact data) | No |
| http://localhost:5173/login | Staff | — |
| http://localhost:5173/dashboard | Staff (after login) | Yes |
| http://localhost:5173/cases | Staff — case management | Yes |
| http://localhost:5173/donors | Staff — donor management | Yes |
| http://localhost:5173/reports | Staff — reports & analytics | Yes |

**Login:** Enter any email and password. There is no real authentication — it just sets a local flag.
