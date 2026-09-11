#!/bin/bash

# Define absolute paths based on your machine structure
PROJECT_ROOT="/home/ronnie/Desktop/Boss_Folder/Venv/VitalGrid"
CONDA_ENV_PATH="/home/ronnie/Desktop/Boss_Folder/Venv/VitalGrid/VitalGrid"

# THE TRAP: Catch termination signals and kill all background jobs cleanly
trap 'echo -e "\n🛑 Shutting down VitalGrid servers..."; kill $(jobs -p); exit' SIGINT SIGTERM EXIT

echo "🟢 Starting Python FastAPI Backend on Port 8001..."
cd "$PROJECT_ROOT/backend" && conda run -p "$CONDA_ENV_PATH" uvicorn main:app --reload --port 8001 &

echo "🟢 Starting React Frontend on Port 5173..."
cd "$PROJECT_ROOT/Proto-Frontend" && npm run dev &

# Keep script alive until Ctrl+C
wait
