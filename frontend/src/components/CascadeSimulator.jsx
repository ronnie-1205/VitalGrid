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
  const [autoIntervene, setAutoIntervene] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  
  const [showGuide, setShowGuide] = useState(() => {
    return sessionStorage.getItem('cascadeGuideSeen') !== 'true';
  })

  const dismissGuide = () => {
    sessionStorage.setItem('cascadeGuideSeen', 'true');
    setShowGuide(false);
  }

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

      }, 1000 / playbackSpeed)
    } else if (day >= TOTAL_DAYS) {
      setIsPlaying(false)
    }
    return () => clearInterval(timer)
  }, [isPlaying, day, playbackSpeed])

  const dayData = useMemo(() => timeline?.find((d) => d.day === day), [timeline, day])
  const hospitals = dayData?.hospitals || []

  const selectedHospital = useMemo(() => hospitals.find(h => h.id === selectedId) || null, [hospitals, selectedId])

  const historicalEvents = useMemo(() => {
    if (!selectedId || !timeline) return [];
    
    const hist = [];
    for (let d = 0; d <= day; d++) {
      const dData = timeline.find(t => t.day === d);
      if (dData && dData.events) {
        const hEvents = dData.events.filter(e => e.f_id === selectedId || e.from_id === selectedId || e.to_id === selectedId);
        hEvents.forEach(e => hist.push({ day: d, ...e }))
      }
    }
    return hist.reverse(); // Newest first
  }, [timeline, day, selectedId])

  const criticalCount = hospitals.filter((h) => h.status === 'critical').length
  const warningCount = hospitals.filter((h) => h.status === 'warning').length

  const handleStart = () => {
    setLoading(true)
    runSimulation(TOTAL_DAYS, macroDisruption, autoIntervene)
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
      {showGuide && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-edge bg-surface p-8 shadow-2xl">
            <h2 className="mb-2 text-2xl font-bold text-ink">Welcome to the Cascade Simulator</h2>
            <p className="mb-6 text-sm text-mute">
              This engine projects the next 30 days of supply chain health. It simulates physical logistics, 
              stochastic demand, patient spillovers, and automated AI interventions in real-time.
            </p>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-ink border-b border-edge pb-2">Hospital Status</h3>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-healthy shadow-[0_0_8px_#4A7C59]"></div>
                  <span className="text-sm text-ink"><strong className="text-healthy">Safe:</strong> &gt;7 days of stock</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-warning shadow-[0_0_8px_#D67D00]"></div>
                  <span className="text-sm text-ink"><strong className="text-warning">At Risk:</strong> 4-7 days of stock</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-critical shadow-[0_0_8px_#C1121F]"></div>
                  <span className="text-sm text-ink"><strong className="text-critical">Critical:</strong> 0-3 days of stock</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-ink border-b border-edge pb-2">Live Telemetry</h3>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-1 w-8 border-b-2 border-dashed border-critical"></div>
                  <div className="text-sm text-ink">
                    <strong className="text-critical">Patient Spillover</strong>
                    <p className="text-xs text-mute mt-0.5">When a hospital hits 0 stock, untreated patients physically overflow to the nearest surviving hospital.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-1 w-8 border-b-2 border-dashed border-action"></div>
                  <div className="text-sm text-ink">
                    <strong className="text-action">Smart Routing</strong>
                    <p className="text-xs text-mute mt-0.5">If Auto-Intervene is enabled, AI dynamically transfers 14-day supply packages from surplus hospitals to failing ones.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={dismissGuide}
                className="rounded-lg bg-surface px-8 py-2.5 text-sm font-semibold text-ink border border-edge shadow-sm transition-all hover:bg-surface/90"
              >
                I understand, let's start
              </button>
            </div>
          </div>
        </div>
      )}
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
          
          <div className="mb-6 flex gap-6">
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
          
          <label className="mb-10 flex w-full max-w-2xl cursor-pointer items-center gap-4 rounded-xl border border-edge bg-surface p-4 transition-all hover:bg-bg">
            <input 
              type="checkbox" 
              checked={autoIntervene}
              onChange={(e) => setAutoIntervene(e.target.checked)}
              className="h-5 w-5 rounded accent-action"
            />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-ink">Enable Auto-Interventions (Smart Routing)</span>
              <span className="text-xs text-mute">Automatically detects failing hospitals and dispatches 14-day rescue packages from geographically closest hospitals with surplus stock.</span>
            </div>
          </label>

          <button 
             onClick={handleStart}
             className="rounded-lg bg-surface px-8 py-3 font-semibold text-ink border border-edge shadow-lg transition-all hover:bg-surface/90"
          >
            Start Simulation
          </button>
        </div>
      )}

      {!loading && <CommandMap hospitals={hospitals} selectedId={selectedId} activeDonorId={null} onSelect={setSelectedId} events={dayData?.events || []} />}

      {hasStarted && selectedHospital && (
        <div className="absolute right-4 top-4 bottom-24 z-[900] flex w-80 flex-col overflow-hidden rounded-xl border border-edge bg-surface/90 shadow-panel backdrop-blur transition-all">
          <div className="flex items-center justify-between border-b border-edge bg-bg/50 px-4 py-3">
             <div>
                <h3 className="text-sm font-semibold text-ink">{selectedHospital.name}</h3>
                <span className="text-xs text-mute">Historical Events</span>
             </div>
             <button onClick={() => setSelectedId(null)} className="text-mute hover:text-ink">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
             {historicalEvents.length === 0 ? (
                <p className="mt-4 text-center text-sm italic text-mute">No logistics events recorded yet.</p>
             ) : (
                historicalEvents.map((e, idx) => {
                   let msg = '';
                   let color = '';
                   let icon = null;
                   
                   if (e.type === 'spillover') {
                     const isSource = e.from_id === selectedHospital.id;
                     color = 'text-critical';
                     icon = <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-critical" />;
                     msg = isSource ? `OVERFLOW: Dumped ${e.patients} patients` : `CRISIS: Hit with ${e.patients} overflow patients`;
                   } else if (e.type === 'intervention') {
                     const isSource = e.from_id === selectedHospital.id;
                     color = 'text-action';
                     icon = <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-action" />;
                     msg = isSource ? `SMART ROUTE: Donated 14d ${e.medicine}` : `SMART ROUTE: Received 14d ${e.medicine}`;
                   } else if (e.type === 'delivery') {
                     color = 'text-healthy';
                     icon = <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-healthy" />;
                     msg = `RESTOCK: +${e.qty}d ${e.medicine} delivered`;
                   }
                   
                   return (
                     <div key={idx} className="flex items-start gap-3 text-sm">
                       {icon}
                       <div>
                         <div className="text-[10px] font-mono font-bold text-mute mb-0.5">DAY {e.day}</div>
                         <p className={`leading-snug font-medium ${color}`}>{msg}</p>
                       </div>
                     </div>
                   );
                })
             )}
          </div>
        </div>
      )}

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
             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink border border-edge shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            ) : (
              <svg className="h-5 w-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          
          <div className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-edge bg-bg px-1">
             <button onClick={() => setPlaybackSpeed(0.5)} className={`px-2 py-1 text-xs font-mono font-semibold rounded ${playbackSpeed === 0.5 ? 'bg-surface text-ink shadow' : 'text-mute hover:text-ink'}`}>0.5x</button>
             <button onClick={() => setPlaybackSpeed(1)} className={`px-2 py-1 text-xs font-mono font-semibold rounded ${playbackSpeed === 1 ? 'bg-surface text-ink shadow' : 'text-mute hover:text-ink'}`}>1x</button>
             <button onClick={() => setPlaybackSpeed(2)} className={`px-2 py-1 text-xs font-mono font-semibold rounded ${playbackSpeed === 2 ? 'bg-surface text-ink shadow' : 'text-mute hover:text-ink'}`}>2x</button>
          </div>
          
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
