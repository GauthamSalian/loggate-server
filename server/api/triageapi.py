from fastapi import APIRouter, Depends, status, HTTPException, Request
from server.api.authapi import get_current_user
from pydantic import BaseModel
from typing import List
from server.services.triageservice import process_payload, test_slack
import httpx

class Record(BaseModel):
    pattern: str
    sample: List[str]
    line_count: int
    total_bytes_count: int

class PushTriagePayload(BaseModel):
    service: str
    host: str
    environment: str
    window_start: int
    window_end: int
    records: List[Record]

class TestSlackRequest(BaseModel):
    slack_webhook_url: str

def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client

triage_router = APIRouter(tags=["Triage"])

@triage_router.post("/push", status_code=status.HTTP_200_OK)
@triage_router.post("/simulate", status_code=status.HTTP_200_OK)
def process_triage_payload(
    payload: PushTriagePayload,
    current_user: dict = Depends(get_current_user)
):
    res = process_payload(payload)
    if res.get("status") == "success":
        return res
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=res.get("message", "Failed to triage payload")
    )

@triage_router.post("/test-slack", status_code=status.HTTP_200_OK)
async def send_test_slack(
    payload: TestSlackRequest,
    current_user: dict = Depends(get_current_user),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    success = await test_slack(
        slack_webhook_url=payload.slack_webhook_url,
        http_client=http_client
    )
    if success:
        return {
            "status": "success",
            "message": "Slack integration is working correctly"
        }
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Slack integration test failed. Check webhook URL or permissions."
    )