import json
import os
import sys

# Ensure we can import from the parent backend/ directory
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the real database module from backend/
from database import SessionLocal, engine, Base
from database import Facility, Medicine, Inventory

def seed_database():
    print("Wiping old database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    print("Loading seed_data.json...")
    json_path = os.path.join(script_dir, "seed_data.json")
    try:
        with open(json_path, "r") as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"Error: Could not find {json_path}! Did you run generate_data.py?")
        return

    print("Inserting facilities...")
    for fac_data in data["facilities"]:
        db_facility = Facility(
            id=fac_data["id"],
            name=fac_data["name"],
            type=fac_data["type"],
            lat=fac_data["lat"],
            lon=fac_data["lon"]
        )
        db.add(db_facility)

    print("Inserting medicines...")
    for med_data in data["medicines"]:
        db_medicine = Medicine(
            id=med_data["id"],
            name=med_data["name"],
            unit=med_data["unit"]
        )
        db.add(db_medicine)

    print("Inserting inventory records (This might take a second)...")
    for inv_data in data["inventory"]:
        db_inventory = Inventory(
            facility_id=inv_data["facility_id"],
            medicine_id=inv_data["medicine_id"],
            current_stock=inv_data["current_stock"],
            consumption_history=inv_data["consumption_history"]
        )
        db.add(db_inventory)

    db.commit()
    db.close()
    
    print("✅ Database successfully seeded! vitalgrid.db is ready.")

if __name__ == "__main__":
    seed_database()
