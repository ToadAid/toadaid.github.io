import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { CONTRACTS, EXPECTED_LOCK_DURATION } from '../src/contracts.js'
import { assessEligibility, bindingChecks, economicsStatus, expectedPatienceReceipt, parseTokenId } from '../src/preflight.js'

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

test('reviewed PATIENCE economics preserves exact bigint receipt arithmetic', () => {
  const gross = 900719925474099312345678901234567890n
  assert.equal(expectedPatienceReceipt(gross, 1n, 0n), gross * 99n / 100n)
  assert.equal(typeof expectedPatienceReceipt(gross, 1n, 0n), 'bigint')
})

test('unsafe browser token IDs are rejected before contract reads', () => {
  assert.equal(parseTokenId('9007199254740992').ok, false)
  assert.deepEqual(parseTokenId('777'), { ok: true, value: 777n })
})

test('production source contains no transaction invocation surface', async () => {
  const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src')
  const files = (await readdir(directory)).filter(file => file.endsWith('.js'))
  const source = (await Promise.all(files.map(file => readFile(path.join(directory, file), 'utf8')))).join('\n')
  const forbidden = [
    /eth_sendTransaction/,
    /wallet_sendCalls/,
    /writeContract\s*\(/,
    /sendTransaction\s*\(/,
    /collectActivationY\s*\(/,
    /\bactivate\s*\(/,
    /setApprovalForAll\s*\(/,
    /safeTransferFrom\s*\(/,
  ]
  for (const pattern of forbidden) assert.doesNotMatch(source, pattern)
})
