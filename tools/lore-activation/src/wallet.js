import EthereumProvider from '@walletconnect/ethereum-provider'
import { createPublicClient, custom } from 'viem'
import { base } from 'viem/chains'
import { BASE_CHAIN_ID } from './contracts.js'
import { WALLETCONNECT_OPTIONAL_EVENTS, WALLETCONNECT_OPTIONAL_METHODS } from './wallet-policy.js'

export const walletConnectProjectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '').trim()

const metadata = Object.freeze({
  name: 'ToadAid Lore Activation Helper',
  description: 'Tangem / WalletConnect compatibility preflight for Tobyworld Lore activation',
  url: 'https://toadaid.github.io/lore-activation/',
  icons: ['https://toadaid.github.io/TOADAID-logo.png'],
})

export async function connectWallet() {
  if (!walletConnectProjectId) throw new Error('WalletConnect configuration pending')
  const provider = await EthereumProvider.init({
    projectId: walletConnectProjectId,
    optionalChains: [BASE_CHAIN_ID],
    optionalMethods: WALLETCONNECT_OPTIONAL_METHODS,
    optionalEvents: WALLETCONNECT_OPTIONAL_EVENTS,
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
  const client = createPublicClient({ chain: base, transport: custom(provider) })
  return { provider, client, account, chainId }
}

export async function disconnectWallet(provider) {
  if (provider) await provider.disconnect()
}
