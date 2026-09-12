import json
import random
import os

# 1. EXPANDED MEDICINE CATALOG (50 Medicines)
medicines = [
    # Antibiotics
    {"id": "MED_01", "name": "Amoxicillin (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_02", "name": "Azithromycin (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_03", "name": "Ceftriaxone (IV Antibiotic)", "unit": "Vials"},
    {"id": "MED_04", "name": "Ciprofloxacin (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_05", "name": "Doxycycline (Antibiotic)", "unit": "Tablets"},
    {"id": "MED_06", "name": "Meropenem (IV Antibiotic)", "unit": "Vials"},
    {"id": "MED_07", "name": "Metronidazole (Antibiotic)", "unit": "Tablets"},
    # Pain/Fever
    {"id": "MED_08", "name": "Paracetamol (Pain/Fever)", "unit": "Tablets"},
    {"id": "MED_09", "name": "Ibuprofen (Pain/Inflammation)", "unit": "Tablets"},
    {"id": "MED_10", "name": "Diclofenac (Pain/Inflammation)", "unit": "Tablets"},
    {"id": "MED_11", "name": "Tramadol (Severe Pain)", "unit": "Tablets"},
    {"id": "MED_12", "name": "Morphine (Severe Pain)", "unit": "Ampoules"},
    # Diabetes
    {"id": "MED_13", "name": "Insulin Glargine (Diabetes)", "unit": "Vials"},
    {"id": "MED_14", "name": "Metformin (Diabetes)", "unit": "Tablets"},
    {"id": "MED_15", "name": "Glimepiride (Diabetes)", "unit": "Tablets"},
    {"id": "MED_16", "name": "Sitagliptin (Diabetes)", "unit": "Tablets"},
    # Cardiovascular
    {"id": "MED_17", "name": "Amlodipine (Blood Pressure)", "unit": "Tablets"},
    {"id": "MED_18", "name": "Losartan (Blood Pressure)", "unit": "Tablets"},
    {"id": "MED_19", "name": "Atorvastatin (Cholesterol)", "unit": "Tablets"},
    {"id": "MED_20", "name": "Rosuvastatin (Cholesterol)", "unit": "Tablets"},
    {"id": "MED_21", "name": "Metoprolol (Beta Blocker)", "unit": "Tablets"},
    {"id": "MED_22", "name": "Clopidogrel (Blood Thinner)", "unit": "Tablets"},
    {"id": "MED_23", "name": "Aspirin (Blood Thinner)", "unit": "Tablets"},
    # Emergency / ICU
    {"id": "MED_24", "name": "Epinephrine (Allergy/Anaphylaxis)", "unit": "Auto-injectors"},
    {"id": "MED_25", "name": "Atropine (Resuscitation)", "unit": "Ampoules"},
    {"id": "MED_26", "name": "Norepinephrine (Vasopressor)", "unit": "Ampoules"},
    {"id": "MED_27", "name": "Propofol (Anesthesia)", "unit": "Vials"},
    {"id": "MED_28", "name": "Fentanyl (Anesthesia/Pain)", "unit": "Ampoules"},
    {"id": "MED_29", "name": "Midazolam (Sedative)", "unit": "Vials"},
    {"id": "MED_30", "name": "Oxygen (Medical Gas)", "unit": "Cylinders"},
    # Respiratory / Allergy
    {"id": "MED_31", "name": "Salbutamol Inhaler (Asthma)", "unit": "Inhalers"},
    {"id": "MED_32", "name": "Budesonide (Asthma)", "unit": "Inhalers"},
    {"id": "MED_33", "name": "Cetirizine (Antihistamine)", "unit": "Tablets"},
    {"id": "MED_34", "name": "Levocetirizine (Antihistamine)", "unit": "Tablets"},
    # Gastrointestinal
    {"id": "MED_35", "name": "Ondansetron (Anti-nausea)", "unit": "Tablets"},
    {"id": "MED_36", "name": "Pantoprazole (Antacid)", "unit": "Tablets"},
    {"id": "MED_37", "name": "Domperidone (Anti-nausea)", "unit": "Tablets"},
    {"id": "MED_38", "name": "Loperamide (Anti-diarrheal)", "unit": "Tablets"},
    # Fluids / Electrolytes
    {"id": "MED_39", "name": "ORS (Oral Rehydration)", "unit": "Sachets"},
    {"id": "MED_40", "name": "Normal Saline (IV Fluid)", "unit": "Bags"},
    {"id": "MED_41", "name": "Ringer Lactate (IV Fluid)", "unit": "Bags"},
    # Neuro / Psych
    {"id": "MED_42", "name": "Diazepam (Seizures/Anxiety)", "unit": "Vials"},
    {"id": "MED_43", "name": "Phenytoin (Seizures)", "unit": "Tablets"},
    {"id": "MED_44", "name": "Escitalopram (Antidepressant)", "unit": "Tablets"},
    # Vaccines / Misc
    {"id": "MED_45", "name": "Tetanus Toxoid (Vaccine)", "unit": "Ampoules"},
    {"id": "MED_46", "name": "Rabies Vaccine", "unit": "Vials"},
    {"id": "MED_47", "name": "Anti-Snake Venom (ASV)", "unit": "Vials"},
    {"id": "MED_48", "name": "Iron/Folic Acid", "unit": "Tablets"},
    {"id": "MED_49", "name": "Calcium/Vitamin D3", "unit": "Tablets"},
    {"id": "MED_50", "name": "Thyroxine (Thyroid)", "unit": "Tablets"}
]

# Town names to generate realistic hospital names
towns = [
    "Manipal", "Kundapura", "Karkala", "Brahmavar", "Byndoor", "Kaup", "Hebri", "Malpe", 
    "Parkala", "Saligrama", "Kota", "Shankaranarayana", "Shirva", "Padubidri", "Udyavara", 
    "Katapadi", "Nitte", "Hiryadka", "Ajekar", "Koteshwara", "Basrur", "Vandse", "Gangolli", 
    "Trasi", "Kollur", "Ambalpady", "Perdoor", "Kokkarne", "Bailoor", "Siddapura"
]

types = ["Rural", "Urban Small", "Urban Big", "Multispeciality Hospital"]
type_weights = [0.5, 0.3, 0.15, 0.05]
type_scale = {
    "Rural": 1,
    "Urban Small": 3,
    "Urban Big": 8,
    "Multispeciality Hospital": 20
}

# 2. OUR DEMO FACILITIES
facilities = [
    {"id": 1, "name": "Udupi District Hub", "type": "Multispeciality Hospital", "lat": 13.3408, "lon": 74.7421},
    {"id": 2, "name": "Kundapura Taluk Hospital", "type": "Urban Big", "lat": 13.6267, "lon": 74.6933},
    {"id": 3, "name": "Brahmavar CHC", "type": "Urban Small", "lat": 13.4428, "lon": 74.7461}
]

# 3. PROCEDURAL GENERATION OF 70 MORE CLINICS
random.seed(42) # For reproducible names
for i in range(4, 75): 
    random_lat = random.uniform(12.8, 13.7) 
    min_lon = 74.85 - (random_lat - 12.8) * 0.277
    random_lon = random.uniform(min_lon + 0.02, 75.1)
    
    fac_type = random.choices(types, weights=type_weights)[0]
    town = random.choice(towns)
    
    suffix = ""
    if fac_type == "Rural":
        suffix = random.choice(["Primary Health Centre", "Rural Clinic", "Dispensary"])
    elif fac_type == "Urban Small":
        suffix = random.choice(["Community Clinic", "Nursing Home", "Polyclinic"])
    elif fac_type == "Urban Big":
        suffix = random.choice(["General Hospital", "City Hospital", "Taluk Hospital"])
    else:
        suffix = random.choice(["Super Speciality Hospital", "Medical College Hospital", "Institute of Medical Sciences"])

    fac_name = f"{town} {suffix}"
    
    facilities.append({
        "id": i,
        "name": fac_name,
        "type": fac_type,
        "lat": round(random_lat, 4),
        "lon": round(random_lon, 4)
    })

# 4. GENERATE 90 DAYS OF INVENTORY DATA
inventory = []
for facility in facilities:
    scale = type_scale.get(facility["type"], 1)
    
    # 85% stable, 10% warning, 5% critical
    health_profile = random.choices(["stable", "warning", "critical"], weights=[0.85, 0.10, 0.05])[0]
    weakest_med_id = random.choice(medicines)["id"]
    
    for med in medicines:
        # Base daily consumption adjusted by hospital scale
        daily_base_consumption = random.randint(1, 10) * scale
        
        # Determine days of stock based on hospital health profile
        if med["id"] == weakest_med_id:
            if health_profile == "critical":
                days_of_stock = random.uniform(0.1, 3.0)
            elif health_profile == "warning":
                days_of_stock = random.uniform(4.0, 7.0)
            else:
                days_of_stock = random.randint(25, 120)
        else:
            # Other medicines should be relatively healthy
            days_of_stock = random.randint(20, 150)
            
        current_stock = daily_base_consumption * days_of_stock
        
        # Generate slightly fluctuating history
        history = [max(1, daily_base_consumption + random.randint(-int(scale), int(scale))) for _ in range(90)]

        # Specific scripted events for our demo narrative
        if facility["name"] == "Kundapura Taluk Hospital" and med["name"] == "Amoxicillin (Antibiotic)":
            current_stock = int(daily_base_consumption * 0.4) # Extremely low stock!
            history[-7:] = [daily_base_consumption * 3] * 7 # Massive demand spike
            
        if facility["name"] == "Brahmavar CHC" and med["name"] == "Amoxicillin (Antibiotic)":
            current_stock = daily_base_consumption * 200 # Massive surplus
            history[-7:] = [max(1, int(daily_base_consumption * 0.1))] * 7 # Very low demand

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

script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, 'seed_data.json')
with open(json_path, 'w') as outfile:
    json.dump(database_seed, outfile, indent=4)

print(f"✅ Generated {len(facilities)} facilities and {len(inventory)} inventory records!")
