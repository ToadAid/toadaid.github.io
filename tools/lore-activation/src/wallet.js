import EthereumProvider from '@walletconnect/ethereum-provider'
import { createPublicClient, custom } from 'viem'
import { base } from 'viem/chains'
import { BASE_CHAIN_ID } from './contracts.js'

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
    showQrModal: true,
    metadata,
  })
  await provider.connect()
  const client = createPublicClient({ chain: base, transport: custom(provider) })
  const chainId = await client.getChainId()
  const account = provider.accounts[0]
  if (!account) {
    await provider.disconnect()
    throw new Error('WalletConnect returned no account')
  }
  return { provider, client, account, chainId }
}

export async function disconnectWallet(provider) {
  if (provider) await provider.disconnect()
}
