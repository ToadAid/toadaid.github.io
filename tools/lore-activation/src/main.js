import './style.css'
import { getAddress, isAddressEqual } from 'viem'
import { activationManagerAbi, activationVaultAbi, nft2Abi, patienceAbi, tobyAbi } from './abi.js'
import { ACTIVATION_OPERATION_ID, BASE_CHAIN_ID, CONTRACT_LABELS, CONTRACTS } from './contracts.js'
import { escapeHtml, formatRaw, formatToken, shortAddress } from './format.js'
import { assessEligibility, bindingChecks, economicsStatus, expectedPatienceReceipt, parseTokenId } from './preflight.js'
import { buildTransactionReview } from './transaction-review.js'
import { connectWallet, disconnectWallet, walletConnectProjectId } from './wallet.js'

const state = {
  provider: null,
  client: null,
  account: null,
  chainId: null,
  live: null,
  land: null,
  connectionVersion: 0,
}

document.querySelector('#app').innerHTML = `
  <header class="hero">
    <nav class="brand" aria-label="ToadAid">
      <img src="/TOADAID-logo.png" alt="ToadAid" />
      <span>TOADAID</span>
    </nav>
    <div class="eyebrow">Unofficial ToadAid compatibility helper</div>
    <h1>Lore Activation<br /><em>Helper</em></h1>
    <p class="subtitle">Tangem / WalletConnect compatibility preflight</p>
    <div class="readonly-banner">READ-ONLY PREVIEW — TRANSACTIONS DISABLED</div>
    <p class="disclaimer">Unofficial ToadAid compatibility helper.<br />No wallet keys are collected or stored.<br />Activation transactions are disabled in this preview.<br />Verify all contract addresses and transactions before signing.</p>
  </header>

  <main>
    <section class="panel wallet-panel" aria-labelledby="wallet-title">
      <div class="section-heading"><span>01</span><div><p>Compatibility</p><h2 id="wallet-title">Wallet connection</h2></div></div>
      <div class="wallet-grid">
        <div><span class="label">Wallet</span><strong id="wallet-address">Not connected</strong></div>
        <div><span class="label">Base chain</span><strong id="chain-status">Not verified</strong></div>
        <div><span class="label">Connection</span><strong id="connection-status">${walletConnectProjectId ? 'Ready to connect' : 'WalletConnect configuration pending'}</strong></div>
      </div>
      <div class="actions">
        <button id="connect-button" class="primary" ${walletConnectProjectId ? '' : 'disabled'}>Connect with WalletConnect</button>
        <button id="disconnect-button" class="secondary" disabled>Disconnect</button>
      </div>
      <p id="connection-message" class="notice ${walletConnectProjectId ? '' : 'pending'}">${walletConnectProjectId ? 'Only Base mainnet (8453) is admitted.' : 'WalletConnect configuration pending. Protocol details remain available below; connection is disabled until the operator supplies the project configuration.'}</p>
    </section>

    <section class="panel" aria-labelledby="land-title">
      <div class="section-heading"><span>02</span><div><p>Ownership</p><h2 id="land-title">Lore Land preflight</h2></div></div>
      <form id="land-form" class="land-form" novalidate>
        <label for="token-id">Lore Land token ID</label>
        <div><input id="token-id" name="token-id" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="e.g. 777" /><button class="primary" type="submit" disabled>Check Land</button></div>
        <p id="token-error" class="field-error" role="alert"></p>
      </form>
      <div id="land-results" class="data-grid muted-grid">
        ${dataItem('Owner', 'land-owner')}
        ${dataItem('Ownership generation', 'land-nonce')}
        ${dataItem('ERC-6551 account (informational)', 'land-account')}
        ${dataItem('Collection identity', 'lore-identity')}
        ${dataItem('Current active state', 'land-active')}
        ${dataItem('Current lock ID', 'land-lock')}
        ${dataItem('Current lock record', 'land-lock-record')}
        ${dataItem('Activation started', 'activation-started')}
        ${dataItem('Activation pause status', 'pause-status')}
        ${dataItem('Protocol custody status', 'custody-status')}
      </div>
      <div id="eligibility" class="verdict pending"><strong>Eligibility not established</strong><span>Connect and check a Lore Land. Activation pause verification remains pending.</span></div>
    </section>

    <section class="panel" aria-labelledby="bindings-title">
      <div class="section-heading"><span>03</span><div><p>Reviewed evidence</p><h2 id="bindings-title">Protocol bindings</h2></div></div>
      <div id="binding-checks" class="binding-list">
        ${Object.entries(CONTRACTS).map(([key, address]) => `<div class="binding"><span class="status-dot pending-dot">•</span><div><strong>${CONTRACT_LABELS[key]}</strong><code>${address}</code><small>Live check pending</small></div></div>`).join('')}
      </div>
      <p class="notice">The addresses above are fixed reviewed Base production bindings and cannot be edited here. Any live mismatch fails closed.</p>
    </section>

    <section class="panel" aria-labelledby="economics-title">
      <div class="section-heading"><span>04</span><div><p>Read-only balances</p><h2 id="economics-title">Activation economics</h2></div></div>
      <div class="token-block">
        <div class="token-title"><span class="token-mark patience">P</span><div><h3>PATIENCE requirement</h3><p>Spender: ActivationVault</p><code>${CONTRACTS.vault}</code></div></div>
        <div class="metric-grid">
          ${metric('Required (gross quoted)', 'patience-required')}
          ${metric('Wallet balance', 'patience-balance')}
          ${metric('Current Vault allowance', 'patience-allowance')}
          ${metric('Expected Vault gain', 'patience-receipt')}
        </div>
        <p id="patience-identity" class="token-identity">Live token identity pending</p>
        <div class="fee-grid">
          ${dataItem('txFee', 'tx-fee')}${dataItem('burnFee', 'burn-fee')}${dataItem('FeeAddress', 'fee-address')}${dataItem('Owner', 'patience-owner')}
        </div>
        <p id="fee-status" class="notice pending">Fee configuration pending live read. Receipt calculation withheld pending fee review.</p>
      </div>
      <div class="token-block">
        <div class="token-title"><span class="token-mark toby">T</span><div><h3>TOBY commitment</h3><p>Spender: ActivationManager</p><code>${CONTRACTS.manager}</code></div></div>
        <div class="metric-grid">
          ${metric('Required', 'toby-required')}
          ${metric('Wallet balance', 'toby-balance')}
          ${metric('Current Manager allowance', 'toby-allowance')}
          ${metric('Minimum X lock', 'lock-duration', '90 days')}
        </div>
        <p id="toby-identity" class="token-identity">Live token identity pending</p>
      </div>
      <div class="token-block">
        <div class="token-title"><span class="token-mark vault">V</span><div><h3>Vault accounting</h3><p>Informational live totals</p></div></div>
        <div class="metric-grid">
          ${metric('Current balance', 'vault-balance')}
          ${metric('Gross quoted', 'vault-gross')}
          ${metric('Actually received', 'vault-received')}
          ${metric('Withdrawn', 'vault-withdrawn')}
          ${metric('Activations collected', 'vault-activations')}
          ${metric('Y allowed range', 'y-range')}
          ${metric('X allowed range', 'x-range')}
        </div>
      </div>
    </section>

    <section class="panel security" aria-labelledby="security-title">
      <div class="section-heading"><span>05</span><div><p>Non-negotiable boundary</p><h2 id="security-title">Security</h2></div></div>
      <div class="no-approval"><span>LORE NFT approval required</span><strong>NO</strong></div>
      <p class="warning">Never approve LORE or SetApprovalForAll for activation.</p>
      <p>No seed phrase or private key is requested by this site.<br />WalletConnect requests are approved inside your wallet.</p>
    </section>

    <section class="panel transaction-panel" aria-labelledby="transactions-title">
      <div class="section-heading"><span>06</span><div><p>Human review only</p><h2 id="transactions-title">Activation transaction review</h2></div></div>
      <div class="review-boundary">REVIEW ONLY — NO SIGNING, NO CALLDATA, NO TRANSACTION PATH</div>
      <p id="transaction-review-status" class="notice pending">Connect a Base wallet and check one Lore Land to populate fresh review values.</p>

      <div class="review-stack" aria-label="Non-executable activation review">
        <article class="review-card">
          <div class="review-card-head"><span>01</span><div><strong>PATIENCE allowance review</strong><small>Token Y · spender must be ActivationVault</small></div></div>
          <div class="review-grid">
            ${reviewValue('Token', 'review-patience-token')}
            ${reviewValue('Spender', 'review-patience-spender')}
            ${reviewValue('Exact reviewed amount', 'review-patience-amount')}
            ${reviewValue('Current allowance', 'review-patience-current')}
            ${reviewValue('Allowance state', 'review-patience-state')}
          </div>
        </article>

        <article class="review-card">
          <div class="review-card-head"><span>02</span><div><strong>TOBY allowance review</strong><small>Token X · spender must be ActivationManager</small></div></div>
          <div class="review-grid">
            ${reviewValue('Token', 'review-toby-token')}
            ${reviewValue('Spender', 'review-toby-spender')}
            ${reviewValue('Exact reviewed amount', 'review-toby-amount')}
            ${reviewValue('Current allowance', 'review-toby-current')}
            ${reviewValue('Allowance state', 'review-toby-state')}
          </div>
        </article>

        <article class="review-card">
          <div class="review-card-head"><span>03</span><div><strong>Activation call review</strong><small>Target must be ActivationManager</small></div></div>
          <div class="review-grid">
            ${reviewValue('Target', 'review-activation-target')}
            ${reviewValue('Lore Land token ID', 'review-token-id')}
            ${reviewValue('maxYIn', 'review-max-y')}
            ${reviewValue('expectedXAmount', 'review-expected-x')}
            ${reviewValue('Deadline', 'review-deadline', 'UNSET')}
            ${reviewValue('LORE approval required', 'review-lore-approval', 'NO')}
          </div>
        </article>
      </div>

      <p class="notice pending">This panel is a deterministic human-readable review map only. It does not encode calldata, choose a deadline, request signatures, or submit transactions. The official Tobyworld activation flow must still be verified before any execution cut.</p>
    </section>
  </main>
  <footer><img src="/TOADAID-logo.png" alt="" /><p>Read the chain. Verify the bindings. Sign nothing here.</p></footer>
`

const connectButton = byId('connect-button')
const disconnectButton = byId('disconnect-button')
const landForm = byId('land-form')
const landButton = landForm.querySelector('button')

connectButton.addEventListener('click', handleConnect)
disconnectButton.addEventListener('click', handleDisconnect)
landForm.addEventListener('submit', handleLandCheck)

async function handleConnect() {
  connectButton.disabled = true
  setText('connection-status', 'Opening WalletConnect…')
  setNotice('connection-message', 'Confirm the wallet identity connection inside your wallet. No signing request will be created.', 'pending')
  try {
    const session = await connectWallet()
    if (session.chainId !== BASE_CHAIN_ID) {
      await disconnectWallet(session.provider)
      throw new Error(`Unsupported chain ${session.chainId}. Switch the wallet to Base mainnet (8453).`)
    }
    Object.assign(state, session)
    state.connectionVersion += 1
    attachProviderEvents()
    setText('wallet-address', shortAddress(state.account))
    setText('chain-status', `Base mainnet · ${state.chainId}`)
    setText('connection-status', 'Connected · identity only')
    setNotice('connection-message', 'Wallet identity connected on Base. Contract reads use the fixed Base public RPC; no signing request will be created.', 'pass')
    disconnectButton.disabled = false
    landButton.disabled = false
    await loadLiveProtocol()
  } catch (error) {
    resetConnection()
    setText('connection-status', 'Connection unavailable')
    setNotice('connection-message', readableError(error), 'fail')
    connectButton.disabled = !walletConnectProjectId
  }
}

async function handleDisconnect() {
  const provider = state.provider
  resetConnection()
  try {
    await disconnectWallet(provider)
  } catch (error) {
    setNotice('connection-message', readableError(error), 'fail')
  }
  setNotice('connection-message', 'Wallet disconnected. Protocol values require a fresh connection.', 'pending')
}

function attachProviderEvents() {
  state.provider.on('accountsChanged', resetConnection)
  state.provider.on('chainChanged', resetConnection)
  state.provider.on('disconnect', resetConnection)
}

async function loadLiveProtocol() {
  const connectionVersion = state.connectionVersion
  const client = state.client
  const account = state.account
  const chainId = state.chainId

  if (!client || !account || chainId !== BASE_CHAIN_ID) {
    state.live = null
    return false
  }

  setNotice('connection-message', 'Reading fixed Base contracts…', 'pending')
  try {
    const manager = (name, args) => read(CONTRACTS.manager, activationManagerAbi, name, args)
    const vault = (name, args) => read(CONTRACTS.vault, activationVaultAbi, name, args)
    const patience = (name, args) => read(CONTRACTS.patience, patienceAbi, name, args)
    const toby = (name, args) => read(CONTRACTS.toby, tobyAbi, name, args)
    const depositorRole = await vault('DEPOSITOR_ROLE')
    const values = await Promise.all([
      manager('nft2'), manager('tokenX'), manager('vault'), manager('tokenXDecimals'), manager('LOCK_DURATION'),
      vault('tokenY'), patience('decimals'), toby('decimals'), vault('hasRole', [depositorRole, CONTRACTS.manager]),
      manager('activationStarted'), manager('activationYCost'), manager('activationXAmount'),
      manager('minActivationY'), manager('maxActivationY'), manager('minActivationX'), manager('maxActivationX'),
      manager('protocolCustody', [state.account]), manager('operationPaused', [ACTIVATION_OPERATION_ID]),
      patience('balanceOf', [state.account]), patience('allowance', [state.account, CONTRACTS.vault]),
      toby('balanceOf', [state.account]), toby('allowance', [state.account, CONTRACTS.manager]),
      patience('txFee'), patience('burnFee'), patience('FeeAddress'), patience('owner'),
      patience('name'), patience('symbol'), toby('name'), toby('symbol'),
      read(CONTRACTS.lore, nft2Abi, 'name'), read(CONTRACTS.lore, nft2Abi, 'symbol'),
      vault('balance'), vault('totalGrossQuoted'), vault('totalActuallyReceived'), vault('totalWithdrawn'), vault('totalActivationsCollected'),
    ])
    const [managerNft2, managerTokenX, managerVault, tokenXDecimals, lockDuration, vaultTokenY, patienceDecimals, tobyDecimals, managerHasDepositorRole,
      activationStarted, activationYCost, activationXAmount, minActivationY, maxActivationY, minActivationX, maxActivationX, protocolCustody, activationPaused,
      patienceBalance, patienceAllowance, tobyBalance, tobyAllowance, txFee, burnFee, feeAddress, patienceOwner,
      patienceName, patienceSymbol, tobyName, tobySymbol, loreName, loreSymbol,
      vaultBalance, totalGrossQuoted, totalActuallyReceived, totalWithdrawn, totalActivationsCollected] = values

    if (
      state.connectionVersion !== connectionVersion
      || state.client !== client
      || state.account !== account
      || state.chainId !== chainId
    ) {
      throw new Error('Wallet connection changed during live verification.')
    }

    state.live = { chainId, managerNft2, managerTokenX, managerVault, tokenXDecimals, lockDuration, vaultTokenY,
      patienceDecimals, tobyDecimals, managerHasDepositorRole, activationStarted, activationYCost, activationXAmount,
      minActivationY, maxActivationY, minActivationX, maxActivationX, protocolCustody, activationPaused, patienceBalance, patienceAllowance,
      tobyBalance, tobyAllowance, txFee, burnFee, feeAddress, patienceOwner, patienceName, patienceSymbol,
      tobyName, tobySymbol, loreName, loreSymbol, vaultBalance, totalGrossQuoted,
      totalActuallyReceived, totalWithdrawn, totalActivationsCollected }
    renderLiveProtocol()
    setNotice('connection-message', 'Live contract reads complete. Any mismatch is shown without correction.', 'pass')
    return true
  } catch (error) {
    state.live = null
    resetTransactionReview('Fresh protocol verification failed. Review values withheld.')
    renderBindingFailure(error)
    setNotice('connection-message', `Live verification failed closed: ${readableError(error)}`, 'fail')
    return false
  }
}

function renderLiveProtocol() {
  const checks = bindingChecks(state.live)
  byId('binding-checks').innerHTML = checks.map(item => `<div class="binding ${item.pass ? 'pass' : 'fail'}"><span class="status-dot">${item.pass ? '✓' : '×'}</span><div><strong>${escapeHtml(item.label)}</strong><code>Live: ${escapeHtml(formatRaw(item.live))}</code><small>Expected: ${escapeHtml(formatRaw(item.expected))}</small></div></div>`).join('')
  setText('activation-started', formatRaw(state.live.activationStarted))
  setText('pause-status', state.live.activationPaused ? 'PAUSED' : `Clear · ${ACTIVATION_OPERATION_ID}`)
  setText('custody-status', formatRaw(state.live.protocolCustody))
  setText('patience-required', `${formatToken(state.live.activationYCost)} PATIENCE`)
  setText('patience-balance', `${formatToken(state.live.patienceBalance)} PATIENCE`)
  setText('patience-allowance', `${formatToken(state.live.patienceAllowance)} PATIENCE`)
  setText('toby-required', `${formatToken(state.live.activationXAmount)} TOBY`)
  setText('toby-balance', `${formatToken(state.live.tobyBalance)} TOBY`)
  setText('toby-allowance', `${formatToken(state.live.tobyAllowance)} TOBY`)
  setText('lock-duration', `${formatRaw(state.live.lockDuration)} seconds · 90 days`)
  setText('tx-fee', formatRaw(state.live.txFee))
  setText('burn-fee', formatRaw(state.live.burnFee))
  setText('fee-address', state.live.feeAddress)
  setText('patience-owner', state.live.patienceOwner)
  setText('patience-identity', `${state.live.patienceName} (${state.live.patienceSymbol}) · ${state.live.patienceDecimals} decimals`)
  setText('toby-identity', `${state.live.tobyName} (${state.live.tobySymbol}) · ${state.live.tobyDecimals} decimals`)
  setText('lore-identity', `${state.live.loreName} (${state.live.loreSymbol})`)
  setText('vault-balance', `${formatToken(state.live.vaultBalance)} PATIENCE`)
  setText('vault-gross', `${formatToken(state.live.totalGrossQuoted)} PATIENCE`)
  setText('vault-received', `${formatToken(state.live.totalActuallyReceived)} PATIENCE`)
  setText('vault-withdrawn', `${formatToken(state.live.totalWithdrawn)} PATIENCE`)
  setText('vault-activations', formatRaw(state.live.totalActivationsCollected))
  setText('y-range', `${formatToken(state.live.minActivationY)}–${formatToken(state.live.maxActivationY)}`)
  setText('x-range', `${formatToken(state.live.minActivationX)}–${formatToken(state.live.maxActivationX)}`)
  const economics = economicsStatus(state.live.txFee, state.live.burnFee)
  if (economics.reviewed) {
    const payerIsFeeAddress = isAddressEqual(state.account, state.live.feeAddress)
    const expectedReceipt = expectedPatienceReceipt(
      state.live.activationYCost,
      state.live.txFee,
      state.live.burnFee,
      state.account,
      state.live.feeAddress,
    )
    setText('patience-receipt', `${formatToken(expectedReceipt)} PATIENCE`)
    if (payerIsFeeAddress) {
      setNotice('fee-status', `Reviewed fee state matches. Connected payer is the live FeeAddress, so the PATIENCE sender exemption applies. Wallet debit: ${formatToken(state.live.activationYCost)} PATIENCE. Vault expected gain: ${formatToken(expectedReceipt)} PATIENCE.`, 'pass')
    } else {
      setNotice('fee-status', `Reviewed fee state matches. Wallet debit: ${formatToken(state.live.activationYCost)} PATIENCE. Vault expected gain follows exact token arithmetic: gross minus floor(gross / 100). Fee destination: ${state.live.feeAddress}.`, 'pass')
    }
  } else {
    setText('patience-receipt', 'Withheld')
    setNotice('fee-status', `${economics.label}. Receipt calculation withheld pending fee review.`, 'fail')
  }
}

async function handleLandCheck(event) {
  event.preventDefault()
  setText('token-error', '')
  const parsed = parseTokenId(byId('token-id').value)
  if (!parsed.ok) {
    setText('token-error', parsed.error)
    return
  }
  if (!state.client || !state.live) {
    setText('token-error', 'Connect a Base wallet and complete protocol verification first.')
    return
  }
  landButton.disabled = true
  resetTransactionReview('Refreshing mutable protocol values before transaction review…')
  setVerdict('pending', 'Refreshing review inputs', 'Mutable economics, fee state, balances, allowances, custody, and pause state are being reread.')
  try {
    const liveFresh = await loadLiveProtocol()
    if (!liveFresh || !state.live) {
      throw new Error('Fresh protocol verification failed. Transaction review withheld.')
    }

    const connectionVersion = state.connectionVersion
    const client = state.client
    const accountAtReview = state.account

    setVerdict('pending', 'Reading Lore Land', 'Ownership and activation state are being independently checked against the refreshed protocol state.')

    const nft = (name) => read(CONTRACTS.lore, nft2Abi, name, [parsed.value])
    const manager = (name) => read(CONTRACTS.manager, activationManagerAbi, name, [parsed.value])
    const [owner, transferNonce, account, isActive, activeLockId] = await Promise.all([
      nft('ownerOf'), nft('transferNonce'), nft('accountOf'), manager('isActive'), manager('activeLockId'),
    ])
    const lock = activeLockId === 0n ? null : await read(CONTRACTS.manager, activationManagerAbi, 'getLock', [activeLockId])

    if (
      state.connectionVersion !== connectionVersion
      || state.client !== client
      || state.account !== accountAtReview
      || !state.live
    ) {
      throw new Error('Wallet connection changed during Lore Land verification.')
    }

    state.land = { tokenId: parsed.value, owner: getAddress(owner), transferNonce, account, isActive, activeLockId, lock }
    setText('land-owner', owner)
    setText('land-nonce', formatRaw(transferNonce))
    setText('land-account', account)
    setText('land-active', formatRaw(isActive))
    setText('land-lock', formatRaw(activeLockId))
    setText('land-lock-record', lock ? `Locker ${lock.locker} · ${formatToken(lock.xAmount)} TOBY · unlock ${new Date(Number(lock.unlockTime) * 1000).toISOString()}` : 'None')
    renderEligibility()
  } catch (error) {
    state.land = null
    resetTransactionReview('Lore Land verification failed. Review values cleared.')
    setVerdict('fail', 'Lore Land verification failed closed', readableError(error))
  } finally {
    landButton.disabled = false
  }
}

function renderEligibility() {
  const economics = economicsStatus(state.live.txFee, state.live.burnFee)
  const result = assessEligibility({
    checks: bindingChecks(state.live), wallet: state.account, owner: state.land.owner, isActive: state.land.isActive,
    protocolCustody: state.live.protocolCustody, activationStarted: state.live.activationStarted,
    pauseStatus: state.live.activationPaused ? 'paused' : 'clear', economicsReviewed: economics.reviewed,
    patienceBalance: state.live.patienceBalance, activationYCost: state.live.activationYCost,
    tobyBalance: state.live.tobyBalance, activationXAmount: state.live.activationXAmount,
  })
  renderTransactionReview(result.eligible)
  if (result.eligible) {
    setVerdict('pass', 'Read-only eligibility checks pass', 'Exact review values are populated below, but this preview still cannot create approvals or activation transactions.')
  } else {
    setVerdict('fail', 'Eligibility not established', result.reasons.join(' · '))
  }
}

function renderTransactionReview(eligible) {
  const review = buildTransactionReview({
    tokenId: state.land.tokenId,
    activationYCost: state.live.activationYCost,
    activationXAmount: state.live.activationXAmount,
    patienceAllowance: state.live.patienceAllowance,
    tobyAllowance: state.live.tobyAllowance,
  })

  setText('review-patience-token', review.patience.token)
  setText('review-patience-spender', review.patience.spender)
  setText('review-patience-amount', `${formatToken(review.patience.exactAmount)} PATIENCE`)
  setText('review-patience-current', `${formatToken(review.patience.currentAllowance)} PATIENCE`)
  setText('review-patience-state', review.patience.allowanceSufficient ? 'Existing allowance is sufficient' : 'Exact allowance would be required')

  setText('review-toby-token', review.toby.token)
  setText('review-toby-spender', review.toby.spender)
  setText('review-toby-amount', `${formatToken(review.toby.exactAmount)} TOBY`)
  setText('review-toby-current', `${formatToken(review.toby.currentAllowance)} TOBY`)
  setText('review-toby-state', review.toby.allowanceSufficient ? 'Existing allowance is sufficient' : 'Exact allowance would be required')

  setText('review-activation-target', review.activation.target)
  setText('review-token-id', formatRaw(review.activation.tokenId))
  setText('review-max-y', `${formatToken(review.activation.maxYIn)} PATIENCE`)
  setText('review-expected-x', `${formatToken(review.activation.expectedXAmount)} TOBY`)
  setText('review-deadline', 'UNSET — official-flow verification required')
  setText('review-lore-approval', review.loreApprovalRequired ? 'YES' : 'NO')

  if (eligible) {
    setNotice('transaction-review-status', 'Fresh reviewed targets and amounts loaded. Human review only; execution remains disabled.', 'pending')
  } else {
    setNotice('transaction-review-status', 'Review values loaded, but eligibility failed. Nothing can be signed or submitted.', 'fail')
  }
}

function resetTransactionReview(message = 'Connect a Base wallet and check one Lore Land to populate fresh review values.') {
  for (const id of [
    'review-patience-token', 'review-patience-spender', 'review-patience-amount', 'review-patience-current', 'review-patience-state',
    'review-toby-token', 'review-toby-spender', 'review-toby-amount', 'review-toby-current', 'review-toby-state',
    'review-activation-target', 'review-token-id', 'review-max-y', 'review-expected-x',
  ]) setText(id, '—')
  setText('review-deadline', 'UNSET')
  setText('review-lore-approval', 'NO')
  setNotice('transaction-review-status', message, 'pending')
}

function renderBindingFailure(error) {
  byId('binding-checks').innerHTML = `<div class="binding fail"><span class="status-dot">×</span><div><strong>Live reads incomplete</strong><code>${escapeHtml(readableError(error))}</code><small>Eligibility fails closed.</small></div></div>`
}

function resetConnection() {
  state.connectionVersion += 1
  Object.assign(state, { provider: null, client: null, account: null, chainId: null, live: null, land: null })
  resetTransactionReview()
  setText('wallet-address', 'Not connected')
  setText('chain-status', 'Not verified')
  setText('connection-status', walletConnectProjectId ? 'Ready to connect' : 'WalletConnect configuration pending')
  connectButton.disabled = !walletConnectProjectId
  disconnectButton.disabled = true
  landButton.disabled = true
}

function read(address, abi, functionName, args = []) {
  return state.client.readContract({ address, abi, functionName, args })
}

function setVerdict(kind, title, detail) {
  const element = byId('eligibility')
  element.className = `verdict ${kind}`
  element.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`
}

function setNotice(id, message, kind) {
  const element = byId(id)
  element.className = `notice ${kind}`
  element.textContent = message
}

function setText(id, value) {
  byId(id).textContent = value
}

function readableError(error) {
  return error?.shortMessage || error?.message || 'Unknown read error'
}

function byId(id) {
  return document.getElementById(id)
}

function dataItem(label, id, initial = '—') {
  return `<div class="data-item"><span>${label}</span><strong id="${id}">${initial}</strong></div>`
}

function metric(label, id, initial = '—') {
  return `<div class="metric"><span>${label}</span><strong id="${id}">${initial}</strong></div>`
}

function reviewValue(label, id, initial = '—') {
  return `<div class="review-value"><span>${label}</span><strong id="${id}">${initial}</strong></div>`
}
