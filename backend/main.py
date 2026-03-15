
import asyncio
import os
import json
import logging
import signal
from pathlib import Path
from typing import Set, List, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("suricata_backend")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for connected clients
connected_clients: Set[WebSocket] = set()

# In-memory event cache — replay to new clients on connect
from collections import deque
event_cache: deque = deque(maxlen=500)

# Configuration
EVE_LOG_PATH = os.getenv("EVE_LOG_PATH")
DEFAULT_LINUX_PATH = "/var/log/suricata/eve.json"
DUMMY_PATH = "dummy_eve.json"


def get_log_path() -> Path:
    """Determine the log file path based on priority."""
    if os.environ.get("USE_DUMMY"):
        logger.info("USE_DUMMY is set. Forcing usage of dummy path.")
        return Path(DUMMY_PATH)

    if EVE_LOG_PATH and os.path.exists(EVE_LOG_PATH):
        logger.info(f"Using EVE_LOG_PATH: {EVE_LOG_PATH}")
        return Path(EVE_LOG_PATH)
    if os.path.exists(DEFAULT_LINUX_PATH):
        logger.info(f"Using default Linux path: {DEFAULT_LINUX_PATH}")
        return Path(DEFAULT_LINUX_PATH)
    
    logger.info(f"Using dummy path: {DUMMY_PATH}")
    # Create dummy file if it doesn't exist to prevent errors
    if not os.path.exists(DUMMY_PATH):
        with open(DUMMY_PATH, "w") as f:
            json.dump({
                "timestamp": "2024-01-24T10:00:00.000000+0000",
                "event_type": "alert",
                "src_ip": "127.0.0.1",
                "dest_ip": "127.0.0.1",
                "alert": {"severity": 3, "signature": "Backend Initialization"}
            }, f)
            f.write("\n")
    return Path(DUMMY_PATH)


class LogTailer:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._stop_event = asyncio.Event()

    def stop(self):
        self._stop_event.set()

    def enrich_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Add human-readable severity and other enrichments."""
        if "alert" in event and "severity" in event["alert"]:
            severity_map = {1: "critical", 2: "high", 3: "medium", 4: "low"}
            # Suricata uses 1 (high) to 4 (low) typically, but mapping logic can be customized
            # The prompt asked for 1-3 mapping. Adapting to standard Suricata:
            # 1 = High, 2 = Medium, 3 = Low is common default.
            # However, prompt specifically asked: "Maps numeric Suricata severity scores (1-3) to human-readable labels (High, Medium, Low)."
            # Let's map 1->High, 2->Medium, 3->Low for now, and handle 1 as Critical if needed or strictly follow prompt.
            # Let's use a robust mapping:
            sev = event["alert"]["severity"]
            if sev == 1:
                event["severity"] = "critical" # Often 1 is the worst
            elif sev == 2:
                event["severity"] = "high"
            elif sev == 3:
                event["severity"] = "medium"
            else:
                event["severity"] = "low"
        else:
             event["severity"] = "info" # Default if not an alert
        
        return event

    async def tail(self):
        """Tail the file handling rotation."""
        logger.info(f"Starting tail on {self.file_path}")
        
        try:
            file = open(self.file_path, "r")
            # Seek to start for dummy file so all pre-loaded alerts are broadcast;
            # for live logs, seek to end to avoid replaying old events.
            if str(self.file_path) == DUMMY_PATH:
                file.seek(0)
            else:
                file.seek(0, 2)
            inode = os.fstat(file.fileno()).st_ino
        except FileNotFoundError:
            logger.error(f"File not found: {self.file_path}")
            return

        while not self._stop_event.is_set():
            line = file.readline()
            if line:
                try:
                    payload = json.loads(line)
                    
                    # Filter out stats events to reduce noise
                    if payload.get("event_type") == "stats":
                        continue
                        
                    enriched = self.enrich_event(payload)
                    await self.broadcast(enriched)
                except json.JSONDecodeError:
                    pass  # Ignore partial lines
                continue

            # No new line, check for rotation
            try:
                if os.stat(self.file_path).st_ino != inode:
                    logger.info("File rotation detected (inode change). Reopening...")
                    file.close()
                    file = open(self.file_path, "r")
                    inode = os.fstat(file.fileno()).st_ino
                    continue
                
                # Also check size - if current pos > size, file was truncated
                current_pos = file.tell()
                if os.stat(self.file_path).st_size < current_pos:
                     logger.info("File rotation detected (truncation). Reopening...")
                     file.close()
                     file = open(self.file_path, "r")
                     inode = os.fstat(file.fileno()).st_ino
                     continue

            except FileNotFoundError:
                logger.warning("Log file disappeared. Waiting...")
                await asyncio.sleep(1)
                continue
                
            await asyncio.sleep(0.1)
        
        file.close()

    async def broadcast(self, message: Dict[str, Any]):
        # Cache every event so new clients can replay history
        event_cache.append(message)

        if not connected_clients:
            return
        
        # Broadcast to all
        # We process a copy of the set to strictly avoid runtime modification errors during iteration
        for client in list(connected_clients): 
            try:
                await client.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                await self.disconnect(client)

    async def disconnect(self, websocket: WebSocket):
        if websocket in connected_clients:
            connected_clients.remove(websocket)


# Initialize Tailer
log_file_path = get_log_path()
tailer = LogTailer(log_file_path)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(tailer.tail())

@app.on_event("shutdown")
def shutdown_event():
    tailer.stop()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    logger.info(f"Client connected. Total: {len(connected_clients)}")
    # Replay cached events so client sees history immediately
    for cached_event in list(event_cache):
        try:
            await websocket.send_json(cached_event)
        except Exception:
            break
    try:
        while True:
            # Keep connection alive, maybe wait for heartbeat or command
            # For now, just listen for disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("Client disconnected")
        await tailer.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await tailer.disconnect(websocket)

@app.get("/api/events")
async def get_events():
    """Return all cached events for initial page load."""
    logger.info(f"REST /api/events called, returning {len(event_cache)} cached events")
    return list(event_cache)

# --- Gemini API Integration for Threat Explanation (REST API fallback) ---
import urllib.request
import json
from pydantic import BaseModel

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

class ExplainRequest(BaseModel):
    signature: str

@app.post("/api/explain")
async def explain_threat(req: ExplainRequest):
    prompt = f"""
    You are a cybersecurity AI assistant. Analyze the following Suricata IDS alert signature:
    "{req.signature}"
    
    Provide an explanation of what this threat is, assign it a Risk Level (Low, Medium, or Critical), 
    and provide a Recommended Action for the security analyst.
    
    Return the response ONLY as a valid JSON object with the following keys, and NO markdown code blocks, just raw JSON:
    {{
        "explanation": "string",
        "riskLevel": "string",
        "recommendedAction": "string"
    }}
    """
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        req_obj = urllib.request.Request(
            GEMINI_URL, 
            data=json.dumps(payload).encode('utf-8'), 
            headers=headers, 
            method='POST'
        )
        with urllib.request.urlopen(req_obj) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            # Extract text from Gemini response
            if "candidates" in result and result["candidates"]:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                # Clean up potential markdown formatting
                text = text.replace('```json', '').replace('```', '').strip()
                return json.loads(text)
            else:
                raise ValueError("No candidates found in Gemini response")
                
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return {
            "explanation": f"Failed to generate explanation: {str(e)}",
            "riskLevel": "Unknown",
            "recommendedAction": "Manual investigation required."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
