# Getting Started — HavenBridge

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 10+ | https://dotnet.microsoft.com/download |
| Node.js | 20+ | https://nodejs.org/ |
| MySQL | 8+ | https://dev.mysql.com/downloads/mysql/ |

### MySQL Setup

Install MySQL Server 8+ and make sure the `mysql` command-line client is in your system PATH.

**Windows (MySQL Installer):**
1. Download the [MySQL Installer](https://dev.mysql.com/downloads/installer/)
2. Choose "Developer Default" or "Server only"
3. Set a root password during setup (the app defaults to `admin`)
4. Make sure "Add MySQL to PATH" is checked, or add it manually:
   - Typical path: `C:\Program Files\MySQL\MySQL Server 8.x\bin`

**macOS (Homebrew):**

```bash
brew install mysql
brew services start mysql
mysql_secure_installation   # set a root password
```

**Verify it's working:**

```bash
mysql --version
mysql -u root -p -e "SELECT 1"
```

If your root password differs from `admin`, update the connection string in `HavenBridge.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=havenbridge;User=root;Password=YOUR_PASSWORD_HERE;"
}
```

---

## First-Time Setup (do this once)

1. Clone the repo and open a terminal in the `HavenBridge` folder
2. Run:

**Windows (PowerShell):**

```powershell
.\setup.ps1
```

**macOS / Linux:**

```bash
chmod +x *.sh        # one-time: make scripts executable
./reset-db.sh        # create the database
cd frontend && npm install && cd ..
```

This checks all prerequisites, creates the `havenbridge` MySQL database, installs .NET and frontend dependencies.

---

## Day-to-Day: Start the App

**Windows (PowerShell):**

```powershell
.\start.ps1
```

**macOS / Linux:**

```bash
./start.sh
```

This starts both the backend and frontend. Open **http://localhost:5173** in your browser.

The backend auto-seeds the database from CSV files on first run if the tables are empty.

To stop, press **Ctrl+C**.

---

## When Someone Pushes Changes

### If the change is code only (no database changes)

**Windows:**

```powershell
git pull
.\start.ps1
```

**macOS / Linux:**

```bash
git pull
./start.sh
```

### If the change involves database/model/CSV updates

**Windows:**

```powershell
git pull
.\reset-db.ps1
.\start.ps1
```

**macOS / Linux:**

```bash
git pull
./reset-db.sh
./start.sh
```

**How do I know if the DB changed?** Check if any files in `HavenBridge.Api/SeedData/`, `HavenBridge.Api/Models/`, or `HavenBridge.Api/Data/` were modified in the pull.

---

## Quick Reference

| I want to... | Windows | macOS / Linux |
|--------------|---------|---------------|
| Start the app | `.\start.ps1` | `./start.sh` |
| Stop the app | `Ctrl+C` | `Ctrl+C` |
| Reset the database | `.\reset-db.ps1` | `./reset-db.sh` |
| Install deps (fresh clone) | `.\setup.ps1` | `chmod +x *.sh && ./reset-db.sh` |
| Start backend only | `cd HavenBridge.Api` then `dotnet run` | Same |
| Start frontend only | `cd frontend` then `npm run dev` | Same |

---

## App URLs

| URL | Who it's for | Login needed? |
|-----|-------------|---------------|
| http://localhost:5173 | Everyone (welcome page) | No |
| http://localhost:5173/impact | Everyone (public impact data) | No |
| http://localhost:5173/login | All users | — |
| http://localhost:5173/register | New donors | — |
| http://localhost:5173/dashboard | Staff / Admin | Yes |
| http://localhost:5173/cases | Staff / Admin — case management | Yes |
| http://localhost:5173/donors | Staff / Admin — donor management | Yes |
| http://localhost:5173/reports | Staff / Admin — reports & analytics | Yes |
| http://localhost:5173/admin | Admin — user management & tools | Yes |
| http://localhost:5173/donor-portal | Donors — donation history & impact | Yes |

## Test Accounts

The database is seeded with the following accounts for development and testing:

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `admin` | `admin123` | Admin | Full access including user management |
| `sw01` through `sw20` | `password123` | Staff | 20 social worker accounts |
| *(register your own)* | *(your choice)* | Donor | New registrations default to Donor |

### Role Permissions

- **Donor** — Donor Portal only (donation history, impact)
- **Staff** — Everything Donor can do, plus Dashboard, Cases, Donors, Reports
- **Admin** — Everything Staff can do, plus Admin Portal with user role management

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `mysql` not found | Add MySQL's `bin` folder to your system PATH |
| Access denied for root | Check your password in `appsettings.json` matches your MySQL root password |
| Backend crashes on start | Make sure MySQL is running: `net start MySQL80` (Windows) / `brew services start mysql` (macOS) |
| Tables are empty | Run `.\reset-db.ps1` / `./reset-db.sh` then start the app to re-seed |
| Port 3306 in use | Another MySQL instance may be running; check with `netstat -an | findstr 3306` (Windows) or `lsof -i :3306` (macOS) |
| Permission denied on .sh scripts | Run `chmod +x *.sh` in the HavenBridge folder |
