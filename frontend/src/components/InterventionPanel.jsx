import { useEffect, useState } from 'react'
import { fetchRecommendation, applyIntervention } from '../api/hospitals'
import { statusOf } from '../utils/status'

function daysUntilStockout(hospital) {
  if (hospital.daysRemaining !== undefined) return Math.floor(hospital.daysRemaining)
  if (!hospital?.burnRate || hospital.burnRate <= 0) return null
  return Math.floor((hospital.stock.oxygen || 0) / hospital.burnRate)
}

function StockoutBadge({ days }) {
  if (days === null) return null
  const isCritical = days <= 3
  const isWarning = days > 3 && days <= 7

  const colorClasses = isCritical
    ? 'bg-critical text-bg'
    : isWarning
    ? 'bg-warning text-ink'
    : 'bg-healthy text-bg'

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-bold shadow-md ${colorClasses}`}>
      <span className="text-xs uppercase tracking-wide">Days Until Stockout</span>
      <span className="text-2xl leading-none">{days}</span>
    </div>
  )
}

export default function InterventionPanel({ hospital, onClose, onApplied, onViewInventory, onDonorChange }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [selectedDonorId, setSelectedDonorId] = useState(null)

  useEffect(() => {
    if (!hospital) return
    setLoading(true)
    setApplied(false)
    
    const isStable = hospital.status === 'safe' || hospital.status === 'healthy'
    
    if (isStable) {
      setRecommendation(null)
      setSelectedDonorId(null)
      setLoading(false)
      return
    }

    fetchRecommendation(hospital.id)
      .then((res) => {
        setRecommendation(res)
        if (res?.action) setSelectedDonorId(res.action.fromHospitalId)
      })
      .finally(() => setLoading(false))
  }, [hospital?.id, hospital?.status])

  useEffect(() => {
    if (onDonorChange) {
      onDonorChange(selectedDonorId)
    }
  }, [selectedDonorId, onDonorChange])

  const currentAction = recommendation?.alternatives?.find(d => d.donor_id === selectedDonorId) 
    ? {
        item: recommendation.action.item,
        units: recommendation.alternatives.find(d => d.donor_id === selectedDonorId).recommended_transfer_units,
        fromHospitalId: selectedDonorId,
        fromHospitalName: recommendation.alternatives.find(d => d.donor_id === selectedDonorId).donor_name,
        distanceKm: recommendation.alternatives.find(d => d.donor_id === selectedDonorId).distance_km
      }
    : recommendation?.action

  if (!hospital) return null
  const s = statusOf(hospital.status)
  const days = daysUntilStockout(hospital)
  const isStable = hospital.status === 'safe' || hospital.status === 'healthy'

  async function handleApply() {
    if (!currentAction) return
    setApplying(true)
    try {
      await applyIntervention(hospital.id, currentAction)
      setApplied(true)
      onApplied?.(hospital.id, currentAction)
    } finally {
      setApplying(false)
    }
  }

  const criticalItems = hospital.fullInventory 
    ? Object.entries(hospital.fullInventory).filter(([_, data]) => data.days < 5)
    : [];

  return (
    <div className="absolute inset-y-0 right-0 z-[1000] flex w-96 flex-col border-l border-edge bg-bg shadow-panel">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div>
          <p className="text-xs font-mono" style={{ color: s.color }}>{s.label.toUpperCase()}</p>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-ink">{hospital.name}</h2>
            {hospital.type && (
              <span className="inline-flex items-center rounded border border-edge bg-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mute shadow-sm">
                {hospital.type}
              </span>
            )}
          </div>
          <div className="mt-2">
            <StockoutBadge days={days} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-mute hover:bg-raised hover:text-ink"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section>
          <h3 className="mb-2 text-xs font-medium text-mute">Critical Supplies (&lt; 5 Days)</h3>
          <dl className="grid grid-cols-2 gap-2 font-mono text-sm">
            {criticalItems.length > 0 ? (
              criticalItems.map(([item, data]) => (
                <div key={item} className="rounded-md border border-critical/30 bg-critical/10 px-2 py-2">
                  <dt className="text-[10px] capitalize text-mute">{item}</dt>
                  <dd className="text-critical font-semibold">{data.days} Days left</dd>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-xs text-mute py-1">No supplies under 5 days.</div>
            )}
          </dl>
          <button
            onClick={onViewInventory}
            className="mt-3 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface/90"
          >
            View Full Inventory
          </button>
        </section>

        {!isStable && (
          <>
            <section>
              <h3 className="mb-2 text-xs font-medium text-mute">Why it&rsquo;s flagged</h3>
              {loading ? (
                <p className="text-sm text-mute">Evaluating supply position…</p>
              ) : (
                <p className="text-sm leading-relaxed text-ink">{recommendation?.summary}</p>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-medium text-mute">Recommended action</h3>
              {loading && <p className="text-sm text-mute">Building recommendation…</p>}

              {!loading && currentAction && (
                <div className="rounded-lg border border-edge bg-surface p-3">
                  <p className="text-sm text-ink">
                    Transfer <span className="font-mono text-action">{currentAction.units}</span> units of{' '}
                    <span className="font-medium">{currentAction.item}</span> from{' '}
                    <span className="font-medium">{currentAction.fromHospitalName}</span>{' '}
                    <span className="text-mute">({currentAction.distanceKm}km away)</span>
                  </p>

                  <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    className="mt-3 w-full rounded-md bg-action px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:opacity-60"
                  >
                    {applied ? 'Intervention applied' : applying ? 'Applying…' : 'Apply intervention'}
                  </button>

                  {applied && (
                    <p className="mt-2 text-xs text-healthy font-medium">
                      Transfer verified and committed to database!
                    </p>
                  )}
                </div>
              )}

              {!loading && !currentAction && (
                <p className="text-sm text-mute">No viable donor facility found nearby.</p>
              )}
            </section>

            {!loading && recommendation?.alternatives?.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-medium text-mute">
                  Alternative nearby donors
                </h3>
                <ul className="space-y-1.5">
                  {recommendation.alternatives.map((donor) => (
                    <li
                      key={donor.donor_id}
                      onClick={() => !applied && setSelectedDonorId(donor.donor_id)}
                      className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedDonorId === donor.donor_id
                          ? 'border-action bg-action/10'
                          : 'border-edge bg-surface hover:bg-surface/90'
                      } ${applied ? 'opacity-60 cursor-default' : ''}`}
                    >
                      <span className="text-ink font-medium">{donor.donor_name}</span>
                      <span className="font-mono text-xs text-mute">
                        {donor.distance_km}km · surplus {donor.surplus_days}d
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}