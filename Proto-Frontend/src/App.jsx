import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandMap from './components/CommandMap';
import AlertSidebar from './components/AlertSidebar';
import InterventionPanel from './components/InterventionPanel';
import CascadeSimulator from './components/CascadeSimulator';
import { fetchHospitals, fetchAlerts } from './api/hospitals';
import Login from './components/Login';

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);

  // Existing command-center state
  const [screen, setScreen] = useState('command');
  const [hospitals, setHospitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login
  const handleLogin = (userData) => {
    // Later: Replace this with your API call to your backend database
    setUser(userData);
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
  };

  // Fetch hospital data
  useEffect(() => {
    Promise.all([fetchHospitals(), fetchAlerts()])
      .then(([h, a]) => {
        setHospitals(h);
        setAlerts(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedHospital =
    hospitals.find((h) => h.id === selectedId) || null;

  // Show Login screen if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Main dashboard
  return (
    <div className="flex h-screen flex-col">
      <Header
        hospitals={hospitals}
        screen={screen}
        onScreenChange={setScreen}
        user={user}
        onLogout={handleLogout}
      />

      {screen === 'command' && (
        <div className="relative flex flex-1 overflow-hidden">
          <div className="relative flex-1">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="font-mono text-sm text-mute">
                  Loading network…
                </p>
              </div>
            ) : (
              <CommandMap
                hospitals={hospitals}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}

            {selectedHospital && (
              <InterventionPanel
                hospital={selectedHospital}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>

          <AlertSidebar
            alerts={alerts}
            hospitals={hospitals}
            onSelect={setSelectedId}
          />
        </div>
      )}

      {screen === 'simulator' && <CascadeSimulator />}
    </div>
  );
}