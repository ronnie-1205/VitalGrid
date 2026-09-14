export const STATUS = {
  healthy: { label: 'Stable', color: '#34C77B', dim: 'rgba(52,199,123,0.18)' },
  warning: { label: 'At risk', color: '#E8A33D', dim: 'rgba(232,163,61,0.18)' },
  critical: { label: 'Critical', color: '#E5484D', dim: 'rgba(229,72,77,0.18)' },
}

export function statusOf(status) {
  return STATUS[status] || STATUS.healthy
}
