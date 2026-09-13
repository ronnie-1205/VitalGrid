import { useEffect, useMemo, useState } from 'react'
import CommandMap from './CommandMap'
import { runSimulation } from '../api/simulate'
import { statusOf } from '../utils/status'

const TOTAL_DAYS = 30

export default function CascadeSimulator() {
  const [timeline, setTimeline] = useState(null)
  const [day, setDay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    runSimulation(TOTAL_DAYS)
      .then((res) => setTimeline(res.days))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let timer;
    if (isPlaying && day < TOTAL_DAYS) {
      timer = setInterval(() => {
        setDay(d => {
          if (d >= TOTAL_DAYS) {
            setIsPlaying(false)
            return TOTAL_DAYS
          }
          return d + 1
        })
      }, 800)
    } else if (day >= TOTAL_DAYS) {
      setIsPlaying(false)
    }
    return () => clearInterval(timer)
  }, [isPlaying, day])

  const dayData = useMemo(() => timeline?.find((d) => d.day === day), [timeline, day])
  const hospitals = dayData?.hospitals || []

  const criticalCount = hospitals.filter((h) => h.status === 'critical').length
  const warningCount = hospitals.filter((h) => h.status === 'warning').length

  const handleStart = () => {
    if (day >= TOTAL_DAYS) setDay(0);
    setHasStarted(true)
    setIsPlaying(true)
  }

  return (
    <div className="relative flex-1">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg/80">
          <p className="font-mono text-sm text-mute">Running 15-day projection…</p>
        </div>
      )}

      {!hasStarted && !loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg/60 backdrop-blur-sm">
          <button 
             onClick={handleStart}
             className="rounded-lg bg-action px-8 py-3 font-semibold text-bg shadow-lg hover:bg-action/90 transition-all"
          >
            Start Simulation
          </button>
        </div>
      )}

      {!loading && <CommandMap hospitals={hospitals} selectedId={null} activeDonorId={null} onSelect={() => {}} />}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[900] flex justify-center p-4">
        <div className="pointer-events-auto flex items-center gap-4 rounded-lg border border-edge bg-surface/95 px-4 py-2 shadow-panel backdrop-blur">
          <span className="font-mono text-sm text-mute">Day</span>
          <span className="w-6 text-center font-mono text-lg font-semibold text-ink">{day}</span>
          <span className="font-mono text-sm text-critical">{criticalCount} critical</span>
          <span className="font-mono text-sm text-warning">{warningCount} at risk</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[900] border-t border-edge bg-surface/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
             onClick={() => {
               if (!hasStarted) setHasStarted(true);
               if (day >= TOTAL_DAYS) setDay(0);
               setIsPlaying(!isPlaying);
             }}
             disabled={loading}
             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            ) : (
              <svg className="h-5 w-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={TOTAL_DAYS}
              value={day}
              onChange={(e) => {
                setDay(Number(e.target.value))
                setHasStarted(true)
                setIsPlaying(false)
              }}
              className="w-full accent-action"
              disabled={loading}
            />
            <div className="mt-1 flex justify-between font-mono text-[11px] text-mute">
              {Array.from({ length: TOTAL_DAYS + 1 }, (_, i) => (
                <span key={i} className={i === day ? 'text-ink font-bold' : ''}>{i}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
