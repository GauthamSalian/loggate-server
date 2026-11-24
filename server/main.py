from collections.abc import ByteString
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from pathlib import Path
from server.api.authapi import auth_router
from server.api.tokenapi import token_router
from server.api.projectapi import project_router
from server.api.payloadapi import payload_router
from server.api.triageapi import triage_router
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import httpx

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(5.0, connect=2.0),
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=10)
    )
    yield
    await app.state.http_client.aclose()

app = FastAPI(title="LogGate Server API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(token_router, prefix="/api/v1/tokens")
app.include_router(project_router, prefix="/api/v1/projects")
app.include_router(payload_router, prefix="/api/v1/payloads")
app.include_router(triage_router, prefix="/api/v1/triage")

@app.get("/health", status_code=200, tags=["Health"])
@app.get("/api/v1/health", status_code=200, tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "loggate-server"
    }

STATIC_DIR = Path(__file__).resolve().parent / "static"

@app.get("/install.sh", response_class=PlainTextResponse, tags=["Agent Distribution"])
@app.get("/api/v1/install.sh", response_class=PlainTextResponse, tags=["Agent Distribution"])
def get_install_script():
    script_path = STATIC_DIR / "install.sh"
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="install.sh not found")
    return script_path.read_text(encoding="utf-8")

@app.get("/install.ps1", response_class=PlainTextResponse, tags=["Agent Distribution"])
@app.get("/api/v1/install.ps1", response_class=PlainTextResponse, tags=["Agent Distribution"])
def get_windows_install_script():
    script_path = STATIC_DIR / "install.ps1"
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="install.ps1 not found")
    return script_path.read_text(encoding="utf-8")

@app.get("/api/v1/agent/releases", tags=["Agent Distribution"])
def list_available_releases():
    bin_dir = STATIC_DIR / "bin"
    releases = []
    if bin_dir.exists():
        for file in bin_dir.iterdir():
            if file.is_file() and not file.name.startswith("."):
                platform_id = file.name.replace("loggate-agent-", "")
                if platform_id.endswith(".exe"):
                    platform_id = platform_id[:-4]
                releases.append({
                    "filename": file.name,
                    "platform": platform_id,
                    "size_bytes": file.stat().st_size,
                    "download_url": f"/api/v1/agent/download/{platform_id}"
                })
    return {
        "status": "success",
        "releases": releases
    }

@app.get("/api/v1/agent/download/{platform}", tags=["Agent Distribution"])
def download_agent_binary(platform: str):
    bin_dir = STATIC_DIR / "bin"
    target_file = bin_dir / f"loggate-agent-{platform}"
    if not target_file.exists():
        target_file_exe = bin_dir / f"loggate-agent-{platform}.exe"
        if target_file_exe.exists():
            target_file = target_file_exe
        else:
            available = [f.name for f in bin_dir.glob("loggate-agent-*")] if bin_dir.exists() else []
            raise HTTPException(
                status_code=404,
                detail=f"Agent binary for platform '{platform}' not found. Available: {available}"
            )

    filename = "loggate-agent.exe" if target_file.suffix == ".exe" else "loggate-agent"
    return FileResponse(
        path=target_file,
        filename=filename,
        media_type="application/octet-stream"
    )

class ReducedRecord(BaseModel):
    pattern: str
    sample_lines: list[str]
    raw_line_count: int
    bytes_represented: int

class Payload(BaseModel):
    service: str
    host: str
    environment: str
    window_start: int
    window_end: int
    records: list[ReducedRecord]

@app.post("/api/v1/ingest")
def read_payload(payload: Payload):
    print("Received payload:", payload)
    return {"message": "Payload received successfully"}
