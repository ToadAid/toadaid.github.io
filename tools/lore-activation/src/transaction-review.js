import { CONTRACTS } from './contracts.js'

function requireUint(name, value) {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new TypeError(`${name} must be a non-negative bigint`)
  }
}

/**
 * Build a human-readable transaction review snapshot from freshly-read state.
 * Used to populate the UI review grid before each wallet prompt.
 *
 * This function does not encode calldata or construct transactions.
 * Targets and spenders are derived exclusively from CONTRACTS constants.
 *
 * @returns {Readonly<ReviewSnapshot>}
 */
export function buildTransactionReview({
  tokenId,
  activationYCost,
  activationXAmount,
  patienceAllowance,
  tobyAllowance,
}) {
  requireUint('tokenId', tokenId)
  requireUint('activationYCost', activationYCost)
  requireUint('activationXAmount', activationXAmount)
  requireUint('patienceAllowance', patienceAllowance)
  requireUint('tobyAllowance', tobyAllowance)

  if (tokenId === 0n) throw new RangeError('Lore Land token ID 0 does not exist')

  const review = {
    loreApprovalRequired: false,
    patience: {
      token: CONTRACTS.patience,
      spender: CONTRACTS.vault,
      exactAmount: activationYCost,
      currentAllowance: patienceAllowance,
      allowanceSufficient: patienceAllowance >= activationYCost,
    },
    toby: {
      token: CONTRACTS.toby,
      spender: CONTRACTS.manager,
      exactAmount: activationXAmount,
      currentAllowance: tobyAllowance,
      allowanceSufficient: tobyAllowance >= activationXAmount,
    },
    activation: {
      target: CONTRACTS.manager,
      tokenId,
      maxYIn: activationYCost,
      expectedXAmount: activationXAmount,
      deadline: null, // Set immediately before signing
    },
  }

  Object.freeze(review.patience)
  Object.freeze(review.toby)
  Object.freeze(review.activation)
  return Object.freeze(review)
}
