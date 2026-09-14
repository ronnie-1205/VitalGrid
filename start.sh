#!/bin/bash

# Define absolute paths based on your machine structure
PROJECT_ROOT="/home/ronnie/Desktop/Boss_Folder/Venv/VitalGrid"
CONDA_ENV_PATH="/home/ronnie/Desktop/Boss_Folder/Venv/VitalGrid/VitalGrid"

# THE TRAP: Catch termination signals and kill all background jobs cleanly
trap 'echo -e "\n🛑 Shutting down VitalGrid servers..."; kill $(jobs -p); exit' SIGINT SIGTERM EXIT

cd "$PROJECT_ROOT/backend" && conda run -p "$CONDA_ENV_PATH" python generate_data.py
conda run -p "$CONDA_ENV_PATH" python seed_db.py

echo "🟢 Starting Python FastAPI Backend on Port 8001..."
cd "$PROJECT_ROOT/backend" && conda run -p "$CONDA_ENV_PATH" uvicorn main:app --reload --port 8001 &

echo "🟢 Waiting 3 seconds for backend to boot..."
sleep 3

echo "🟢 Starting React Frontend on Port 5173..."
cd "$PROJECT_ROOT/frontend" && npm run dev &

# Keep script alive until Ctrl+C
wait
