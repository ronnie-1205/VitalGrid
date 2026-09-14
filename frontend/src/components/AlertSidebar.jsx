import { statusOf } from '../utils/status'

export default function AlertSidebar({ alerts, hospitals, onSelect }) {
  const hospitalName = (id) => hospitals.find((h) => h.id === id)?.name || 'Unknown facility'

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-edge bg-surface">
      <div className="border-b border-edge px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Urgent alerts</h2>
        <p className="text-xs text-mute">{alerts.length} open across the network</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 && (
          <p className="px-4 py-6 text-sm text-mute">No open alerts right now.</p>
        )}

        {alerts.map((alert) => {
          const s = statusOf(alert.severity)
          return (
            <button
              key={alert.id}
              onClick={() => onSelect(alert.hospitalId)}
              className="block w-full border-b border-edge px-4 py-3 text-left transition-colors hover:bg-raised"
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                  style={{ background: s.dim, color: s.color }}
                >
                  {s.label}
                </span>
                <span className="font-mono text-[11px] text-mute">{alert.time}</span>
              </div>
              <p className="text-sm font-medium text-ink">{hospitalName(alert.hospitalId)}</p>
              <p className="text-sm text-mute">{alert.message}</p>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
