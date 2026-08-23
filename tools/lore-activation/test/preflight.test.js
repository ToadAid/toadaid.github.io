import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { CONTRACTS, EXPECTED_LOCK_DURATION } from '../src/contracts.js'
import { assessEligibility, bindingChecks, economicsStatus, expectedPatienceReceipt, parseTokenId } from '../src/preflight.js'
import { buildTransactionReview } from '../src/transaction-review.js'
import { WALLETCONNECT_OPTIONAL_EVENTS, WALLETCONNECT_OPTIONAL_METHODS } from '../src/wallet-policy.js'

const wallet = '0x1111111111111111111111111111111111111111'
const other = '0x2222222222222222222222222222222222222222'

function validLive(overrides = {}) {
  return {
    chainId: 8453,
    managerNft2: CONTRACTS.lore,
    managerTokenX: CONTRACTS.toby,
    managerVault: CONTRACTS.vault,
    tokenXDecimals: 18,
    lockDuration: EXPECTED_LOCK_DURATION,
    vaultTokenY: CONTRACTS.patience,
    patienceDecimals: 18,
    tobyDecimals: 18,
    managerHasDepositorRole: true,
    ...overrides,
  }
}

function eligibleInput(overrides = {}) {
  return {
    checks: bindingChecks(validLive()),
    wallet,
    owner: wallet,
    isActive: false,
    protocolCustody: false,
    activationStarted: true,
    pauseStatus: 'clear',
    economicsReviewed: true,
    patienceBalance: 100n,
    activationYCost: 37n,
    tobyBalance: 5_000_000_000n,
    activationXAmount: 4_000_000_000n,
    ...overrides,
  }
}

for (const [name, override] of [
  ['wrong chain', { chainId: 1 }],
  ['wrong Manager.nft2', { managerNft2: other }],
  ['wrong Manager.tokenX', { managerTokenX: other }],
  ['wrong Manager.vault', { managerVault: other }],
  ['wrong Vault.tokenY', { vaultTokenY: other }],
  ['wrong Token X decimals', { tokenXDecimals: 6 }],
  ['wrong PATIENCE decimals', { patienceDecimals: 9 }],
  ['Manager lacking DEPOSITOR_ROLE', { managerHasDepositorRole: false }],
]) {
  test(`${name} refuses eligibility`, () => {
    const result = assessEligibility(eligibleInput({ checks: bindingChecks(validLive(override)) }))
    assert.equal(result.eligible, false)
  })
}

test('wallet that is not NFT owner refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ owner: other })).eligible, false)
})

test('already-active token refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ isActive: true })).eligible, false)
})

test('protocol-custody wallet refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ protocolCustody: true })).eligible, false)
})

test('activation not started refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ activationStarted: false })).eligible, false)
})

test('unresolved pause verification refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ pauseStatus: 'pending' })).eligible, false)
})

test('live activation pause refuses eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ pauseStatus: 'paused' })).eligible, false)
})

test('PATIENCE fee drift refuses reviewed economics', () => {
  assert.equal(economicsStatus(2n, 0n).reviewed, false)
  assert.equal(expectedPatienceReceipt(1000n, 2n, 0n), null)
})

test('reviewed PATIENCE receipt mirrors exact integer fee arithmetic', () => {
  assert.equal(expectedPatienceReceipt(101n, 1n, 0n, wallet, other), 100n)
})

test('reviewed PATIENCE FeeAddress payer receives the sender exemption', () => {
  assert.equal(expectedPatienceReceipt(101n, 1n, 0n, wallet, wallet), 101n)
})

test('reviewed PATIENCE economics preserves exact large-bigint receipt arithmetic', () => {
  const gross = 900719925474099312345678901234567890n
  const expected = gross - (gross / 100n)
  assert.equal(expectedPatienceReceipt(gross, 1n, 0n, wallet, other), expected)
  assert.equal(typeof expectedPatienceReceipt(gross, 1n, 0n, wallet, other), 'bigint')
})

test('token ID zero and unsafe browser token IDs are rejected before contract reads', () => {
  assert.equal(parseTokenId('0').ok, false)
  assert.equal(parseTokenId('9007199254740992').ok, false)
  assert.deepEqual(parseTokenId('777'), { ok: true, value: 777n })
})

test('insufficient live funding refuses activation eligibility', () => {
  assert.equal(assessEligibility(eligibleInput({ patienceBalance: 36n })).eligible, false)
  assert.equal(assessEligibility(eligibleInput({ tobyBalance: 3_999_999_999n })).eligible, false)
})

test('WalletConnect session permission envelope is explicitly read-only', () => {
  assert.deepEqual([...WALLETCONNECT_OPTIONAL_METHODS], ['eth_call'])
  assert.deepEqual([...WALLETCONNECT_OPTIONAL_EVENTS], ['accountsChanged', 'chainChanged'])
})

test('transaction review is exact, fixed-target, and non-executable', () => {
  const review = buildTransactionReview({
    tokenId: 777n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 10n,
    tobyAllowance: 5_000_000_000n,
  })

  assert.equal(review.executable, false)
  assert.equal(review.calldataPresent, false)
  assert.equal(review.signingPresent, false)
  assert.equal(review.loreApprovalRequired, false)
  assert.equal(review.patience.token, CONTRACTS.patience)
  assert.equal(review.patience.spender, CONTRACTS.vault)
  assert.equal(review.patience.exactAmount, 37n)
  assert.equal(review.patience.allowanceSufficient, false)
  assert.equal(review.toby.token, CONTRACTS.toby)
  assert.equal(review.toby.spender, CONTRACTS.manager)
  assert.equal(review.toby.exactAmount, 4_000_000_000n)
  assert.equal(review.toby.allowanceSufficient, true)
  assert.equal(review.activation.target, CONTRACTS.manager)
  assert.equal(review.activation.tokenId, 777n)
  assert.equal(review.activation.maxYIn, 37n)
  assert.equal(review.activation.expectedXAmount, 4_000_000_000n)
  assert.equal(review.activation.deadline, null)
  assert.equal(Object.isFrozen(review), true)
})

test('transaction review UI refreshes mutable protocol state before reading the Lore Land', async () => {
  const mainPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/main.js')
  const source = await readFile(mainPath, 'utf8')

  const clearIndex = source.indexOf("resetTransactionReview('Refreshing mutable protocol values before transaction review…')")
  const refreshIndex = source.indexOf('const liveFresh = await loadLiveProtocol()', clearIndex)
  const landReadIndex = source.indexOf("const nft = (name)", refreshIndex)

  assert.ok(clearIndex >= 0)
  assert.ok(refreshIndex > clearIndex)
  assert.ok(landReadIndex > refreshIndex)
  assert.match(source, /return true[\s\S]*catch \(error\)[\s\S]*return false/)
})

test('in-flight review reads fail closed when the wallet connection changes', async () => {
  const mainPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/main.js')
  const source = await readFile(mainPath, 'utf8')

  assert.match(source, /connectionVersion:\s*0/)
  assert.match(source, /state\.connectionVersion \+= 1/)
  assert.match(source, /Wallet connection changed during live verification\./)
  assert.match(source, /Wallet connection changed during Lore Land verification\./)
  assert.match(source, /state\.provider\.on\('accountsChanged', resetConnection\)/)
  assert.match(source, /state\.provider\.on\('chainChanged', resetConnection\)/)
})

test('transaction review rejects token ID zero and malformed numeric inputs', () => {
  assert.throws(() => buildTransactionReview({
    tokenId: 0n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 0n,
    tobyAllowance: 0n,
  }))

  assert.throws(() => buildTransactionReview({
    tokenId: 1n,
    activationYCost: -1n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 0n,
    tobyAllowance: 0n,
  }))
})

test('production source contains no transaction invocation surface', async () => {
  const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src')
  const files = (await readdir(directory)).filter(file => file.endsWith('.js'))
  const source = (await Promise.all(files.map(file => readFile(path.join(directory, file), 'utf8')))).join('\n')
  const forbidden = [
    /eth_sendTransaction/,
    /eth_sendRawTransaction/,
    /wallet_sendCalls/,
    /personal_sign/,
    /eth_sign(?:Transaction|TypedData(?:_v3|_v4)?)?/,
    /wallet_switchEthereumChain/,
    /wallet_addEthereumChain/,
    /encodeFunctionData\s*\(/,
    /prepareTransactionRequest\s*\(/,
    /signTransaction\s*\(/,
    /writeContract\s*\(/,
    /sendTransaction\s*\(/,
    /collectActivationY\s*\(/,
    /\bactivate\s*\(/,
    /\bapprove\s*\(/,
    /\btransferFrom\s*\(/,
    /\bcreateAccount\s*\(/,
    /setApprovalForAll\s*\(/,
    /safeTransferFrom\s*\(/,
  ]
  for (const pattern of forbidden) assert.doesNotMatch(source, pattern)
})
