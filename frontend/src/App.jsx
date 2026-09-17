import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandMap from './components/CommandMap';
import AlertSidebar from './components/AlertSidebar';
import InterventionPanel from './components/InterventionPanel';
import CascadeSimulator from './components/CascadeSimulator';
import InventoryPage from './components/InventoryPage';
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
  const [activeDonorId, setActiveDonorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

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
  const refreshNetworkData = () => {
    return Promise.all([fetchHospitals(), fetchAlerts()])
      .then(([h, a]) => {
        setHospitals(h);
        setAlerts(a);
      });
  };

  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    // Wait for BOTH the data to fetch AND a minimum of 2 seconds so the splash screen feels deliberate
    Promise.all([
      refreshNetworkData(),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]).finally(() => {
      setFadeSplash(true); // Trigger fade out
      setTimeout(() => {
        setShowSplash(false); // Unmount after fade finishes
        setLoading(false);
      }, 500);
    });
  }, []);

  const selectedHospital =
    hospitals.find((h) => h.id === selectedId) || null;

  // Render the main app, with the splash screen as a fading overlay on top
  return (
    <>
      {showSplash && (
        <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-bg transition-opacity duration-500 ease-in-out ${fadeSplash ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col items-center space-y-8 animate-[fade-in_1s_ease-out]">
            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-black tracking-tighter text-ink drop-shadow-lg">
                Vital<span className="text-action">Grid</span>
              </h1>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                Predictive Healthcare Logistics
              </p>
            </div>
            
            <div className="h-1 w-64 overflow-hidden rounded-full bg-surface">
              <div className="h-full w-full bg-action animate-loading-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Show Login screen if user is not authenticated, otherwise show dashboard */}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
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
                activeDonorId={activeDonorId}
                onSelect={setSelectedId}
              />
            )}

            {selectedHospital && (
              <InterventionPanel
                hospital={selectedHospital}
                onClose={() => {
                  setSelectedId(null)
                  setActiveDonorId(null)
                }}
                onViewInventory={() => setScreen('inventory')}
                onApplied={refreshNetworkData}
                onDonorChange={setActiveDonorId}
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
      {screen === 'inventory' && <InventoryPage hospital={selectedHospital} onClose={() => setScreen('command')} />}
    </div>
    )}
    </>
  );
}