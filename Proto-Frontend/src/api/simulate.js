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
export async function runSimulation(days = 15, macroDisruption = false) {
  if (USE_MOCKS) {
    await mockDelay(1500)
    const { MOCK_HOSPITALS } = await import('../data/mockData')
    
    const timeline = []
    for (let d = 0; d <= days; d++) {
      timeline.push({
        day: d,
        hospitals: MOCK_HOSPITALS.map((h) => ({
          ...h,
          status: d > 2 && h.id === 1 ? 'critical' : h.status,
          daysOfOxygenLeft: Math.max(0, h.stock.oxygen / 10 - d * 0.5)
        }))
      })
    }
    return { days: timeline }
  }
  
  return apiFetch('/simulate', {
    method: 'POST',
    body: JSON.stringify({ days, macro_disruption: macroDisruption })
  })
}
