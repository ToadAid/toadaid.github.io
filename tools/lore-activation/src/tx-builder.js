/**
 * Fixed transaction builder for Lore Activation.
 *
 * Accepts no arbitrary target, ABI, function name, or calldata.
 * Every transaction derives its `to`, selector, and arguments from:
 *   - Fixed reviewed protocol constants (CONTRACTS)
 *   - Freshly-read on-chain state passed as typed arguments
 *
 * The only three transactions this module can produce:
 *   1. PATIENCE.approve(ActivationVault, exactAmount)
 *   2. TOBY.approve(ActivationManager, exactAmount)
 *   3. ActivationManager.activate(tokenId, maxYIn, expectedXAmount, deadline)
 */

import { encodeFunctionData } from 'viem'
import { patienceAbi, tobyAbi, activationManagerAbi } from './abi.js'
import { CONTRACTS } from './contracts.js'

function requirePositiveUint(name, value) {
  if (typeof value !== 'bigint' || value <= 0n) {
    throw new TypeError(`${name} must be a positive bigint`)
  }
}

function requireNonNegativeUint(name, value) {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new TypeError(`${name} must be a non-negative bigint`)
  }
}

const MAX_UINT256 = 2n ** 256n - 1n

/**
 * Build a PATIENCE approve transaction.
 * Spender is always ActivationVault. Amount is the exact freshly-read activationYCost.
 * Never unlimited — amount must be exactly the current cost, never MaxUint256.
 *
 * @param {bigint} exactAmount - exact activationYCost() freshly read from chain
 * @returns {{ to: string, data: string, value: string }}
 */
export function buildPatienceApprove(exactAmount) {
  requirePositiveUint('exactAmount', exactAmount)
  if (exactAmount === MAX_UINT256) throw new RangeError('exactAmount must not be MaxUint256')
  const data = encodeFunctionData({
    abi: patienceAbi,
    functionName: 'approve',
    args: [CONTRACTS.vault, exactAmount],
  })
  return Object.freeze({ to: CONTRACTS.patience, data, value: '0x0' })
}

/**
 * Build a TOBY approve transaction.
 * Spender is always ActivationManager. Amount is the exact freshly-read activationXAmount.
 * Never unlimited — amount must be exactly the current cost, never MaxUint256.
 *
 * @param {bigint} exactAmount - exact activationXAmount() freshly read from chain
 * @returns {{ to: string, data: string, value: string }}
 */
export function buildTobyApprove(exactAmount) {
  requirePositiveUint('exactAmount', exactAmount)
  if (exactAmount === MAX_UINT256) throw new RangeError('exactAmount must not be MaxUint256')
  const data = encodeFunctionData({
    abi: tobyAbi,
    functionName: 'approve',
    args: [CONTRACTS.manager, exactAmount],
  })
  return Object.freeze({ to: CONTRACTS.toby, data, value: '0x0' })
}

/**
 * Build an activate transaction.
 * Target is always ActivationManager. All arguments are freshly-read state.
 * Deadline must be finite (non-zero, non-MaxUint256).
 *
 * @param {bigint} tokenId
 * @param {bigint} maxYIn - exact activationYCost() freshly read from chain
 * @param {bigint} expectedXAmount - exact activationXAmount() freshly read from chain
 * @param {bigint} deadline - block timestamp + DEADLINE_WINDOW_SECONDS
 * @returns {{ to: string, data: string, value: string }}
 */
export function buildActivate(tokenId, maxYIn, expectedXAmount, deadline) {
  requirePositiveUint('tokenId', tokenId)
  requirePositiveUint('maxYIn', maxYIn)
  requireNonNegativeUint('expectedXAmount', expectedXAmount)
  requirePositiveUint('deadline', deadline)
  // Reject obviously wrong deadlines (uint256 max = unlimited = forbidden)
  if (deadline === MAX_UINT256) throw new RangeError('deadline must not be MaxUint256')
  const data = encodeFunctionData({
    abi: activationManagerAbi,
    functionName: 'activate',
    args: [tokenId, maxYIn, expectedXAmount, deadline],
  })
  return Object.freeze({ to: CONTRACTS.manager, data, value: '0x0' })
}
