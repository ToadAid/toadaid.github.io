/**
 * Receipt polling for submitted transactions.
 * Uses the independent public client — never the WalletConnect provider.
 *
 * On success returns the receipt.
 * On revert throws with the revert reason.
 * On timeout throws after maxWaitMs.
 */

const POLL_INTERVAL_MS = 2500
const DEFAULT_MAX_WAIT_MS = 3 * 60 * 1000 // 3 minutes

/**
 * Wait for a transaction receipt on Base using the read client.
 *
 * @param {import('viem').PublicClient} client
 * @param {string} txHash - hex transaction hash
 * @param {number} [maxWaitMs]
 * @returns {Promise<import('viem').TransactionReceipt>}
 */
export async function waitForReceipt(client, txHash, maxWaitMs = DEFAULT_MAX_WAIT_MS) {
  const start = Date.now()
  while (true) {
    const elapsed = Date.now() - start
    if (elapsed > maxWaitMs) {
      throw new Error(`Transaction ${txHash.slice(0, 10)}… not confirmed after ${Math.round(maxWaitMs / 1000)}s. Check the transaction on BaseScan.`)
    }
    let receipt = null
    try {
      receipt = await client.getTransactionReceipt({ hash: txHash })
    } catch {
      // Not yet mined — continue polling
    }
    if (receipt !== null) {
      if (receipt.status === 'reverted') {
        throw new Error(`Transaction ${txHash.slice(0, 10)}… was reverted on-chain.`)
      }
      return receipt
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
