import re

with open("backend/main.py", "r") as f:
    content = f.read()

# 1. Add BaseModel for POST endpoints
if "from pydantic import BaseModel" not in content:
    content = content.replace("from fastapi import FastAPI, Depends, HTTPException", "from fastapi import FastAPI, Depends, HTTPException\nfrom pydantic import BaseModel\nfrom datetime import datetime")

# 2. Add donor_id to best_interventions
old_append = """            donors.append({
                "donor_name": donor_fac.name,"""
new_append = """            donors.append({
                "donor_id": donor_fac.id,
                "donor_name": donor_fac.name,"""
content = content.replace(old_append, new_append)

# 3. Add new endpoints
new_endpoints = """
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
                "status": status,
                "daysOfOxygenLeft": max(0, round(lowest_dus)) # Frontend expects this key
            })
            
        timeline.append({"day": day, "hospitals": day_hospitals})
        
    return {"days": timeline}
"""

if "class InterventionRequest" not in content:
    content += new_endpoints

with open("backend/main.py", "w") as f:
    f.write(content)

