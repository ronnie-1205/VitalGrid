import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet'
import { statusOf } from '../utils/status'

const CENTER = [13.42, 74.85]

export default function CommandMap({ hospitals, selectedId, activeDonorId, onSelect }) {
  const selectedHospital = hospitals.find(h => h.id === selectedId)
  const activeDonor = hospitals.find(h => h.id === activeDonorId)

  return (
    <MapContainer
      center={CENTER}
      zoom={10}
      zoomControl={true}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: '#0B0F14' }}
    >
      <TileLayer
        // Dark basemap so the status dots stay the loudest thing on screen.
        url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${import.meta.env.VITE_CARTO_API_KEY ? '?key=' + import.meta.env.VITE_CARTO_API_KEY : ''}`}
        subdomains="abcd"
        maxZoom={20}
      />

      {selectedHospital && activeDonor && (
        <Polyline 
          positions={[
            [activeDonor.lat, activeDonor.lng],
            [selectedHospital.lat, selectedHospital.lng]
          ]}
          pathOptions={{
            color: '#3b82f6', // Tailwind blue-500
            weight: 4,
            className: 'flow-line'
          }}
        />
      )}

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
                  fillColor: isActiveDonor ? '#3b82f6' : '#ffffff',
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
                color: isHighlighted ? '#ffffff' : s.color,
                fillColor: isActiveDonor ? '#3b82f6' : s.color,
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
