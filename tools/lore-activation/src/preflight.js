import { isAddressEqual } from 'viem'
import {
  BASE_CHAIN_ID,
  CONTRACTS,
  EXPECTED_ERC20_DECIMALS,
  EXPECTED_LOCK_DURATION,
  EXPECTED_MANAGER_TOKEN_X_DECIMALS,
} from './contracts.js'

export const MAX_SAFE_TOKEN_ID = BigInt(Number.MAX_SAFE_INTEGER)

export function parseTokenId(raw) {
  const value = String(raw).trim()
  if (!value) return { ok: false, error: 'Enter a Lore Land token ID.' }
  if (!/^\d+$/.test(value)) return { ok: false, error: 'Token ID must be a non-negative whole number.' }
  const tokenId = BigInt(value)
  if (tokenId === 0n) return { ok: false, error: 'Lore Land token ID 0 does not exist.' }
  if (tokenId > MAX_SAFE_TOKEN_ID) return { ok: false, error: 'Token ID exceeds the safe browser integer range.' }
  return { ok: true, value: tokenId }
}

export function bindingChecks(live) {
  return [
    check('Base chain', live.chainId, BASE_CHAIN_ID),
    addressCheck('Manager.nft2()', live.managerNft2, CONTRACTS.lore),
    addressCheck('Manager.tokenX()', live.managerTokenX, CONTRACTS.toby),
    addressCheck('Manager.vault()', live.managerVault, CONTRACTS.vault),
    check('Manager.tokenXDecimals()', live.tokenXDecimals, EXPECTED_MANAGER_TOKEN_X_DECIMALS),
    check('Manager.LOCK_DURATION()', live.lockDuration, EXPECTED_LOCK_DURATION),
    addressCheck('Vault.tokenY()', live.vaultTokenY, CONTRACTS.patience),
    check('PATIENCE.decimals()', live.patienceDecimals, EXPECTED_ERC20_DECIMALS),
    check('TOBY.decimals()', live.tobyDecimals, EXPECTED_ERC20_DECIMALS),
    check('Vault depositor role for Manager', live.managerHasDepositorRole, true),
  ]
}

export function economicsStatus(txFee, burnFee) {
  const reviewed = txFee === 1n && burnFee === 0n
  return {
    reviewed,
    label: reviewed ? 'Reviewed launch configuration matches' : 'PATIENCE ECONOMIC CONFIG DRIFT — REVIEW REQUIRED',
  }
}

export function expectedPatienceReceipt(gross, txFee, burnFee, payer, feeAddress) {
  if (!economicsStatus(txFee, burnFee).reviewed) return null
  if (payer && feeAddress && isAddressEqual(payer, feeAddress)) return gross
  return gross - (gross / 100n)
}

export function assessEligibility({
  checks,
  wallet,
  owner,
  isActive,
  protocolCustody,
  activationStarted,
  pauseStatus,
  economicsReviewed,
  patienceBalance,
  activationYCost,
  tobyBalance,
  activationXAmount,
}) {
  const reasons = []
  for (const item of checks) if (!item.pass) reasons.push(`${item.label} mismatch`)
  if (!wallet || !owner || !isAddressEqual(wallet, owner)) reasons.push('Connected wallet is not the NFT owner')
  if (isActive) reasons.push('Lore Land is already active')
  if (protocolCustody) reasons.push('Connected wallet is in protocol custody')
  if (!activationStarted) reasons.push('Activation has not started')
  if (pauseStatus === 'paused') reasons.push('Activation operation is paused')
  else if (pauseStatus !== 'clear') reasons.push('Activation pause status is unresolved')
  if (!economicsReviewed) reasons.push('PATIENCE economic configuration requires review')
  if (
    typeof patienceBalance !== 'bigint'
    || typeof activationYCost !== 'bigint'
    || patienceBalance < activationYCost
  ) reasons.push('Insufficient PATIENCE balance')
  if (
    typeof tobyBalance !== 'bigint'
    || typeof activationXAmount !== 'bigint'
    || tobyBalance < activationXAmount
  ) reasons.push('Insufficient TOBY balance')
  return { eligible: reasons.length === 0, reasons }
}

function check(label, live, expected) {
  return { label, live, expected, pass: live === expected }
}

function addressCheck(label, live, expected) {
  let pass = false
  try {
    pass = isAddressEqual(live, expected)
  } catch {
    pass = false
  }
  return { label, live, expected, pass }
}
