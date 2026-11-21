from fastapi.security import APIKeyHeader
from fastapi import APIRouter, Security, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from fastapi import status
from server.services.tokenservice import verify_key
from server.services.payloadservice import process_payload
import httpx

class Record(BaseModel):
    pattern: str
    sample: List[str]
    line_count: int
    total_bytes_count: int

class LogPayload(BaseModel):
    service: str
    host: str
    environment: str
    window_start: int
    window_end: int
    records: List[Record]

payload_router = APIRouter(tags=["Log Processor"])

api_key_header = APIKeyHeader(name="X-LogGate-Key", auto_error=False)

def get_verified_project(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API Key is missing")
    key_record = verify_key(api_key=api_key)
    if not key_record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API Key is invalid")
    return key_record

def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client

@payload_router.post("/push-payload", status_code=status.HTTP_200_OK)
async def push_payload(
    payload: LogPayload,
    project: dict = Depends(get_verified_project),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    project_id = project["project_id"]
    key_id = project.get("key_id")
    machine = await process_payload(
        payload=payload,
        project_id=project_id,
        key_id=key_id,
        http_client=http_client
    )
    return {
        "status": "success",
        "message": "Payload processed successfully",
        "machine": machine,
    }