# Cribtopia Setup Instructions

## The Issue

Docker Desktop on Windows uses a GUI-based credential helper that doesn't work via SSH. This is a known Windows/Docker Desktop issue.

## Quick Fix: Run These Commands Manually

Open **PowerShell** (not as admin, just regular) and run:

```powershell
cd C:\Users\jerem\cribtopia-test

# Pull the Node.js image
docker pull node:20-alpine

# Build and run
docker compose up -d --build
```

## Alternative: Run the Batch Script

Double-click `setup.bat` in the `cribtopia-test` folder.

## After Success

Open your browser: **http://localhost:5173**

## To Stop

```powershell
docker compose down
```

---

## Why SSH Didn't Work

Docker Desktop's credential helper (`credStore: "desktop"`) requires an interactive GUI session. SSH runs in a non-interactive session, so Docker can't access the credential store.

## Permanent Fix (Optional)

If you want SSH to work with Docker, edit:
`C:\Users\jerem\.docker\config.json`

Remove this line:
```json
"credsStore": "desktop"
```

Then restart Docker Desktop. This removes the GUI credential requirement.

---

Created: 2026-03-24