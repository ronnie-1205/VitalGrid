import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { statusOf } from '../utils/status'

const CENTER = [13.42, 74.85]

export default function CommandMap({ hospitals, selectedId, onSelect }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={10}
      zoomControl={true}
      className="h-full w-full"
      style={{ background: '#0B0F14' }}
    >
      <TileLayer
        // Dark basemap so the status dots stay the loudest thing on screen.
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      {hospitals.map((h) => {
        const s = statusOf(h.status)
        const isSelected = h.id === selectedId
        return (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: s.color,
              fillColor: s.color,
              fillOpacity: h.status === 'critical' ? 0.9 : 0.75,
              weight: isSelected ? 3 : 1.5,
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
        )
      })}
    </MapContainer>
  )
}
