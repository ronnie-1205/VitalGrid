import { useEffect, useState } from 'react'
import { fetchRecommendation, applyIntervention } from '../api/hospitals'
import { statusOf } from '../utils/status'
import NearbyDonorsList from './nearbydonors'

function daysUntilStockout(hospital) {
  if (!hospital?.burnRate || hospital.burnRate <= 0) return null
  return Math.floor(hospital.stock.oxygen / hospital.burnRate)
}

function StockoutBadge({ days }) {
  if (days === null) return null
  const isCritical = days <= 3
  const isWarning = days > 3 && days <= 7

  const colorClasses = isCritical
    ? 'bg-red-600 text-white'
    : isWarning
    ? 'bg-yellow-500 text-black'
    : 'bg-green-600 text-white'

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-bold shadow-md ${colorClasses}`}>
      <span className="text-xs uppercase tracking-wide">Days Until Stockout</span>
      <span className="text-2xl leading-none">{days}</span>
    </div>
  )
}

export default function InterventionPanel({ hospital, onClose, onApplied }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (!hospital) return
    setLoading(true)
    setApplied(false)
    fetchRecommendation(hospital.id)
      .then(setRecommendation)
      .finally(() => setLoading(false))
  }, [hospital?.id])

  if (!hospital) return null
  const s = statusOf(hospital.status)
  const days = daysUntilStockout(hospital)

  async function handleApply() {
    if (!recommendation?.action) return
    setApplying(true)
    try {
      await applyIntervention(hospital.id, recommendation.action)
      setApplied(true)
      onApplied?.(hospital.id, recommendation.action)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="absolute inset-y-0 right-0 z-[1000] flex w-96 flex-col border-l border-edge bg-surface shadow-panel">
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div>
          <p className="text-xs font-mono" style={{ color: s.color }}>{s.label.toUpperCase()}</p>
          <h2 className="text-base font-semibold text-ink">{hospital.name}</h2>
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
          <h3 className="mb-2 text-xs font-medium text-mute">Current stock</h3>
          <dl className="grid grid-cols-3 gap-2 font-mono text-sm">
            {Object.entries(hospital.stock).map(([item, qty]) => (
              <div key={item} className="rounded-md border border-edge bg-bg px-2 py-2">
                <dt className="text-[10px] capitalize text-mute">{item.replace('_', ' ')}</dt>
                <dd className="text-ink">{qty}</dd>
              </div>
            ))}
          </dl>
        </section>

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

          {!loading && recommendation?.action && (
            <div className="rounded-lg border border-edge bg-bg p-3">
              <p className="text-sm text-ink">
                Transfer <span className="font-mono text-action">{recommendation.action.units}</span> units of{' '}
                <span className="font-medium">{recommendation.action.item}</span> from{' '}
                <span className="font-medium">{recommendation.action.fromHospitalName}</span>{' '}
                <span className="text-mute">({recommendation.action.distanceKm}km away)</span>
              </p>

              <button
                onClick={handleApply}
                disabled={applying || applied}
                className="mt-3 w-full rounded-md bg-action px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:opacity-60"
              >
                {applied ? 'Intervention applied' : applying ? 'Applying…' : 'Apply intervention'}
              </button>

              {applied && (
                <p className="mt-2 text-xs text-mute">
                  Recorded locally — connect the backend to persist this transfer.
                </p>
              )}
            </div>
          )}

          {!loading && !recommendation?.action && (
            <p className="text-sm text-mute">No viable donor facility found nearby.</p>
          )}
        </section>

        <section>
          <NearbyDonorsList hospitalId={hospital.id} item="oxygen" />
        </section>
      </div>
    </div>
  )
}