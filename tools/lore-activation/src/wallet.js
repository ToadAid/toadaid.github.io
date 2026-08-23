import EthereumProvider from '@walletconnect/ethereum-provider'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { BASE_CHAIN_ID } from './contracts.js'
import {
  WALLETCONNECT_OPTIONAL_EVENTS,
  WALLETCONNECT_OPTIONAL_METHODS,
  WALLETCONNECT_REQUIRED_METHODS,
} from './wallet-policy.js'

export const walletConnectProjectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '').trim()

// Production read endpoint — domain-restricted credential intended for browser exposure.
// Falls back to public endpoint for local dev when VITE_BASE_RPC_URL is unset.
export const BASE_READ_RPC_URL = (import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org').trim()

const metadata = Object.freeze({
  name: 'ToadAid Lore Activation',
  description: 'Tangem / WalletConnect Lore Activation for Tobyworld',
  url: 'https://toadaid.github.io/lore-activation/',
  icons: ['https://toadaid.github.io/TOADAID-logo.png'],
})

export async function connectWallet() {
  if (!walletConnectProjectId) throw new Error('WalletConnect configuration pending')
  const provider = await EthereumProvider.init({
    projectId: walletConnectProjectId,
    chains: [BASE_CHAIN_ID],
    optionalChains: [BASE_CHAIN_ID],
    methods: [...WALLETCONNECT_REQUIRED_METHODS],
    optionalMethods: [...WALLETCONNECT_OPTIONAL_METHODS],
    optionalEvents: [...WALLETCONNECT_OPTIONAL_EVENTS],
    showQrModal: true,
    metadata,
  })
  await provider.connect()
  const chainId = Number(provider.chainId)
  const account = provider.accounts[0]
  if (!Number.isInteger(chainId)) {
    await provider.disconnect()
    throw new Error('WalletConnect returned no valid chain ID')
  }
  if (!account) {
    await provider.disconnect()
    throw new Error('WalletConnect returned no account')
  }
  // All contract reads use a fixed independent Base RPC transport.
  // WalletConnect is used only for wallet identity and eth_sendTransaction requests.
  const client = createPublicClient({ chain: base, transport: http(BASE_READ_RPC_URL) })
  return { provider, client, account, chainId }
}

export async function disconnectWallet(provider) {
  if (provider) await provider.disconnect()
}
