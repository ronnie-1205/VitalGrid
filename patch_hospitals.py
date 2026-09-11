with open("Proto-Frontend/src/api/hospitals.js", "w") as f:
    f.write("""import { apiFetch, USE_MOCKS, mockDelay } from './client'
import { MOCK_HOSPITALS, MOCK_ALERTS } from '../data/mockData'

export async function fetchHospitals() {
  if (USE_MOCKS) {
    await mockDelay()
    return MOCK_HOSPITALS
  }
  const data = await apiFetch('/network')
  return data.nodes.map(node => ({
    id: node.id,
    name: node.name,
    lat: node.lat,
    lng: node.lon,
    status: node.status,
    stock: { 
      [node.critical_medicine || 'Supply']: Math.round(node.lowest_days_remaining * 10),
      oxygen: Math.round(node.lowest_days_remaining * 10) 
    },
    burnRate: 10
  }))
}

export async function fetchAlerts() {
  if (USE_MOCKS) {
    await mockDelay()
    return MOCK_ALERTS
  }
  return apiFetch('/alerts')
}

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
  
  const data = await apiFetch(`/recommendations/${hospitalId}`)
  if (!data || !data.best_interventions || data.best_interventions.length === 0) {
    return { summary: 'No viable donor facility found nearby.', action: null }
  }
  
  const best = data.best_interventions[0]
  return {
    summary: `${data.crisis_facility} is running out of ${data.medicine_needed}. ${best.donor_name} has surplus capacity ${best.distance_km}km away.`,
    action: {
      type: 'transfer',
      fromHospitalId: best.donor_id,
      fromHospitalName: best.donor_name,
      item: data.medicine_needed,
      units: best.recommended_transfer_units,
      distanceKm: best.distance_km
    }
  }
}

export async function applyIntervention(hospitalId, action) {
  if (USE_MOCKS) {
    await mockDelay(500)
    return { success: true, appliedAt: new Date().toISOString() }
  }
  return apiFetch(`/interventions/${hospitalId}`, {
    method: 'POST',
    body: JSON.stringify({
      fromHospitalId: action.fromHospitalId,
      item: action.item,
      units: action.units
    })
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
  
  const data = await apiFetch(`/recommendations/${hospitalId}`)
  if (!data || !data.best_interventions) return []
  
  return data.best_interventions.map(d => ({
    id: d.donor_id,
    name: d.donor_name,
    distanceKm: d.distance_km,
    surplus: Math.round(d.surplus_days * 10)
  }))
}
""")
