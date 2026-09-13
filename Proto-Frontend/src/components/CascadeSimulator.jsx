import { useEffect, useMemo, useState } from 'react'
import CommandMap from './CommandMap'
import { runSimulation } from '../api/simulate'
import { statusOf } from '../utils/status'

const TOTAL_DAYS = 30

export default function CascadeSimulator() {
  const [timeline, setTimeline] = useState(null)
  const [day, setDay] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [macroDisruption, setMacroDisruption] = useState(false)

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
    setLoading(true)
    runSimulation(TOTAL_DAYS, macroDisruption)
      .then((res) => {
        setTimeline(res.days)
        if (day >= TOTAL_DAYS) setDay(0)
        setHasStarted(true)
        setIsPlaying(true)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="relative flex-1">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg/80">
          <p className="font-mono text-sm text-mute">Running 30-day stochastic projection…</p>
        </div>
      )}

      {!hasStarted && !loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-bg/80 backdrop-blur-md">
          <div className="mb-8 max-w-2xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-ink">Configure Simulation</h2>
            <p className="text-sm text-mute">Choose the macroeconomic conditions for the 30-day projection.</p>
          </div>
          
          <div className="mb-10 flex gap-6">
            <button
              onClick={() => setMacroDisruption(false)}
              className={`flex w-72 flex-col items-start gap-2 rounded-xl border p-5 text-left transition-all ${
                !macroDisruption ? 'border-action bg-action/10' : 'border-edge bg-surface hover:border-action/50'
              }`}
            >
              <h3 className="font-semibold text-ink">Base Analytics Model</h3>
              <p className="text-xs text-mute">
                Run the standard fluid simulation. Hospitals face dynamic delivery times (3-15 days) based strictly on current regional health metrics.
              </p>
            </button>
            
            <button
              onClick={() => setMacroDisruption(true)}
              className={`flex w-72 flex-col items-start gap-2 rounded-xl border p-5 text-left transition-all ${
                macroDisruption ? 'border-critical bg-critical/10' : 'border-edge bg-surface hover:border-critical/50'
              }`}
            >
              <h3 className="font-semibold text-critical">Macro-Disruption Mode</h3>
              <p className="text-xs text-mute">
                Inject massive real-world chaos. Simulates a national logistics strike with 25% dropped orders, random severe delays (up to 14 extra days), and extreme partial rationing (15-70% fills).
              </p>
            </button>
          </div>

          <button 
             onClick={handleStart}
             className="rounded-lg bg-action px-8 py-3 font-semibold text-bg shadow-lg transition-all hover:bg-action/90"
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
          
          <button
            onClick={() => {
              setHasStarted(false)
              setIsPlaying(false)
              setDay(0)
              setTimeline(null)
            }}
            disabled={loading || !hasStarted}
            className="flex h-10 shrink-0 items-center justify-center rounded-lg border border-edge bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-bg disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
