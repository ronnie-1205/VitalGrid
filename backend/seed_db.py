import json
from database import SessionLocal, engine, Base
from database import Facility, Medicine, Inventory

def seed_database():
    # 1. Reset the database (Drop all existing tables and recreate them clean)
    print("Wiping old database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 2. Open a session (our shopping cart)
    db = SessionLocal()

    # 3. Read the JSON file we generated earlier
    print("Loading seed_data.json...")
    try:
        with open("data/seed_data.json", "r") as file:
            data = json.load(file)
    except FileNotFoundError:
        print("Error: Could not find data/seed_data.json! Did you run generate_data.py?")
        return

    # 4. Insert Facilities
    print("Inserting facilities...")
    for fac_data in data["facilities"]:
        db_facility = Facility(
            id=fac_data["id"],
            name=fac_data["name"],
            type=fac_data["type"],
            lat=fac_data["lat"],
            lon=fac_data["lon"]
        )
        db.add(db_facility) # Add to cart

    # 5. Insert Medicines
    print("Inserting medicines...")
    for med_data in data["medicines"]:
        db_medicine = Medicine(
            id=med_data["id"],
            name=med_data["name"],
            unit=med_data["unit"]
        )
        db.add(db_medicine) # Add to cart

    # 6. Insert Inventory
    print("Inserting inventory records (This might take a second)...")
    for inv_data in data["inventory"]:
        db_inventory = Inventory(
            facility_id=inv_data["facility_id"],
            medicine_id=inv_data["medicine_id"],
            current_stock=inv_data["current_stock"],
            consumption_history=inv_data["consumption_history"]
        )
        db.add(db_inventory) # Add to cart

    # 7. COMMIT! (Checkout and save to the actual file)
    db.commit()
    db.close()
    
    print("✅ Database successfully seeded! vitalgrid.db is ready.")

if __name__ == "__main__":
    seed_database()