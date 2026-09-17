import { statusOf } from '../utils/status';

export default function Header({
  hospitals,
  screen,
  onScreenChange,
  user,
  onLogout,
}) {
  const counts = hospitals.reduce(
    (acc, h) => ({
      ...acc,
      [h.status]: (acc[h.status] || 0) + 1,
    }),
    {},
  );

  return (
    <header className="flex items-center justify-between border-b border-edge bg-surface px-6 py-3">
      {/* Left side - Title */}
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-healthy" />

        <div>
          <h1 className="text-[15px] font-semibold leading-tight text-ink">
            Regional Supply Command
          </h1>

          <p className="text-xs text-mute">
            Udupi &amp; coastal Karnataka network
          </p>
        </div>
      </div>

      {/* Middle - Navigation */}
      <nav className="flex items-center gap-1 rounded-lg border border-edge bg-bg p-1">
        {[
          { id: 'command', label: 'Command Center' },
          { id: 'simulator', label: 'Cascade Simulator' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onScreenChange(tab.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              screen === tab.id
                ? 'bg-raised text-ink'
                : 'text-mute hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right side - Hospital status + User */}
      <div className="flex items-center gap-5">
        {/* Hospital status counts */}
        <div className="flex items-center gap-4 text-sm font-mono">
          {['healthy', 'warning', 'critical'].map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusOf(key).color }}
              />

              <span className="text-ink">
                {counts[key] || 0}
              </span>

              <span className="text-mute">
                {statusOf(key).label}
              </span>
            </div>
          ))}
        </div>

        {/* Logged-in user */}
        {user && (
          <div className="flex items-center gap-3 border-l border-edge pl-4">
            <span className="text-sm text-slate-300">
              {user.email}
            </span>

            <button
              onClick={onLogout}
              className="rounded px-3 py-1 text-sm bg-critical/80 hover:bg-critical transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}