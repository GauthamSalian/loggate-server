from collections.abc import ByteString
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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