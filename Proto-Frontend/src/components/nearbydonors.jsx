import { useEffect, useState } from 'react'
import { fetchNearbyDonors } from '../api/hospitals'

export default function NearbyDonorsList({ hospitalId, item = 'oxygen' }) {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hospitalId) return
    setLoading(true)
    fetchNearbyDonors(hospitalId, item)
      .then(setDonors)
      .finally(() => setLoading(false))
  }, [hospitalId, item])

  return (
    <section>
      <h3 className="mb-2 text-xs font-medium text-mute">
        Nearby healthy facilities ({item.replace('_', ' ')})
      </h3>
      {loading && <p className="text-sm text-mute">Scanning network…</p>}
      {!loading && donors.length === 0 && (
        <p className="text-sm text-mute">No healthy facilities found nearby.</p>
      )}
      {!loading && donors.length > 0 && (
        <ul className="space-y-1.5">
          {donors.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-md border border-edge bg-bg px-3 py-2 text-sm"
            >
              <span className="text-ink">{d.name}</span>
              <span className="font-mono text-xs text-mute">
                {d.distanceKm}km · surplus {d.surplus}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}