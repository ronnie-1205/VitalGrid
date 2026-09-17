export const STATUS = {
  healthy: { label: 'Stable', color: '#4A7C59', dim: 'rgba(74,124,89,0.18)' },
  warning: { label: 'At risk', color: '#D67D00', dim: 'rgba(214,125,0,0.18)' },
  critical: { label: 'Critical', color: '#C1121F', dim: 'rgba(193,18,31,0.18)' },
}

export function statusOf(status) {
  return STATUS[status] || STATUS.healthy
}
