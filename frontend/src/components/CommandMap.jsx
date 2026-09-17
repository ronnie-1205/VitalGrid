import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet'
import { statusOf } from '../utils/status'

const CENTER = [13.42, 74.85]

export default function CommandMap({ hospitals, selectedId, activeDonorId, onSelect, events = [] }) {
  const selectedHospital = hospitals.find(h => h.id === selectedId)
  const activeDonor = hospitals.find(h => h.id === activeDonorId)

  // Filter line events (spillovers and interventions)
  const lineEvents = events.filter(e => e.type === 'spillover' || e.type === 'intervention')

  return (
    <MapContainer
      center={CENTER}
      zoom={10}
      zoomControl={true}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: '#FDF0D5' }}
    >
      <TileLayer
        // Dark basemap so the status dots stay the loudest thing on screen.
        url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${import.meta.env.VITE_CARTO_API_KEY ? '?key=' + import.meta.env.VITE_CARTO_API_KEY : ''}`}
        subdomains="abcd"
        maxZoom={20}
      />

      {/* Manual Intervention UI line */}
      {selectedHospital && activeDonor && (
        <Polyline
          positions={[
            [activeDonor.lat, activeDonor.lng],
            [selectedHospital.lat, selectedHospital.lng]
          ]}
          pathOptions={{
            color: '#669BBC', // Tailwind blue-500
            weight: 4,
            className: 'flow-line'
          }}
        />
      )}

      {/* Simulation Line Events */}
      {lineEvents.map((e, idx) => {
        const fromHosp = hospitals.find(h => h.id === e.from_id);
        const toHosp = hospitals.find(h => h.id === e.to_id);
        if (!fromHosp || !toHosp) return null;

        const isSpillover = e.type === 'spillover';
        const color = isSpillover ? '#C1121F' : '#669BBC';
        const label = isSpillover ? `OVERFLOW: ${e.patients}` : `+${e.qty}d ${e.medicine} SENT`;
        const lineClass = isSpillover ? 'flow-line-critical' : 'flow-line-action';
        const dialogClass = isSpillover ? 'critical-event' : 'action-event';

        return (
          <React.Fragment key={`event-line-${idx}`}>
            <Polyline
              positions={[[fromHosp.lat, fromHosp.lng], [toHosp.lat, toHosp.lng]]}
              pathOptions={{
                color: color,
                weight: isSpillover ? 5 : 4,
                className: lineClass,
                opacity: 0.9
              }}
            />
            <CircleMarker 
              center={[fromHosp.lat, fromHosp.lng]} 
              radius={0} 
              opacity={0} 
              fillOpacity={0}
            >
              <Tooltip permanent direction="top" offset={[0, -25]} className="custom-tooltip-wrapper">
                <div className={`event-dialogue ${dialogClass}`}>
                  {label}
                </div>
              </Tooltip>
            </CircleMarker>
          </React.Fragment>
        )
      })}

      {hospitals.map((h) => {
        const s = statusOf(h.status)
        const isSelected = h.id === selectedId
        const isActiveDonor = h.id === activeDonorId
        const isHighlighted = isSelected || isActiveDonor
        

        
        return (
          <React.Fragment key={h.id}>
            {/* The white spotlight / halo effect behind the highlighted nodes */}
            {isHighlighted && (
              <CircleMarker
                center={[h.lat, h.lng]}
                radius={22}
                pathOptions={{
                  stroke: false,
                  fillColor: isActiveDonor ? '#669BBC' : '#FDF0D5',
                  fillOpacity: isActiveDonor ? 0.3 : 0.2,
                  className: 'animate-pulse'
                }}
              />
            )}
            
            {/* The primary hospital node */}
            <CircleMarker
              center={[h.lat, h.lng]}
              radius={isHighlighted ? 11 : 8}
              pathOptions={{
                color: isHighlighted ? '#FDF0D5' : s.color,
                fillColor: isActiveDonor ? '#669BBC' : s.color,
                fillOpacity: (h.status === 'critical' || isActiveDonor) ? 0.9 : 0.75,
                weight: isHighlighted ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => onSelect(h.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="font-sans text-xs">
                  <div className="font-semibold">{h.name}</div>
                  <div style={{ color: s.color }}>{s.label}</div>
                </div>
              </Tooltip>
            </CircleMarker>


          </React.Fragment>
        )
      })}
    </MapContainer>
  )
}
