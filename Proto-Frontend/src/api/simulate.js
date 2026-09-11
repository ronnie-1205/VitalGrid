import { apiFetch, USE_MOCKS, mockDelay } from './client'
import { MOCK_HOSPITALS, projectHospitalOnDay } from '../data/mockData'

// GAP(backend): POST /api/simulate
// body: { days: 15 }
// → { days: [ { day: 0, hospitals: [{ id, status, daysOfOxygenLeft }] }, ... ] }
//
// This is the real future loop mentioned in the architecture doc — a proper
// version should model supply consumption, transfers already applied, and
// realistic spread between connected facilities. The mock here is a linear
// per-hospital projection so the Cascade Simulator slider has something
// believable to scrub through in the meantime.
export async function runSimulation(days = 15) {
  if (USE_MOCKS) {
    await mockDelay(600)
    const timeline = []
    for (let day = 0; day <= days; day++) {
      timeline.push({
        day,
        hospitals: MOCK_HOSPITALS.map((h) => projectHospitalOnDay(h, day)),
      })
    }
    return { days: timeline }
  }
  return apiFetch('/simulate', {
    method: 'POST',
    body: JSON.stringify({ days }),
  })
}
