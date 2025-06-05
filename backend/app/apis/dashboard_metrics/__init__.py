\
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import json

router = APIRouter()

class DashboardMetrics(BaseModel):
    total_requests: int
    block_rate: float
    human_visits: int
    bot_visits: int
    ml_suggestion: str

# Mock data to be sent
mock_metrics_data = {
    "total_requests": 1000,
    "block_rate": 0.15,
    "human_visits": 850,
    "bot_visits": 150,
    "ml_suggestion": "Increase threshold to 0.6 for campaign X" # Made suggestion slightly more specific
}

@router.websocket("/ws/dashboard-metrics")
async def websocket_dashboard_metrics(websocket: WebSocket):
    await websocket.accept()
    print("Dashboard WebSocket connection established.")
    try:
        while True:
            # Simulate dynamic changes for a bit more realism in mock data
            mock_metrics_data["total_requests"] += asyncio.run(asyncio.sleep(0.01, result=1)) # Tiny async sleep to yield
            mock_metrics_data["human_visits"] = int(mock_metrics_data["total_requests"] * (1 - mock_metrics_data["block_rate"]))
            mock_metrics_data["bot_visits"] = mock_metrics_data["total_requests"] - mock_metrics_data["human_visits"]
            
            # Randomly change ML suggestion for mock purposes
            suggestions = [
                "Increase threshold to 0.6 for campaign X",
                "Monitor traffic from ASN Y closely",
                "All systems nominal for campaign Z",
                "Decrease sensitivity for filter A on campaign B"
            ]
            if mock_metrics_data["total_requests"] % 10 == 0: # Change suggestion every 10 "requests"
                 mock_metrics_data["ml_suggestion"] = suggestions[(mock_metrics_data["total_requests"] // 10) % len(suggestions)]


            await websocket.send_json(mock_metrics_data)
            print(f"Sent metrics: {mock_metrics_data}")
            await asyncio.sleep(5)  # Send data every 5 seconds
    except WebSocketDisconnect:
        print("Dashboard WebSocket connection closed.")
    except Exception as e:
        print(f"Error in dashboard WebSocket: {e}")
        await websocket.close(code=1011) # Internal server error
