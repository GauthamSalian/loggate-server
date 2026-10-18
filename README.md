# LogGate Server

LogGate Server repository contains the web dashboard client and the backend server services for LogGate.

## Repository Structure

```text
loggate-server/
├── client/    # Frontend application (React + Vite + TypeScript)
└── server/    # Backend services (Python)
```

---

## Getting Started

### 1. Client Setup (Frontend)

The frontend is built with React 19, TypeScript, and Vite.

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

#### Installation & Development
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be running locally at `http://localhost:5173/`.

#### Build for Production
```bash
npm run build
```

---

### 2. Server Setup (Backend)

The backend is written in Python.

#### Prerequisites
- [Python 3.10+](https://www.python.org/)

#### Environment Setup
```bash
# Navigate to the server directory
cd server

# Create a virtual environment (if not already created)
python3 -m venv .venv

# Activate the virtual environment
# On macOS / Linux:
source .venv/bin/activate

# On Windows (Command Prompt):
# .venv\Scripts\activate.bat
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

> **Note:** There is currently no `requirements.txt` file yet. Once backend dependencies (such as FastAPI or Flask) are defined, you can install them with:
> ```bash
> pip install -r requirements.txt
> ```

---

## Next Steps
- Define backend framework and create `requirements.txt` / server entry point (`main.py`).
- Configure API proxy / base URL between `client` and `server`.
