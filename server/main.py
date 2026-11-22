from collections.abc import ByteString
from fastapi import FastAPI
from pydantic import BaseModel
from server.api.authapi import auth_router
from server.api.tokenapi import token_router
from server.api.projectapi import project_router
from server.api.payloadapi import payload_router
from server.api.triageapi import triage_router
from contextlib import asynccontextmanager
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

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(token_router, prefix="/api/v1/tokens")
app.include_router(project_router, prefix="/api/v1/projects")
app.include_router(payload_router, prefix="/api/v1/payloads")
app.include_router(triage_router, prefix="/api/v1/triage")

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
