import json
import random

# 1. EXPANDED MEDICINE CATALOG (15 Medicines)
medicines = [
    # Critical / High-Volume
    {"id": "MED_01", "name": "Amoxicillin (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_02", "name": "Paracetamol (Pain/Fever)", "unit": "Tablets"},
    {"id": "MED_03", "name": "Insulin (Diabetes)", "unit": "Vials"},
    {"id": "MED_04", "name": "Azithromycin (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_05", "name": "Ceftriaxone (IV Antibiotic)", "unit": "Vials"},
    # Chronic / Vitals
    {"id": "MED_06", "name": "Metformin (Diabetes)", "unit": "Tablets"},
    {"id": "MED_07", "name": "Amlodipine (Blood Pressure)", "unit": "Tablets"},
    {"id": "MED_08", "name": "Losartan (Blood Pressure)", "unit": "Tablets"},
    {"id": "MED_09", "name": "Atorvastatin (Cholesterol)", "unit": "Tablets"},
    # Emergency / Specific
    {"id": "MED_10", "name": "Epinephrine (Allergy/Anaphylaxis)", "unit": "Auto-injectors"},
    {"id": "MED_11", "name": "Salbutamol Inhaler (Asthma)", "unit": "Inhalers"},
    {"id": "MED_12", "name": "Ondansetron (Anti-nausea)", "unit": "Tablets"},
    {"id": "MED_13", "name": "Diazepam (Seizures/Anxiety)", "unit": "Vials"},
    {"id": "MED_14", "name": "Tetanus Toxoid (Vaccine)", "unit": "Ampoules"},
    {"id": "MED_15", "name": "ORS (Oral Rehydration)", "unit": "Sachets"}
]

# 2. OUR DEMO FACILITIES (The ones we will click on during the pitch)
facilities = [
    {"id": 1, "name": "Udupi District Hub", "type": "Hub", "lat": 13.3408, "lon": 74.7421},
    {"id": 2, "name": "Kundapura Taluk Hospital", "type": "Clinic", "lat": 13.6267, "lon": 74.6933},
    {"id": 3, "name": "Brahmavar CHC", "type": "Clinic", "lat": 13.4428, "lon": 74.7461}
]

# 3. PROCEDURAL GENERATION OF 70 MORE CLINICS
# We will scatter them randomly around the Udupi/Mangalore coordinates.
# Center of our map approx: Lat 13.2, Lon 74.8
for i in range(4, 75): # ID from 4 to 74
    # random.uniform picks a random decimal number between the two limits
    random_lat = random.uniform(12.8, 13.7) 
    random_lon = random.uniform(74.6, 75.1)
    
    facilities.append({
        "id": i,
        "name": f"Rural Clinic {i}",
        "type": "Clinic",
        "lat": round(random_lat, 4),
        "lon": round(random_lon, 4)
    })

# 4. GENERATE 90 DAYS OF INVENTORY DATA
inventory = []

for facility in facilities:
    for med in medicines:
        daily_base_consumption = random.randint(5, 40)
        current_stock = daily_base_consumption * random.randint(25, 60) # Everyone is generally safe
        
        # 90 days of history
        history = [max(1, daily_base_consumption + random.randint(-4, 4)) for _ in range(90)]

        # --- THE DEMO CRISIS (Kundapura runs out of Amoxicillin) ---
        if facility["name"] == "Kundapura Taluk Hospital" and med["name"] == "Amoxicillin (Antibiotic)":
            current_stock = 40 # Extremely low stock!
            history[-7:] = [80, 85, 90, 88, 95, 100, 110] # Massive demand spike in the last week
            
        # --- THE DEMO SAVIOR (Brahmavar has a massive surplus) ---
        if facility["name"] == "Brahmavar CHC" and med["name"] == "Amoxicillin (Antibiotic)":
            current_stock = 6000 # Enough to save Kundapura
            history[-7:] = [5, 6, 4, 5, 5, 4, 6] 

        inventory.append({
            "facility_id": facility["id"],
            "medicine_id": med["id"],
            "current_stock": current_stock,
            "consumption_history": history
        })

database_seed = {
    "facilities": facilities,
    "medicines": medicines,
    "inventory": inventory
}

with open('seed_data.json', 'w') as outfile:
    json.dump(database_seed, outfile, indent=4)

print(f"✅ Generated {len(facilities)} facilities and {len(inventory)} inventory records!")