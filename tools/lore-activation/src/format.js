import { formatUnits } from 'viem'

export function shortAddress(address) {
  if (!address) return '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatToken(value, decimals = 18) {
  if (typeof value !== 'bigint') return '—'
  const formatted = formatUnits(value, decimals)
  const [whole, fraction = ''] = formatted.split('.')
  const compactFraction = fraction.slice(0, 6).replace(/0+$/, '')
  return compactFraction ? `${whole}.${compactFraction}` : whole
}

export function formatRaw(value) {
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return value ?? '—'
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
