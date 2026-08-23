/**
 * Receipt polling for submitted transactions.
 * Uses the independent Base public client, never WalletConnect.
 */

const POLL_INTERVAL_MS = 2500
const DEFAULT_MAX_WAIT_MS = 3 * 60 * 1000

function requireTransactionHash(txHash) {
  if (typeof txHash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    throw new TypeError('Wallet returned an invalid transaction hash')
  }
}

export function isReceiptNotFoundError(error) {
  return error?.name === 'TransactionReceiptNotFoundError'
}

export async function waitForReceipt(client, txHash, maxWaitMs = DEFAULT_MAX_WAIT_MS) {
  requireTransactionHash(txHash)
  const start = Date.now()

  while (true) {
    const elapsed = Date.now() - start
    if (elapsed > maxWaitMs) {
      throw new Error(`Transaction ${txHash.slice(0, 10)}… not confirmed after ${Math.round(maxWaitMs / 1000)}s. Check the transaction on BaseScan.`)
    }

    let receipt = null
    try {
      receipt = await client.getTransactionReceipt({ hash: txHash })
    } catch (error) {
      // Only Viem's explicit receipt-not-found condition is pollable.
      // Network, provider, authorization, malformed-response and other RPC
      // errors propagate immediately.
      if (!isReceiptNotFoundError(error)) throw error
    }

    if (receipt !== null) {
      if (receipt.status === 'reverted') {
        throw new Error(`Transaction ${txHash.slice(0, 10)}… was reverted on-chain.`)
      }
      if (receipt.status !== 'success') {
        throw new Error(`Transaction ${txHash.slice(0, 10)}… returned an unexpected receipt status.`)
      }
      return receipt
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
