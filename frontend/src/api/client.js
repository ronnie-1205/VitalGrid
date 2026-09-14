// ─────────────────────────────────────────────────────────────────────────
// GAP(backend): this is the single seam where the real backend plugs in.
// Every function in api/hospitals.js and api/simulate.js is already written
// against this client, so wiring up a backend later means:
//   1. Stand up the endpoints listed in each file's comments.
//   2. Flip USE_MOCKS to false (or set VITE_USE_MOCKS=false in .env).
//   3. Set VITE_API_BASE_URL to wherever the API is served.
// No component code should need to change.
// ─────────────────────────────────────────────────────────────────────────

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Thin fetch wrapper. Throws on non-2xx so callers can catch() a single
 * error type instead of checking res.ok everywhere.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(`${options.method || 'GET'} ${path} failed: ${res.status}`, res.status, body)
  }

  if (res.status === 204) return null
  return res.json()
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Small helper so mock functions can simulate real network latency. */
export function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
