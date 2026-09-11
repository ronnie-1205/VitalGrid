import { apiFetch, USE_MOCKS, mockDelay } from './client'
import { MOCK_HOSPITALS, MOCK_ALERTS } from '../data/mockData'


// GAP(backend): GET /api/hospitals
// → [{ id, name, lat, lng, status: 'healthy'|'warning'|'critical',
//      stock: { paracetamol, oxygen, iv_fluid }, burnRate }]
export async function fetchHospitals() {
  if (USE_MOCKS) {
    await mockDelay()
    return MOCK_HOSPITALS
  }
  return apiFetch('/hospitals')
}

// GAP(backend): GET /api/alerts
// → [{ id, hospitalId, severity: 'warning'|'critical', message, time }]
export async function fetchAlerts() {
  if (USE_MOCKS) {
    await mockDelay()
    return MOCK_ALERTS
  }
  return apiFetch('/alerts')
}

// GAP(backend): GET /api/hospitals/:id/recommendation
// → { summary, action: { type: 'transfer', fromHospitalId, units, item, distanceKm } }
// This is what powers the "RECOMMENDED ACTION" card in the Intervention Hub.
// The mock below reasons over sibling hospitals client-side; the real
// version should run a proper allocation/routing model server-side.
export async function fetchRecommendation(hospitalId) {
  if (USE_MOCKS) {
    await mockDelay(400)
    const { MOCK_HOSPITALS: hospitals } = await import('../data/mockData')
    const target = hospitals.find((h) => h.id === hospitalId)
    const donor = hospitals
      .filter((h) => h.id !== hospitalId && h.status === 'healthy')
      .sort((a, b) => b.stock.oxygen - a.stock.oxygen)[0]

    if (!target || !donor) {
      return { summary: 'No viable donor hospital found nearby.', action: null }
    }

    const distanceKm = Math.round(haversineKm(target, donor))
    const units = Math.round(donor.stock.oxygen * 0.3)

    return {
      summary: `${target.name} is running out of oxygen. ${donor.name} has surplus capacity ${distanceKm}km away.`,
      action: {
        type: 'transfer',
        fromHospitalId: donor.id,
        fromHospitalName: donor.name,
        item: 'oxygen',
        units,
        distanceKm,
      },
    }
  }
  return apiFetch(`/hospitals/${hospitalId}/recommendation`)
}

// GAP(backend): POST /api/hospitals/:id/interventions
// body: { fromHospitalId, item, units }
// → { success, updatedStock: { paracetamol, oxygen, iv_fluid } }
// Right now this only simulates the effect locally so the UI has something
// to react to — it does NOT persist anywhere until the backend exists.
export async function applyIntervention(hospitalId, action) {
  if (USE_MOCKS) {
    await mockDelay(500)
    return { success: true, appliedAt: new Date().toISOString() }
  }
  return apiFetch(`/hospitals/${hospitalId}/interventions`, {
    method: 'POST',
    body: JSON.stringify(action),
  })
}

export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
// GAP(backend): GET /api/hospitals/:id/nearby-donors
// → [{ id, name, distanceKm, surplus }]
// Shows the candidate pool the recommendation engine reasons over —
// makes the "why this donor" logic visible instead of implied.
export async function fetchNearbyDonors(hospitalId, item = 'oxygen') {
  if (USE_MOCKS) {
    await mockDelay(300)
    const { MOCK_HOSPITALS: hospitals } = await import('../data/mockData')
    const target = hospitals.find((h) => h.id === hospitalId)
    if (!target) return []

    return hospitals
      .filter((h) => h.id !== hospitalId && h.status === 'healthy')
      .map((h) => ({
        id: h.id,
        name: h.name,
        distanceKm: Math.round(haversineKm(target, h)),
        surplus: h.stock[item],
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }
  return apiFetch(`/hospitals/${hospitalId}/nearby-donors`)
}