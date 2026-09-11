# Regional Supply Command Center

Frontend-only build for the hackathon demo — no backend exists yet. Every
place the backend eventually plugs in is marked `GAP(backend)` in the code.

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5173. Works fully offline from a data standpoint —
all hospital data, alerts, recommendations, and the 15-day projection are
mocked in `src/data/mockData.js` and served through `src/api/*.js`.

## Screens

- **Command Center** — map of the region, hospitals colored by status
  (healthy / at risk / critical), alert sidebar on the right.
- **Cascade Simulator** — drag the day slider (0–15) to watch the projected
  supply situation evolve across the network.
- Click any hospital marker (or an alert) to open the **Intervention Hub**
  slide-over: why it's flagged, current stock, and a recommended transfer
  you can apply.

## Where the backend plugs in

Everything funnels through `src/api/client.js`. To connect a real backend:

1. Build the endpoints listed below.
2. Set `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`) and
   `VITE_USE_MOCKS=false` in a `.env` file, or wire up the Vite dev proxy in
   `vite.config.js`.
3. No component code needs to change — every screen already reads through
   the `api/` layer, not the mock data directly.

| Endpoint | Used by | Notes |
|---|---|---|
| `GET /api/hospitals` | Command Center, Simulator | `src/api/hospitals.js` → `fetchHospitals` |
| `GET /api/alerts` | Alert sidebar | `src/api/hospitals.js` → `fetchAlerts` |
| `GET /api/hospitals/:id/recommendation` | Intervention Hub | `src/api/hospitals.js` → `fetchRecommendation` |
| `POST /api/hospitals/:id/interventions` | Intervention Hub "Apply" button | `src/api/hospitals.js` → `applyIntervention` |
| `POST /api/simulate` | Cascade Simulator | `src/api/simulate.js` → `runSimulation`, runs the 14/15-day future loop |

Exact request/response shapes are documented as comments directly above
each function.

## Stack

React (Vite) + Tailwind CSS + React-Leaflet (OpenStreetMap/CARTO tiles,
no API key needed).
