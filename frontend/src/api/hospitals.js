import { apiFetch, USE_MOCKS, mockDelay } from './client'
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
    type: node.type,
    lat: node.lat,
    lng: node.lon,
    status: node.status,
    criticalItem: node.critical_medicine || 'Supply',
    daysRemaining: node.lowest_days_remaining,
    fullInventory: node.full_inventory || {},
    stock: { 
      [node.critical_medicine || 'Supply']: Math.round(node.lowest_days_remaining * 10)
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
    const donors = hospitals
      .filter((h) => h.id !== hospitalId && h.status === 'healthy')
      .sort((a, b) => haversineKm(target, a) - haversineKm(target, b))
      .slice(0, 3)

    if (!target || donors.length === 0) {
      return { summary: 'No viable donor hospital found nearby.', action: null }
    }

    const bestDonor = donors[0]
    const distanceKm = Math.round(haversineKm(target, bestDonor))
    const units = Math.round(bestDonor.stock.oxygen * 0.3)

    return {
      summary: `${target.name} is running out of oxygen. ${bestDonor.name} has surplus capacity ${distanceKm}km away.`,
      action: {
        type: 'transfer',
        fromHospitalId: bestDonor.id,
        fromHospitalName: bestDonor.name,
        item: 'oxygen',
        units,
        distanceKm,
      },
      alternatives: donors.map(d => ({
        donor_id: d.id,
        donor_name: d.name,
        distance_km: Math.round(haversineKm(target, d)),
        surplus_days: Math.round(d.stock.oxygen / 10),
        recommended_transfer_units: units
      }))
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
    },
    alternatives: data.best_interventions
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
