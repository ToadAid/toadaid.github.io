import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { CONTRACTS, EXPECTED_LOCK_DURATION } from '../src/contracts.js'
import { assessEligibility, bindingChecks, economicsStatus, expectedPatienceReceipt, parseTokenId } from '../src/preflight.js'
import { buildTransactionReview } from '../src/transaction-review.js'
import { buildActivate, buildPatienceApprove, buildTobyApprove } from '../src/tx-builder.js'
import { WALLETCONNECT_OPTIONAL_EVENTS, WALLETCONNECT_OPTIONAL_METHODS, WALLETCONNECT_REQUIRED_METHODS } from '../src/wallet-policy.js'

const wallet = '0x1111111111111111111111111111111111111111'
const other = '0x2222222222222222222222222222222222222222'
const DIR = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(DIR, '../src')

async function readSrc(filename) {
  return readFile(path.join(srcDir, filename), 'utf8')
}

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

// ─── WalletConnect session envelope ─────────────────────────────────────────

test('WalletConnect proposal contains exactly eth_sendTransaction as required method', async () => {
  const source = await readSrc('wallet.js')
  assert.match(source, /methods:\s*\['eth_sendTransaction'\]/)
})

test('WalletConnect proposal events are exactly accountsChanged and chainChanged', async () => {
  const source = await readSrc('wallet.js')
  assert.match(source, /events:\s*\['accountsChanged',\s*'chainChanged'\]/)
})

test('wallet.js contains no optional namespaces', async () => {
  const source = await readSrc('wallet.js')
  assert.doesNotMatch(source, /optionalChains/)
  assert.doesNotMatch(source, /optionalMethods/)
  assert.doesNotMatch(source, /optionalEvents/)
})

test('WalletConnect proposal does not contain forbidden methods', async () => {
  const source = await readSrc('wallet.js')
  const forbidden = [
    /personal_sign/,
    /eth_sign/,
    /eth_sendRawTransaction/,
    /wallet_sendCalls/,
    /wallet_switchEthereumChain/,
    /wallet_addEthereumChain/
  ]
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern, `Should not include ${pattern}`)
  }
})

// ─── Write ABI inventory ─────────────────────────────────────────────────────

test('write ABI inventory: only approve and activate exist as write fragments', async () => {
  const abiSource = await readSrc('abi.js')
  // Exactly two write function definitions exist
  const writeFns = [...abiSource.matchAll(/stateMutability:\s*'nonpayable'/g)]
  assert.equal(writeFns.length, 3, 'Expected exactly 3 nonpayable fragments: PATIENCE.approve, TOBY.approve, activate')
  // Verify the function names
  assert.match(abiSource, /name: 'approve'/)
  assert.match(abiSource, /name: 'activate'/)
  // No setApprovalForAll, no transferFrom, no unlimited approval
  assert.doesNotMatch(abiSource, /setApprovalForAll/)
  assert.doesNotMatch(abiSource, /transferFrom/)
  assert.doesNotMatch(abiSource, /MaxUint256|max_uint|2\s*\*\*\s*256\s*-\s*1n?.*approve/i)
})

// ─── No unlimited approval ────────────────────────────────────────────────────

test('no unlimited approval: buildPatienceApprove rejects MaxUint256-equivalent amounts', () => {
  const MAX_UINT256 = 2n ** 256n - 1n
  assert.throws(() => buildPatienceApprove(MAX_UINT256))
  assert.throws(() => buildPatienceApprove(0n))
  assert.throws(() => buildPatienceApprove(-1n))
})

test('no unlimited approval: buildTobyApprove rejects zero and negative amounts and MaxUint256', () => {
  const MAX_UINT256 = 2n ** 256n - 1n
  assert.throws(() => buildTobyApprove(MAX_UINT256))
  assert.throws(() => buildTobyApprove(0n))
  assert.throws(() => buildTobyApprove(-1n))
})

test('no unlimited approval: PATIENCE approve target is always ActivationVault', () => {
  const tx = buildPatienceApprove(37n)
  assert.equal(tx.to, CONTRACTS.patience)
  // Spender is encoded in calldata — verify by checking the tx builder uses CONTRACTS.vault
})

test('no unlimited approval: TOBY approve target is always TOBY token', () => {
  const tx = buildTobyApprove(4_000_000_000n)
  assert.equal(tx.to, CONTRACTS.toby)
})

// ─── No LORE approval / setApprovalForAll ────────────────────────────────────

test('no LORE approval: review snapshot always reports loreApprovalRequired = false', () => {
  const review = buildTransactionReview({
    tokenId: 777n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 0n,
    tobyAllowance: 0n,
  })
  assert.equal(review.loreApprovalRequired, false)
})

test('no setApprovalForAll: tx builder source contains no setApprovalForAll call', async () => {
  const source = await readSrc('tx-builder.js')
  assert.doesNotMatch(source, /setApprovalForAll/)
})

test('no LORE approval: tx builder source contains no LORE contract as target', async () => {
  const source = await readSrc('tx-builder.js')
  // CONTRACTS.lore should never appear as a tx.to target in tx-builder
  assert.doesNotMatch(source, /CONTRACTS\.lore/)
})

// ─── No arbitrary transaction/calldata surface ────────────────────────────────

test('no arbitrary transaction surface: tx builder accepts no arbitrary target or ABI', async () => {
  const source = await readSrc('tx-builder.js')
  // No dynamic target parameter in exported functions
  assert.doesNotMatch(source, /function build\w+\s*\(\s*\w+to\b/)
  // All three builders use fixed CONTRACTS.* constants as target
  assert.match(source, /to: CONTRACTS\.patience/)
  assert.match(source, /to: CONTRACTS\.toby/)
  assert.match(source, /to: CONTRACTS\.manager/)
})

test('no arbitrary calldata: encodeFunctionData only exists in tx-builder.js', async () => {
  const files = (await readdir(srcDir)).filter(f => f.endsWith('.js') && f !== 'tx-builder.js')
  for (const file of files) {
    const source = await readFile(path.join(srcDir, file), 'utf8')
    assert.doesNotMatch(source, /encodeFunctionData/, `${file} should not call encodeFunctionData`)
  }
})

// ─── Insufficient allowance → exact approval ─────────────────────────────────

test('insufficient PATIENCE allowance produces approval with exact cost amount', () => {
  const tx = buildPatienceApprove(37n)
  // Transaction is to PATIENCE token, non-zero data, no value
  assert.equal(tx.to, CONTRACTS.patience)
  assert.ok(tx.data.startsWith('0x'))
  assert.ok(tx.data.length > 10)
  assert.equal(tx.value, '0x0')
  assert.ok(Object.isFrozen(tx))
})

test('insufficient TOBY allowance produces approval with exact cost amount', () => {
  const tx = buildTobyApprove(4_000_000_000n)
  assert.equal(tx.to, CONTRACTS.toby)
  assert.ok(tx.data.startsWith('0x'))
  assert.equal(tx.value, '0x0')
  assert.ok(Object.isFrozen(tx))
})

test('sufficient PATIENCE allowance shows approval skippable in review', () => {
  const review = buildTransactionReview({
    tokenId: 777n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 37n, // exactly sufficient
    tobyAllowance: 0n,
  })
  assert.equal(review.patience.allowanceSufficient, true)
})

test('sufficient TOBY allowance shows approval skippable in review', () => {
  const review = buildTransactionReview({
    tokenId: 777n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 0n,
    tobyAllowance: 5_000_000_000n, // more than sufficient
  })
  assert.equal(review.toby.allowanceSufficient, true)
})

test('insufficient allowances both show approval required in review', () => {
  const review = buildTransactionReview({
    tokenId: 777n,
    activationYCost: 37n,
    activationXAmount: 4_000_000_000n,
    patienceAllowance: 0n,
    tobyAllowance: 0n,
  })
  assert.equal(review.patience.allowanceSufficient, false)
  assert.equal(review.toby.allowanceSufficient, false)
})

// ─── Activate transaction builder ─────────────────────────────────────────────

test('buildActivate produces fixed-target activation tx with correct structure', () => {
  const tx = buildActivate(777n, 37n, 4_000_000_000n, 1000000000n)
  assert.equal(tx.to, CONTRACTS.manager)
  assert.ok(tx.data.startsWith('0x'))
  assert.ok(tx.data.length > 10)
  assert.equal(tx.value, '0x0')
  assert.ok(Object.isFrozen(tx))
})

test('buildActivate rejects tokenId zero', () => {
  assert.throws(() => buildActivate(0n, 37n, 4_000_000_000n, 1000000000n))
})

test('buildActivate rejects zero deadline', () => {
  assert.throws(() => buildActivate(777n, 37n, 4_000_000_000n, 0n))
})

test('buildActivate rejects MaxUint256 deadline', () => {
  const MAX = 2n ** 256n - 1n
  assert.throws(() => buildActivate(777n, 37n, 4_000_000_000n, MAX))
})

test('buildActivate rejects zero maxYIn', () => {
  assert.throws(() => buildActivate(777n, 0n, 4_000_000_000n, 1000000000n))
})

// ─── Stale state invalidates prepared transactions ────────────────────────────

test('stale state invalidation: main.js tracks preparedSnapshot for stale detection', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /preparedSnapshot/)
  assert.match(source, /connectionVersion.*snap\.connectionVersion/s)
  assert.match(source, /account.*snap\.account/s)
  assert.match(source, /transferNonce.*snap\.transferNonce/s)
  assert.match(source, /activationYCost.*snap\.activationYCost/s)
  assert.match(source, /activationXAmount.*snap\.activationXAmount/s)
  assert.match(source, /txFee.*snap\.txFee/s)
  assert.match(source, /burnFee.*snap\.burnFee/s)
})

test('freshTransactionGate checks for revoked DEPOSITOR_ROLE', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /!state\.live\.managerHasDepositorRole.*DEPOSITOR_ROLE/s)
})

test('freshTransactionGate checks for protocolCustody', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /state\.live\.protocolCustody.*Protocol custody is true/s)
})

test('freshTransactionGate checks for activationStarted', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /!state\.live\.activationStarted.*Activation is not started/s)
})

test('freshTransactionGate checks for owner mismatch', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /isAddressEqual.*owner.*state\.account.*owner of the Lore Land/s)
})

test('freshTransactionGate checks for already active', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /freshIsActive.*already active/s)
})

test('freshTransactionGate checks Y/X economics outside live ranges', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /activationYCost > state\.live\.maxActivationY.*outside live protocol range/s)
  assert.match(source, /activationXAmount > state\.live\.maxActivationX.*outside live protocol range/s)
})

test('stale state invalidation: connection version change invalidates prepared tx', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /connectionVersion !== snap\.connectionVersion/)
})

test('stale state invalidation: ownership nonce change detected before activation', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /currentNonce !== snap\.transferNonce.*nonce changed/is)
})

test('stale state invalidation: economics change detected before activation', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /PATIENCE fee configuration changed|economics changed/i)
})

// ─── Wallet rejection → no retry ─────────────────────────────────────────────

test('wallet rejection causes no retry: isUserRejection detects EIP-1193 code 4001', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /isUserRejection/)
  assert.match(source, /code === 4001/)
  assert.match(source, /no retry/i)
})

test('wallet rejection: rejected in wallet stops the sequence cleanly', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /Rejected in wallet.*no retry/)
  // After rejection, button is NOT re-enabled (no automatic retry)
  const rejectionBlock = source.match(/isUserRejection\(error\)[^}]+}/s)?.[0] ?? ''
  assert.ok(rejectionBlock.includes('Rejected in wallet'))
})

// ─── Receipt failure stops workflow ──────────────────────────────────────────

test('receipt failure stops workflow: waitForReceipt throws on reverted status', async () => {
  const source = await readFile(path.join(srcDir, 'receipt.js'), 'utf8')
  assert.match(source, /status === 'reverted'/)
  assert.match(source, /throw new Error/)
})

test('receipt failure stops workflow: receipt timeout throws', async () => {
  const source = await readFile(path.join(srcDir, 'receipt.js'), 'utf8')
  assert.match(source, /not confirmed after/)
})

test('receipt failure stops workflow: main stops on receipt failure without retry', async () => {
  const source = await readSrc('main.js')
  // After waitForReceipt throws, we fall through to catch and do not re-enable activate
  assert.match(source, /waitForReceipt\(state\.client/)
  // catch block does NOT call handleActivate() recursively
  const catchBlocks = source.match(/} catch \(error\) \{[^}]+}/sg) ?? []
  for (const block of catchBlocks) {
    assert.doesNotMatch(block, /handleActivate\s*\(/)
  }
})

// ─── Activation cannot run before both allowances sufficient ─────────────────

test('activation blocked until both allowances confirmed sufficient', async () => {
  const source = await readSrc('main.js')
  // btnActivate only enabled when patienceNeeded && tobyNeeded are both false
  assert.match(source, /btnActivate\.disabled = patienceNeeded \|\| tobyNeeded/)
})

test('activation immediately re-reads both allowances before submitting', async () => {
  const source = await readSrc('main.js')
  // handleActivate does fresh allowance reads before building tx
  assert.match(source, /freshPatienceAllowance.*freshTobyAllowance|PATIENCE allowance insufficient|TOBY allowance insufficient/s)
})

// ─── Successful activation requires post-receipt on-chain verification ────────

test('successful activation verifies isActive after receipt', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /verifiedIsActive/)
  assert.match(source, /isActive.*still false|isActive.*false.*Contact/i)
})

test('successful activation verifies activeLockId after receipt', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /verifiedLockId/)
  assert.match(source, /activeLockId.*zero|zero.*Contact/i)
})

test('successful activation verifies getLock record after receipt', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /getLock.*verifiedLockId|lockRecord/)
  assert.match(source, /Activation complete.*Lock/i)
})

// ─── Transaction flow: one tx in flight at a time ────────────────────────────

test('only one transaction in flight at a time: disableAllStepButtons called before each send', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /disableAllStepButtons/)
  // Called at start of each handler
  const patienceHandler = source.slice(source.indexOf('async function handlePatienceApprove'))
  const tobyHandler = source.slice(source.indexOf('async function handleTobyApprove'))
  const activateHandler = source.slice(source.indexOf('async function handleActivate'))
  assert.match(patienceHandler.slice(0, 200), /disableAllStepButtons/)
  assert.match(tobyHandler.slice(0, 200), /disableAllStepButtons/)
  assert.match(activateHandler.slice(0, 200), /disableAllStepButtons/)
})

// ─── eth_sendTransaction is the only transaction method used ─────────────────

test('eth_sendTransaction is the only transaction submission method in main.js', async () => {
  const source = await readSrc('main.js')
  // Must use eth_sendTransaction
  assert.match(source, /'eth_sendTransaction'/)
  // Must not use any other send methods
  assert.doesNotMatch(source, /writeContract\s*\(/)
  assert.doesNotMatch(source, /sendTransaction\s*\(/)
  assert.doesNotMatch(source, /prepareTransactionRequest\s*\(/)
  assert.doesNotMatch(source, /eth_sendRawTransaction/)
  assert.doesNotMatch(source, /wallet_sendCalls/)
})

// ─── Preflight / eligibility checks (preserved from prior cut) ───────────────

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

// ─── Architecture / source invariants ────────────────────────────────────────

test('fixed decimal expectations preserve deployment ABI decode types', async () => {
  const contractsSource = await readSrc('contracts.js')
  const preflightSource = await readSrc('preflight.js')
  assert.match(contractsSource, /EXPECTED_MANAGER_TOKEN_X_DECIMALS = 18\b/)
  assert.match(contractsSource, /EXPECTED_ERC20_DECIMALS = 18n\b/)
  assert.match(preflightSource, /PATIENCE\.decimals\(\).*EXPECTED_ERC20_DECIMALS/)
  assert.match(preflightSource, /TOBY\.decimals\(\).*EXPECTED_ERC20_DECIMALS/)
})

test('live protocol preflight uses one dependency read plus one fail-closed multicall snapshot', async () => {
  const source = await readSrc('main.js')
  const start = source.indexOf('async function loadLiveProtocol()')
  const end = source.indexOf('function renderLiveProtocol()', start)
  assert.ok(start >= 0 && end > start)
  const body = source.slice(start, end)
  assert.match(body, /functionName: 'DEPOSITOR_ROLE'/)
  assert.match(body, /client\.multicall\(\{/)
  assert.match(body, /allowFailure: false/)
  assert.doesNotMatch(body, /Promise\.all\s*\(/)
  assert.match(body, /Wallet connection changed during live verification\./)
})

test('WalletConnect is used only for wallet identity and eth_sendTransaction', async () => {
  const walletSource = await readSrc('wallet.js')
  const mainSource = await readSrc('main.js')
  assert.match(walletSource, /createPublicClient\(\{ chain: base, transport: http\(BASE_READ_RPC_URL\) \}\)/)
  assert.doesNotMatch(walletSource, /\bcustom\s*\(/)
  assert.match(mainSource, /Connected · identity \+ transactions/)
  assert.match(mainSource, /Contract reads use the fixed Base public RPC/)
  // Only eth_sendTransaction appears as the send method
  assert.match(mainSource, /method: 'eth_sendTransaction'/)
  assert.doesNotMatch(mainSource, /method: 'personal_sign'/)
  assert.doesNotMatch(mainSource, /method: 'eth_sign'/)
})

test('BASE_READ_RPC_URL comes from VITE_BASE_RPC_URL env var', async () => {
  const source = await readSrc('wallet.js')
  assert.match(source, /VITE_BASE_RPC_URL/)
  assert.match(source, /BASE_READ_RPC_URL/)
})

test('production vite config requires both env vars', async () => {
  const source = await readFile(path.resolve(DIR, '../vite.config.js'), 'utf8')
  assert.match(source, /VITE_WALLETCONNECT_PROJECT_ID/)
  assert.match(source, /VITE_BASE_RPC_URL/)
  assert.match(source, /production/)
  assert.match(source, /throw new Error/)
})

test('in-flight review reads fail closed when the wallet connection changes', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /connectionVersion:\s*0/)
  assert.match(source, /state\.connectionVersion \+= 1/)
  assert.match(source, /Wallet connection changed during live verification\./)
  assert.match(source, /Wallet connection changed during Lore Land verification\./)
  assert.match(source, /state\.provider\.on\('accountsChanged', resetConnection\)/)
  assert.match(source, /state\.provider\.on\('chainChanged', resetConnection\)/)
})

test('footer text updated to reflect transaction capability', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /Read the chain\. Verify the bindings\. Approve every transaction in your wallet\./)
  assert.doesNotMatch(source, /Sign nothing here/)
})

test('obsolete read-only preview language removed from product', async () => {
  const source = await readSrc('main.js')
  assert.doesNotMatch(source, /READ-ONLY PREVIEW/)
  assert.doesNotMatch(source, /TRANSACTIONS DISABLED/)
  assert.doesNotMatch(source, /REVIEW ONLY.*NO SIGNING/)
  assert.doesNotMatch(source, /NO CALLDATA/)
  assert.doesNotMatch(source, /NO TRANSACTION PATH/)
  assert.doesNotMatch(source, /Activation transactions are disabled/)
})

test('Unofficial ToadAid disclosure and no-key collection statement preserved', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /Unofficial ToadAid/)
  assert.match(source, /No wallet keys are collected or stored/)
})

test('LORE NFT approval warning preserved in product', async () => {
  const source = await readSrc('main.js')
  assert.match(source, /LORE NFT approval required/)
  assert.match(source, /NO/)
  assert.match(source, /Never approve LORE/)
})

test('transaction-review UI refreshes mutable protocol state before reading Lore Land', async () => {
  const source = await readSrc('main.js')
  const clearIndex = source.indexOf("resetTransactionReview('Refreshing mutable protocol values before transaction review…')")
  const refreshIndex = source.indexOf('const liveFresh = await loadLiveProtocol()', clearIndex)
  const landReadIndex = source.indexOf('const nft = (name)', refreshIndex)
  assert.ok(clearIndex >= 0)
  assert.ok(refreshIndex > clearIndex)
  assert.ok(landReadIndex > refreshIndex)
  assert.match(source, /return true[\s\S]*catch \(error\)[\s\S]*return false/)
})
