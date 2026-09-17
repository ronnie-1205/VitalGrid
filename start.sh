#!/bin/bash

# Get the absolute path to the directory containing this script (so it can be run from anywhere)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# THE TRAP: Catch termination signals and kill all background jobs cleanly
trap 'echo -e "\n🛑 Shutting down VitalGrid servers..."; kill $(jobs -p); exit' SIGINT SIGTERM EXIT

cd "$PROJECT_ROOT"

echo "🟢 Generating synthetic data and seeding database..."
cd "$PROJECT_ROOT/backend" || exit
python generate_data.py
python seed_db.py

echo "🟢 Starting Python FastAPI Backend on Port 8001..."
python -m uvicorn main:app --reload --port 8001 &

echo "🟢 Waiting 3 seconds for backend to boot..."
sleep 3

echo "🟢 Starting React Frontend on Port 5173..."
cd "$PROJECT_ROOT/frontend" || exit

# If node_modules is missing, run install automatically
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies (this might take a minute)..."
    npm install
fi

npm run dev &

# Keep script alive until Ctrl+C
wait
