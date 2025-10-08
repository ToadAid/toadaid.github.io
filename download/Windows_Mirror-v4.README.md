# Mirror V4 (Windows)

A self-contained Windows app that runs a local FastAPI server with a simple web UI (the “Mirror”). No Python required.

---

## Quick Start

### A) Installer (Recommended)
1. Run `MirrorV4-Setup-<version>.exe`.
2. **Install to:** `C:\Mirror-V4` (default).
3. Finish → the app starts automatically.
4. Open: <http://127.0.0.1:8080/web/index.html>

Shortcuts are added to Start Menu and Desktop.

### B) Portable (ZIP)
1. Unzip `MirrorV4.zip` anywhere (e.g., `C:\Apps\Mirror-V4`).
2. Double-click `MirrorV4.exe`.
3. Open: <http://127.0.0.1:8080/web/index.html>

---

## Requirements

- Windows 10/11 (x64)
- **LLM backend**  
  - **LM Studio** (default): start its local server on `http://127.0.0.1:1234/v1` with an instruct model  
    (e.g., `meta-llama-3.1-8b-instruct`), or  
  - Any OpenAI-compatible server (set env vars accordingly).

No system Python needed—the app is bundled.

---

## Installed Layout

```
C:\Mirror-V4\
  MirrorV4.exe
  _internal\                # PyInstaller runtime (keep this)
  web\
  prompts\
  lore-scrolls\
  .env                      # configuration
  .data\prom_mp\          # metrics temp dir
```
---

## Configuration (`.env`)

The app reads a `.env` **next to the EXE**. A good default is installed:

```ini
# ---- App ----
API_KEY=supersecret
HOST=127.0.0.1
PORT=8080
LOG_LEVEL=info            # info | debug

# ---- Paths (installed defaults) ----
WEB_DIR=C:\Mirror-V4\web
PROMPTS_DIR=C:\Mirror-V4\prompts
SCROLLS_DIR=C:\Mirror-V4\lore-scrolls

# ---- LLM (LM Studio default) ----
LLM_PROVIDER=lmstudio
LLM_BASE_URL=http://127.0.0.1:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=meta-llama-3.1-8b-instruct
LLM_MAX_TOKENS=1400
LLM_TEMPERATURE=0.7
LLM_TOP_P=0.95
LLM_TIMEOUT_S=120

# ---- Embeddings ----
EMBEDDINGS_PROVIDER=lmstudio
EMBEDDINGS_MODEL=text-embedding-nomic-embed-text-v1.5
```

After edits, **restart** the app.

---

## Start / Stop

### Double-click
- Run `C:\Mirror-V4\MirrorV4.exe`.  
  (Headless; browse to the URL below.)

### PowerShell
```powershell
# Start with correct working dir
Push-Location C:\Mirror-V4
Start-Process .\MirrorV4.exe -WorkingDirectory .
Pop-Location

# Who’s on 8080?
netstat -ano | findstr :8080

# Stop by name or PID (as Admin if needed)
Get-Process MirrorV4 -ErrorAction SilentlyContinue | Stop-Process -Force
taskkill /PID <PID> /F /T
```

---

## Web UI & API

- UI: <http://127.0.0.1:8080/web/index.html>  
- Health: `GET http://127.0.0.1:8080/api/healthz`  
- Ask:
  ```http
  POST /api/ask
  Header: x-api-key: supersecret
  Body: {"user":"anon","question":"hello mirror"}
  ```
- Diag (with key): `GET http://127.0.0.1:8080/api/diag`

---

## Reindex Scrolls

Drop markdown files into `C:\Mirror-V4\lore-scrolls\` then:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/reindex?pattern=**/*"
```

---

## Troubleshooting

**Blank page**  
- Ensure `C:\Mirror-V4\web\index.html` exists and `.env` paths match. Hard refresh (Ctrl+F5).

**LLM fallback only**  
- Start LM Studio server; confirm model name matches `.env`.  
  `Invoke-RestMethod http://127.0.0.1:1234/v1/models`

**Port in use (8080)**  
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F /T
```
(or change `PORT` in `.env`)

**“Failed to load Python DLL …\_internal\python311.dll”**  
- The install must copy the **entire** app folder (including `_internal`). Reinstall with the provided installer.

**“PROMETHEUS_MULTIPROC_DIR is not set or not a directory”**  
- The app auto-creates `C:\Mirror-V4\.data\prom_mp`. If missing:
  ```powershell
  New-Item -ItemType Directory C:\Mirror-V4\.data\prom_mp -Force
  ```

**“Skipping web mount; directory not found”**  
- Verify `.env` paths point to `C:\Mirror-V4\...` locations.

---

## Uninstall

Use **Settings → Apps → Mirror V4 → Uninstall**.  
The uninstaller removes the EXE, runtime, and shortcuts. (User content in `web/`, `prompts/`, `lore-scrolls/` can be kept depending on build options.)

---

## Build Notes (Maintainers)

**PyInstaller** → `dist\MirrorV4` (onedir).  
**NSIS** copies the entire `dist\MirrorV4` to `C:\Mirror-V4` (keeps `_internal`).  
Default `InstallDir` in the NSIS script: `C:\Mirror-V4`.

---

© ToadAid. Bundles third-party components under their respective licenses.
