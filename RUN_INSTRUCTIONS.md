# PMPilot — Step-by-Step Run & Setup Guide

This guide provides complete, step-by-step instructions for running, testing, and orchestrating the **PMPilot 17-Agent SDLC Platform** locally on your system.

---

## 📋 System Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (`v20+` or `v22+` recommended)
  - Verify: `node -v`
  - Verify npm: `npm -v`
- **Python**: `3.11` to `3.13`
  - Verify: `python --version`
- **Web Browser**: Chrome, Edge, Brave, or Firefox

---

## ⚙️ Step 1: Environment Configuration (`.env`)

A `.env` file should reside in the root directory of the project. If it doesn't exist, create it from `.env.example`:

```bash
# Copy example file (PowerShell / Command Prompt)
copy .env.example .env
```

Ensure your `.env` contains:

```env
# Database (SQLite is default; tables are created automatically)
DATABASE_URL=sqlite:///./pmpilot.db

# Authentication Security
JWT_SECRET=super-secret-pmpilot-jwt-key-change-in-production-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Active LLM Provider: 'gemini', 'mock', 'ollama', or 'openai_compat'
LLM_PROVIDER=gemini

# Google Gemini Configuration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-3.1-flash-lite

# Local Ollama Configuration (optional, if using local inference)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# OpenAI-Compatible Configuration (optional, Groq / OpenRouter / DeepSeek)
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Server Host & Ports
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> [!TIP]
> To test without an internet connection or external API keys, set `LLM_PROVIDER=mock` in `.env`.

---

## 🐍 Step 2: Backend Setup & Launch (FastAPI)

Open a terminal in the project root: `d:\SEM 7\Arti-Intel\AI`

### 2.1 (Optional) Virtual Environment
If you wish to use a Python virtual environment:
```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
```

### 2.2 Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2.3 Start FastAPI Backend Server
Run the Uvicorn ASGI server:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

When started, you should see:
```text
INFO:     Starting PMPilot Backend...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

- **Backend API Root**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check Endpoint**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 💻 Step 3: Frontend Setup & Launch (React 19 + Vite 8)

Open a **second terminal** in the project root: `d:\SEM 7\Arti-Intel\AI`

### 3.1 Install Node Dependencies
```bash
npm install
```

### 3.2 Start Vite Development Server
```bash
npm run dev
```

You should see:
```text
  VITE v8.2.0  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

- **Web Application URL**: [http://localhost:5173/](http://localhost:5173/)

*(Vite automatically proxies all `/api` requests directly to `http://127.0.0.1:8000`)*.

---

## 🔐 Step 4: Login & Authentication

On opening [http://localhost:5173/](http://localhost:5173/), sign in using any of the seeded default accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Project Lead / PM** | `demo@pmpilot.ai` | `password123` | Full dashboard, create runs, approve checkpoints |
| **Project Manager** | `manager@pmpilot.ai` | `admin123` | Full administrative & project management control |
| **Head of Engineering** | `admin@pmpilot.ai` | `admin123` | Global project governance & employee assignments |
| **UI/UX Specialist** | `uiux@pmpilot.ai` | `password123` | Employee role view |
| **Solutions Architect** | `architect@pmpilot.ai` | `password123` | Employee role view |

---

## 🚀 Step 5: Executing the 17-Agent SDLC Cycle

### 5.1 Create or Select a Project
1. In the **Projects Dashboard**, click **"+ Create New Project"** (or choose an existing project card).
2. Enter:
   - **Project Name** (e.g., *Smart City Waste & Recycling Logistics*)
   - **Domain** (e.g., *Logistics*, *Healthcare*, *Fintech*, *Education*)
   - **Executive Prompt / Description** (details on scope, features, and constraints).
3. Click **"Create Project"**.

### 5.2 Choose Execution Mode
In the top header of the project workspace, you can select between two modes:

- 🟢 **Autonomous Mode (Recommended)**:
  - Executes all **17 agents continuously from start to finish** without stopping.
  - Generates all deliverables, test suites, architecture records, and reports automatically.
- 🟡 **HITL Review Mode (Human-in-the-Loop)**:
  - Runs agents 1–4, then pauses at **ArchitectureAgent (Phase 5)** for architectural review.
  - Once you click **"Approve & Continue"**, it runs through Phase 9 and pauses at **SecurityAgent (Phase 10)** for cybersecurity sign-off.
  - Upon your final sign-off, it finishes all remaining agents through Analytics.

### 5.3 Start the Workflow
1. Click the primary button: **"Start Workflow"**.
2. Watch the dependency graph update in real-time as each agent transitions:
   `PENDING` ➔ `RUNNING` ➔ `COMPLETED`.
3. Click on any agent node to inspect:
   - **Execution Time & Tokens Used**
   - **Assigned Tools & Tool Calls**
   - **Output Summary & Key Findings**
   - **Generated Deliverable Artifacts**

### 5.4 Exporting Reports & Deliverables
Once the cycle completes (or reaches any stage):
- Click **"Word (.docx)"** in the top bar to download the formatted IEEE-style stage report.
- Click **"Markdown"**, **"HTML"**, **"CSV"**, or **"JSON"** from the export bar to retrieve empirical datasets.
- Click **"Preview"** to read the consolidated multi-agent SDLC documentation in the browser modal.

---

## 🧪 Step 6: Running Automated Tests & Validation

You can verify code correctness and system health at any time:

```bash
# 1. Run full backend pytest suite (Auth, Projects, Orchestrator, Providers, Metrics)
python -m pytest backend/tests -v

# 2. Run frontend production typecheck & bundle build
npm run build

# 3. Run frontend linter
npm run lint
```

---

## ❓ Troubleshooting & FAQs

### Q: Port 8000 or 5173 is already in use
**Solution**:
Check what is using the port and terminate it:
```powershell
# In PowerShell:
netstat -ano | findstr ":8000 :5173"
# Kill process by PID (e.g., PID 12345):
taskkill /F /PID 12345
```

### Q: An agent failed with Gemini 503 / 429
**Solution**:
- Transient spikes in demand on Google Gemini are automatically retried with exponential backoff.
- If your Google Gemini API quota is exhausted, you can temporarily switch `.env` to:
  ```env
  LLM_PROVIDER=mock
  ```
  and restart the backend. All 17 agents will run with high-fidelity deterministic responses.

### Q: How do I test the backend API connectivity?
**Solution**:
Visit [http://127.0.0.1:8000/api/settings/llm](http://127.0.0.1:8000/api/settings/llm) in your browser. It will report the latency and health of all configured providers (Gemini, Ollama, Mock).
