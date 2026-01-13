from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from datetime import datetime, timedelta
import random

app = FastAPI(title="SmartHotel AI Core")

class BookingData(BaseModel):
    roomId: int
    checkInDate: str
    checkOutDate: str
    totalPrice: float

class AnalysisRequest(BaseModel):
    history: List[BookingData]
    currentOccupancy: float

@app.get("/")
async def root():
    return {"status": "AI Core Online", "version": "1.0.0"}

@app.post("/analyze")
async def analyze_data(request: AnalysisRequest):
    # In a real scenario, we would use pandas to process history
    # and scikit-learn for time-series forecasting.
    # For this implementation, we simulate intelligence based on data trends.
    
    predictions = []
    recommendations = []
    
    # 1. Demand Prediction (Simulation)
    high_demand_dates = []
    today = datetime.now()
    
    # Mocking logic: If occupancy is high, predict more high demand
    if request.currentOccupancy > 0.7:
        high_demand_dates.append((today + timedelta(days=7)).strftime("%Y-%m-%d"))
        recommendations.append({
            "type": "Pricing",
            "message": "High demand detected. Increase base rates by 15% for next weekend.",
            "impact": "High"
        })
    else:
        recommendations.append({
            "type": "Discount",
            "message": "Low occupancy predicted. Offer 20% early bird discount for next month.",
            "impact": "Medium"
        })

    # 2. Risk Assessment
    if request.currentOccupancy > 0.95:
        recommendations.append({
            "type": "Alert",
            "message": "Overbooking risk for current block. Freeze new reservations for Standard rooms.",
            "impact": "Critical"
        })

    return {
        "demandForecast": "High" if request.currentOccupancy > 0.6 else "Stable",
        "predictedHighDemandDates": high_demand_dates,
        "recommendations": recommendations,
        "analysisTimestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
