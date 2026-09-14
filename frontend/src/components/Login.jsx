import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary authentication
    // Replace with your backend authentication later.
    onLogin({
      email,
    });
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main login panel */}
      <div className="relative w-full max-w-md px-6">
        <div className="border border-edge bg-surface">
          
          {/* Header */}
          <div className="border-b border-edge px-7 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-healthy" />

              <span className="text-xs font-mono uppercase tracking-[0.18em] text-mute">
                Network Online
              </span>
            </div>

            <h1 className="text-xl font-semibold leading-tight text-ink">
              Regional Supply Command
            </h1>

            <p className="mt-1 text-xs text-mute">
              Udupi &amp; coastal Karnataka network
            </p>
          </div>

          {/* Login form */}
          <div className="px-7 py-7">
            <div className="mb-6">
              <p className="text-sm font-medium text-ink">
                Command Center Access
              </p>

              <p className="mt-1 text-xs text-mute">
                Authenticate to access the regional hospital network.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-mute">
                  Operator ID
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@network.local"
                  required
                  className="w-full border border-edge bg-bg px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-mute/60 focus:border-healthy"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-mono uppercase tracking-wider text-mute">
                  Access Key
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-edge bg-bg px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-mute/60 focus:border-healthy"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full border border-healthy bg-healthy/10 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-healthy/20"
              >
                Enter Command Center
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-edge px-7 py-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-mute">
              <span>Secure Access</span>
              <span>Regional Network</span>
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-wider text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-healthy" />
          Command infrastructure operational
        </div>
      </div>
    </div>
  );
}