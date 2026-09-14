// Stand-in for what `GET /api/hospitals` will return once SQLite is wired
// up. Shape is deliberately final — swapping the fetch in api/hospitals.js
// for a real call should require no changes downstream.

export const MOCK_HOSPITALS = [
  { id: 'h1', name: 'Udupi District Hospital', lat: 13.3409, lng: 74.7421, status: 'healthy', stock: { paracetamol: 820, oxygen: 140, iv_fluid: 310 }, burnRate: 18 },
  { id: 'h2', name: 'Manipal Community Clinic', lat: 13.3525, lng: 74.7864, status: 'healthy', stock: { paracetamol: 640, oxygen: 96, iv_fluid: 220 }, burnRate: 22 },
  { id: 'h3', name: 'Kundapura Taluk Hospital', lat: 13.6235, lng: 74.6890, status: 'critical', stock: { paracetamol: 40, oxygen: 6, iv_fluid: 15 }, burnRate: 31 },
  { id: 'h4', name: 'Karkala Rural Centre', lat: 13.2158, lng: 74.9930, status: 'warning', stock: { paracetamol: 180, oxygen: 22, iv_fluid: 60 }, burnRate: 27 },
  { id: 'h5', name: 'Brahmavar PHC', lat: 13.4181, lng: 74.7440, status: 'healthy', stock: { paracetamol: 510, oxygen: 70, iv_fluid: 190 }, burnRate: 14 },
  { id: 'h6', name: 'Hebri Community Hospital', lat: 13.3910, lng: 75.0130, status: 'critical', stock: { paracetamol: 25, oxygen: 3, iv_fluid: 9 }, burnRate: 35 },
  { id: 'h7', name: 'Kaup Coastal Clinic', lat: 13.2130, lng: 74.7440, status: 'healthy', stock: { paracetamol: 700, oxygen: 110, iv_fluid: 280 }, burnRate: 16 },
  { id: 'h8', name: 'Byndoor Taluk Hospital', lat: 13.7960, lng: 74.6330, status: 'warning', stock: { paracetamol: 160, oxygen: 18, iv_fluid: 55 }, burnRate: 24 },
]

// Stand-in for `GET /api/alerts` — usually derived server-side from stock
// levels + burn rate, but kept as its own endpoint so the backend can push
// alerts that aren't purely stock-driven (staff shortage, equipment down).
export const MOCK_ALERTS = [
  { id: 'a1', hospitalId: 'h6', severity: 'critical', message: 'Oxygen reserve exhausted in an estimated 2 days.', time: '08:14' },
  { id: 'a2', hospitalId: 'h3', severity: 'critical', message: 'Paracetamol stock below 3-day safety threshold.', time: '07:52' },
  { id: 'a3', hospitalId: 'h4', severity: 'warning', message: 'IV fluid burn rate up 18% week-over-week.', time: '06:30' },
  { id: 'a4', hospitalId: 'h8', severity: 'warning', message: 'Oxygen reserve projected critical within 5 days.', time: '05:47' },
]

// Stand-in for the body of `POST /api/simulate` — a naive linear projection
// so the Cascade Simulator has something believable to scrub through before
// a real epidemiological/logistics model exists on the backend.
export function projectHospitalOnDay(hospital, day) {
  const daysOfOxygenLeft = hospital.stock.oxygen / Math.max(hospital.burnRate * 0.08, 1)
  const projectedDay = Math.max(daysOfOxygenLeft - day, -99)

  let status = 'healthy'
  if (projectedDay <= 0) status = 'critical'
  else if (projectedDay <= 3) status = 'warning'

  return { ...hospital, status, daysOfOxygenLeft: Math.max(Math.round(daysOfOxygenLeft - day), 0) }
}
