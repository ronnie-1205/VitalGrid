import { useEffect, useMemo, useState } from 'react'
import CommandMap from './CommandMap'
import { runSimulation } from '../api/simulate'
import { statusOf } from '../utils/status'

const TOTAL_DAYS = 15

export default function CascadeSimulator() {
  const [timeline, setTimeline] = useState(null)
  const [day, setDay] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runSimulation(TOTAL_DAYS)
      .then((res) => setTimeline(res.days))
      .finally(() => setLoading(false))
  }, [])

  const dayData = useMemo(() => timeline?.find((d) => d.day === day), [timeline, day])
  const hospitals = dayData?.hospitals || []

  const criticalCount = hospitals.filter((h) => h.status === 'critical').length
  const warningCount = hospitals.filter((h) => h.status === 'warning').length

  return (
    <div className="relative flex-1">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg/80">
          <p className="font-mono text-sm text-mute">Running 15-day projection…</p>
        </div>
      )}

      {!loading && <CommandMap hospitals={hospitals} selectedId={null} onSelect={() => {}} />}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[900] flex justify-center p-4">
        <div className="pointer-events-auto flex items-center gap-4 rounded-lg border border-edge bg-surface/95 px-4 py-2 shadow-panel backdrop-blur">
          <span className="font-mono text-sm text-mute">Day</span>
          <span className="w-6 text-center font-mono text-lg font-semibold text-ink">{day}</span>
          <span className="font-mono text-sm text-critical">{criticalCount} critical</span>
          <span className="font-mono text-sm text-warning">{warningCount} at risk</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[900] border-t border-edge bg-surface/95 px-6 py-4 backdrop-blur">
        <input
          type="range"
          min={0}
          max={TOTAL_DAYS}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="w-full accent-critical"
          disabled={loading}
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-mute">
          {Array.from({ length: TOTAL_DAYS + 1 }, (_, i) => (
            <span key={i} className={i === day ? 'text-ink' : ''}>{i}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
