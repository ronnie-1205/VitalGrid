import re

with open("backend/data/generate_data.py", "r") as f:
    content = f.read()

old_code = """    random_lat = random.uniform(12.8, 13.7) 
    random_lon = random.uniform(74.6, 75.1)"""
new_code = """    random_lat = random.uniform(12.8, 13.7) 
    # The coastline angles northwest. We calculate a safe minimum longitude (inland/east) 
    # based on the latitude to prevent facilities from spawning in the Arabian Sea.
    min_lon = 74.85 - (random_lat - 12.8) * 0.277
    random_lon = random.uniform(min_lon + 0.02, 75.1)"""

content = content.replace(old_code, new_code)

with open("backend/data/generate_data.py", "w") as f:
    f.write(content)
