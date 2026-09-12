from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, Facility, Medicine, Inventory
import math

# Initialize the API
app = FastAPI(title="VitalGrid Command Center API")

# --- DATABASE CONNECTION HELPER ---
# This is a "Dependency". Every time a web request comes in, this function 
# opens a database session (the shopping cart) and closes it when the request is done.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- THE MATH SECTION (STATISTICAL MODELING) ---

def calculate_wma(history_list):
    """
    Weighted Moving Average (WMA).
    We look at the last 7 days of consumption. We give yesterday a weight of 30%, 
    the day before 20%, and older days 10% or 5%. This means if a sudden spike 
    started yesterday, our system reacts to it much faster than a standard average!
    """
    last_7_days = history_list[-7:] # Grab only the last 7 numbers
    weights = [0.05, 0.05, 0.10, 0.10, 0.20, 0.20, 0.30] # Must equal 1.00
    
    forecast = 0
    for i in range(7):
        forecast += last_7_days[i] * weights[i]
        
    return max(1, forecast) # Never predict 0 consumption, always assume at least 1

def haversine(lat1, lon1, lat2, lon2):
    """
    The Haversine Formula. 
    In Computer Science, this is how you calculate the straight-line distance 
    between two GPS coordinates on a sphere (the Earth).
    Returns distance in kilometers.
    """
    R = 6371 # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# --- API ENDPOINTS (WHAT THE FRONTEND CALLS) ---

@app.get("/api/network")
def get_network_status(db: Session = Depends(get_db)):
    """
    This endpoint scans the entire region. It looks at every hospital, 
    calculates their Days Until Stockout (DUS), and figures out their 'Risk Level'.
    """
    facilities = db.query(Facility).all()
    network_data = []

    for fac in facilities:
        # Get all medicine inventory for this specific hospital
        inventories = db.query(Inventory).filter(Inventory.facility_id == fac.id).all()
        
        lowest_dus = 999
        critical_medicine = None
        full_inventory = {}
        
        for inv in inventories:
            # 1. Forecast tomorrow's demand
            forecasted_daily_demand = calculate_wma(inv.consumption_history)
            
            # 2. Predict Days Until Stockout (DUS)
            dus = inv.current_stock / forecasted_daily_demand
            
            med = db.query(Medicine).filter(Medicine.id == inv.medicine_id).first()
            full_inventory[med.name] = {
                "days": round(dus, 1),
                "stock": inv.current_stock,
                "unit": med.unit
            }
            
            # We want to find the medicine in the WORST condition at this hospital
            if dus < lowest_dus:
                lowest_dus = dus
                critical_medicine = med.name

        # 3. Determine the Color/Risk for the React Map
        status = "safe" # Green
        if lowest_dus <= 7:
            status = "warning" # Yellow
        if lowest_dus <= 3:
            status = "critical" # Red

        # Add this node to the map data
        network_data.append({
            "id": fac.id,
            "name": fac.name,
            "type": fac.type,
            "lat": fac.lat,
            "lon": fac.lon,
            "status": status,
            "lowest_days_remaining": round(lowest_dus, 1),
            "critical_medicine": critical_medicine,
            "full_inventory": full_inventory
        })

    return {"nodes": network_data}


@app.get("/api/recommendations/{facility_id}")
def get_redistribution_plan(facility_id: int, db: Session = Depends(get_db)):
    """
    If a hospital is dying (Red), React calls this endpoint to find a Savior.
    It calculates distance to all healthy hospitals and recommends a transfer.
    """
    # 1. Find the dying hospital
    dying_fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not dying_fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    # Find what medicine they are running out of
    dying_inv = db.query(Inventory).filter(Inventory.facility_id == facility_id).all()
    worst_inv = None
    lowest_dus = 999
    
    for inv in dying_inv:
        demand = calculate_wma(inv.consumption_history)
        dus = inv.current_stock / demand
        if dus < lowest_dus:
            lowest_dus = dus
            worst_inv = inv
            
    med_needed = db.query(Medicine).filter(Medicine.id == worst_inv.medicine_id).first()

    # 2. Search the Mesh Network for a Donor
    all_other_inventories = db.query(Inventory).filter(
        Inventory.medicine_id == med_needed.id,
        Inventory.facility_id != facility_id
    ).all()

    donors = []
    for inv in all_other_inventories:
        demand = calculate_wma(inv.consumption_history)
        dus = inv.current_stock / demand
        
        # Rule: We ONLY take medicine from a hospital if they have > 30 days of safety stock
        if dus > 30:
            donor_fac = db.query(Facility).filter(Facility.id == inv.facility_id).first()
            # Calculate distance using our Haversine math
            dist = haversine(dying_fac.lat, dying_fac.lon, donor_fac.lat, donor_fac.lon)
            
            donors.append({
                "donor_id": donor_fac.id,
                "donor_name": donor_fac.name,
                "distance_km": round(dist, 1),
                "surplus_days": round(dus, 1),
                "recommended_transfer_units": math.floor(demand * 14) # Give the dying hospital a 14-day supply
            })

    # Sort the donors by who is closest (distance)
    donors.sort(key=lambda x: x["distance_km"])

    return {
        "crisis_facility": dying_fac.name,
        "medicine_needed": med_needed.name,
        "current_days_remaining": round(lowest_dus, 1),
        "best_interventions": donors[:3] # Return the top 3 closest options
    }
class InterventionRequest(BaseModel):
    fromHospitalId: int
    item: str
    units: int

@app.post("/api/interventions/{facility_id}")
def apply_intervention(facility_id: int, req: InterventionRequest, db: Session = Depends(get_db)):
    # Find the donor inventory
    # Note: 'item' is the medicine name from the frontend (e.g. 'Amoxicillin (Antibiotic)')
    # We need to find the medicine_id
    med = db.query(Medicine).filter(Medicine.name == req.item).first()
    if not med:
        # If it's a hardcoded mock like 'oxygen', try to fallback or error
        # Since we mapped critical_medicine in the frontend, it should be a real medicine name.
        raise HTTPException(status_code=400, detail="Medicine not found")
        
    donor_inv = db.query(Inventory).filter(
        Inventory.facility_id == req.fromHospitalId, 
        Inventory.medicine_id == med.id
    ).first()
    
    target_inv = db.query(Inventory).filter(
        Inventory.facility_id == facility_id, 
        Inventory.medicine_id == med.id
    ).first()
    
    if not donor_inv or not target_inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
        
    if donor_inv.current_stock < req.units:
        raise HTTPException(status_code=400, detail="Not enough stock in donor facility")
        
    donor_inv.current_stock -= req.units
    target_inv.current_stock += req.units
    db.commit()
    
    return {"success": True, "appliedAt": datetime.utcnow().isoformat()}

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    facilities = db.query(Facility).all()
    alerts = []
    
    for fac in facilities:
        inventories = db.query(Inventory).filter(Inventory.facility_id == fac.id).all()
        for inv in inventories:
            demand = calculate_wma(inv.consumption_history)
            dus = inv.current_stock / demand
            if dus <= 7:
                med = db.query(Medicine).filter(Medicine.id == inv.medicine_id).first()
                severity = "critical" if dus <= 3 else "warning"
                time_str = datetime.utcnow().strftime("%H:%M")
                msg = f"{med.name} reserve exhausted in an estimated {round(dus, 1)} days."
                alerts.append({
                    "id": f"a_{fac.id}_{inv.id}",
                    "hospitalId": fac.id,
                    "severity": severity,
                    "message": msg,
                    "time": time_str
                })
                
    return alerts

class SimulateRequest(BaseModel):
    days: int

@app.post("/api/simulate")
def run_simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    # Linear projection for now
    facilities = db.query(Facility).all()
    timeline = []
    
    for day in range(req.days + 1):
        day_hospitals = []
        for fac in facilities:
            inventories = db.query(Inventory).filter(Inventory.facility_id == fac.id).all()
            lowest_dus = 999
            
            for inv in inventories:
                demand = calculate_wma(inv.consumption_history)
                # Projected stock = current - (demand * day)
                projected_stock = max(0, inv.current_stock - (demand * day))
                dus = projected_stock / demand
                if dus < lowest_dus:
                    lowest_dus = dus
                    
            status = "safe"
            if lowest_dus <= 7:
                status = "warning"
            if lowest_dus <= 3:
                status = "critical"
                
            day_hospitals.append({
                "id": fac.id,
                "name": fac.name,
                "lat": fac.lat,
                "lng": fac.lon,
                "status": status,
                "daysOfOxygenLeft": max(0, round(lowest_dus)) # Frontend expects this key
            })
            
        timeline.append({"day": day, "hospitals": day_hospitals})
        
    return {"days": timeline}
