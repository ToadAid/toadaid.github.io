// Narrow WalletConnect session: one required method for transactions,
// no signing, no chain switching, no batch calls.
// All reads remain on the independent public client.
export const WALLETCONNECT_REQUIRED_METHODS = Object.freeze([
  'eth_sendTransaction',
])

export const WALLETCONNECT_OPTIONAL_METHODS = Object.freeze([])

export const WALLETCONNECT_OPTIONAL_EVENTS = Object.freeze([
  'accountsChanged',
  'chainChanged',
])
