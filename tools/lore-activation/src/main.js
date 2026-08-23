import './style.css'
import { getAddress, isAddressEqual } from 'viem'
import { activationManagerAbi, activationVaultAbi, nft2Abi, patienceAbi, tobyAbi } from './abi.js'
import { ACTIVATION_OPERATION_ID, BASE_CHAIN_ID, CONTRACT_LABELS, CONTRACTS, DEADLINE_WINDOW_SECONDS } from './contracts.js'
import { escapeHtml, formatRaw, formatToken, shortAddress } from './format.js'
import { assessEligibility, bindingChecks, economicsStatus, expectedPatienceReceipt, parseTokenId } from './preflight.js'
import { buildTransactionReview } from './transaction-review.js'
import { buildActivate, buildPatienceApprove, buildTobyApprove } from './tx-builder.js'
import { waitForReceipt } from './receipt.js'
import { connectWallet, disconnectWallet, walletConnectProjectId } from './wallet.js'

const state = {
  provider: null,
  client: null,
  account: null,
  chainId: null,
  live: null,
  land: null,
  connectionVersion: 0,
  // Snapshot used for stale-state detection during the activation stepper
  preparedSnapshot: null,
}

document.querySelector('#app').innerHTML = `
  <header class="hero">
    <nav class="brand" aria-label="ToadAid">
      <img src="/TOADAID-logo.png" alt="ToadAid" />
      <span>TOADAID</span>
    </nav>
    <div class="eyebrow">Unofficial ToadAid Lore Activation</div>
    <h1>Lore Activation<br /><em>Helper</em></h1>
    <p class="subtitle">Tangem / WalletConnect activation tool</p>
    <p class="disclaimer">Unofficial ToadAid activation helper.<br />No wallet keys are collected or stored.<br />Verify all contract addresses and transactions before signing.<br />Every transaction requires your explicit wallet approval.</p>
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
      <div class="section-heading"><span>06</span><div><p>User-operated transaction stepper</p><h2 id="transactions-title">Activate Lore Land</h2></div></div>
      <p id="transaction-review-status" class="notice pending">Connect a Base wallet and check one Lore Land to enable activation.</p>

      <div class="review-stack" aria-label="Activation transaction stepper">
        <article class="review-card" id="step-patience-card">
          <div class="review-card-head"><span>01</span><div><strong>PATIENCE allowance</strong><small>Token Y · spender must be ActivationVault · exact amount only</small></div></div>
          <div class="review-grid">
            ${reviewValue('Token (PATIENCE)', 'review-patience-token')}
            ${reviewValue('Spender (ActivationVault)', 'review-patience-spender')}
            ${reviewValue('Exact amount', 'review-patience-amount')}
            ${reviewValue('Current allowance', 'review-patience-current')}
            ${reviewValue('Allowance state', 'review-patience-state')}
          </div>
          <div class="step-actions">
            <button id="btn-patience-approve" class="primary" disabled>Approve PATIENCE in wallet</button>
            <span id="patience-step-status" class="step-status"></span>
          </div>
        </article>

        <article class="review-card" id="step-toby-card">
          <div class="review-card-head"><span>02</span><div><strong>TOBY allowance</strong><small>Token X · spender must be ActivationManager · exact amount only</small></div></div>
          <div class="review-grid">
            ${reviewValue('Token (TOBY)', 'review-toby-token')}
            ${reviewValue('Spender (ActivationManager)', 'review-toby-spender')}
            ${reviewValue('Exact amount', 'review-toby-amount')}
            ${reviewValue('Current allowance', 'review-toby-current')}
            ${reviewValue('Allowance state', 'review-toby-state')}
          </div>
          <div class="step-actions">
            <button id="btn-toby-approve" class="primary" disabled>Approve TOBY in wallet</button>
            <span id="toby-step-status" class="step-status"></span>
          </div>
        </article>

        <article class="review-card" id="step-activate-card">
          <div class="review-card-head"><span>03</span><div><strong>Activation call</strong><small>Target must be ActivationManager · fresh values re-read immediately before signing</small></div></div>
          <div class="review-grid">
            ${reviewValue('Target (ActivationManager)', 'review-activation-target')}
            ${reviewValue('Lore Land token ID', 'review-token-id')}
            ${reviewValue('maxYIn', 'review-max-y')}
            ${reviewValue('expectedXAmount', 'review-expected-x')}
            ${reviewValue('Deadline', 'review-deadline', 'UNSET')}
            ${reviewValue('LORE approval required', 'review-lore-approval', 'NO')}
          </div>
          <div class="step-actions">
            <button id="btn-activate" class="primary activate-btn" disabled>Activate Lore Land in wallet</button>
            <span id="activate-step-status" class="step-status"></span>
          </div>
        </article>
      </div>

      <p class="notice">All reads use the independent Base public client. WalletConnect is used only for wallet identity and transaction submission. Each transaction requires explicit approval in your wallet.</p>
    </section>
  </main>
  <footer><img src="/TOADAID-logo.png" alt="" /><p>Read the chain. Verify the bindings. Approve every transaction in your wallet.</p></footer>
`

const connectButton = byId('connect-button')
const disconnectButton = byId('disconnect-button')
const landForm = byId('land-form')
const landButton = landForm.querySelector('button')
const btnPatienceApprove = byId('btn-patience-approve')
const btnTobyApprove = byId('btn-toby-approve')
const btnActivate = byId('btn-activate')

connectButton.addEventListener('click', handleConnect)
disconnectButton.addEventListener('click', handleDisconnect)
landForm.addEventListener('submit', handleLandCheck)
btnPatienceApprove.addEventListener('click', handlePatienceApprove)
btnTobyApprove.addEventListener('click', handleTobyApprove)
btnActivate.addEventListener('click', handleActivate)

async function handleConnect() {
  connectButton.disabled = true
  setText('connection-status', 'Opening WalletConnect…')
  setNotice('connection-message', 'Confirm the session inside your wallet. Only eth_sendTransaction is requested.', 'pending')
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
    setText('connection-status', 'Connected · identity + transactions')
    setNotice('connection-message', 'Connected on Base. Contract reads use the fixed Base public RPC; transactions require explicit wallet approval.', 'pass')
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

  const connectionStable = () => (
    state.connectionVersion === connectionVersion
    && state.client === client
    && state.account === account
    && state.chainId === chainId
  )

  setNotice('connection-message', 'Reading fixed Base contracts…', 'pending')
  try {
    const depositorRole = await client.readContract({
      address: CONTRACTS.vault,
      abi: activationVaultAbi,
      functionName: 'DEPOSITOR_ROLE',
    })

    if (!connectionStable()) {
      throw new Error('Wallet connection changed during live verification.')
    }

    const contracts = [
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'nft2' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'tokenX' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'vault' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'tokenXDecimals' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'LOCK_DURATION' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'tokenY' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'decimals' },
      { address: CONTRACTS.toby, abi: tobyAbi, functionName: 'decimals' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'hasRole', args: [depositorRole, CONTRACTS.manager] },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'activationStarted' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'activationYCost' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'activationXAmount' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'minActivationY' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'maxActivationY' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'minActivationX' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'maxActivationX' },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'protocolCustody', args: [account] },
      { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'operationPaused', args: [ACTIVATION_OPERATION_ID] },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'balanceOf', args: [account] },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'allowance', args: [account, CONTRACTS.vault] },
      { address: CONTRACTS.toby, abi: tobyAbi, functionName: 'balanceOf', args: [account] },
      { address: CONTRACTS.toby, abi: tobyAbi, functionName: 'allowance', args: [account, CONTRACTS.manager] },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'txFee' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'burnFee' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'FeeAddress' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'owner' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'name' },
      { address: CONTRACTS.patience, abi: patienceAbi, functionName: 'symbol' },
      { address: CONTRACTS.toby, abi: tobyAbi, functionName: 'name' },
      { address: CONTRACTS.toby, abi: tobyAbi, functionName: 'symbol' },
      { address: CONTRACTS.lore, abi: nft2Abi, functionName: 'name' },
      { address: CONTRACTS.lore, abi: nft2Abi, functionName: 'symbol' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'balance' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'totalGrossQuoted' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'totalActuallyReceived' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'totalWithdrawn' },
      { address: CONTRACTS.vault, abi: activationVaultAbi, functionName: 'totalActivationsCollected' },
    ]

    const values = await client.multicall({
      contracts,
      allowFailure: false,
    })

    if (!connectionStable()) {
      throw new Error('Wallet connection changed during live verification.')
    }

    const [
      managerNft2,
      managerTokenX,
      managerVault,
      tokenXDecimals,
      lockDuration,
      vaultTokenY,
      patienceDecimals,
      tobyDecimals,
      managerHasDepositorRole,
      activationStarted,
      activationYCost,
      activationXAmount,
      minActivationY,
      maxActivationY,
      minActivationX,
      maxActivationX,
      protocolCustody,
      activationPaused,
      patienceBalance,
      patienceAllowance,
      tobyBalance,
      tobyAllowance,
      txFee,
      burnFee,
      feeAddress,
      patienceOwner,
      patienceName,
      patienceSymbol,
      tobyName,
      tobySymbol,
      loreName,
      loreSymbol,
      vaultBalance,
      totalGrossQuoted,
      totalActuallyReceived,
      totalWithdrawn,
      totalActivationsCollected,
    ] = values

    state.live = {
      chainId,
      managerNft2,
      managerTokenX,
      managerVault,
      tokenXDecimals,
      lockDuration,
      vaultTokenY,
      patienceDecimals,
      tobyDecimals,
      managerHasDepositorRole,
      activationStarted,
      activationYCost,
      activationXAmount,
      minActivationY,
      maxActivationY,
      minActivationX,
      maxActivationX,
      protocolCustody,
      activationPaused,
      patienceBalance,
      patienceAllowance,
      tobyBalance,
      tobyAllowance,
      txFee,
      burnFee,
      feeAddress,
      patienceOwner,
      patienceName,
      patienceSymbol,
      tobyName,
      tobySymbol,
      loreName,
      loreSymbol,
      vaultBalance,
      totalGrossQuoted,
      totalActuallyReceived,
      totalWithdrawn,
      totalActivationsCollected,
    }

    renderLiveProtocol()
    setNotice('connection-message', 'Live contract snapshot complete. Any mismatch is shown without correction.', 'pass')
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
    setVerdict('pass', 'Eligibility checks pass', 'Review the activation steps below and approve each transaction in your wallet.')
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

  // Capture state snapshot for stale-state detection
  state.preparedSnapshot = {
    connectionVersion: state.connectionVersion,
    provider: state.provider,
    client: state.client,
    account: state.account,
    chainId: state.chainId,
    tokenId: state.land.tokenId,
    transferNonce: state.land.transferNonce,
    activationYCost: state.live.activationYCost,
    activationXAmount: state.live.activationXAmount,
    txFee: state.live.txFee,
    burnFee: state.live.burnFee,
    feeAddress: state.live.feeAddress,
    patienceOwner: state.live.patienceOwner,
  }

  setText('review-patience-token', review.patience.token)
  setText('review-patience-spender', review.patience.spender)
  setText('review-patience-amount', `${formatToken(review.patience.exactAmount)} PATIENCE`)
  setText('review-patience-current', `${formatToken(review.patience.currentAllowance)} PATIENCE`)
  setText('review-patience-state', review.patience.allowanceSufficient ? 'Existing allowance is sufficient — approval skippable' : 'Exact allowance required — approval needed')

  setText('review-toby-token', review.toby.token)
  setText('review-toby-spender', review.toby.spender)
  setText('review-toby-amount', `${formatToken(review.toby.exactAmount)} TOBY`)
  setText('review-toby-current', `${formatToken(review.toby.currentAllowance)} TOBY`)
  setText('review-toby-state', review.toby.allowanceSufficient ? 'Existing allowance is sufficient — approval skippable' : 'Exact allowance required — approval needed')

  setText('review-activation-target', review.activation.target)
  setText('review-token-id', formatRaw(review.activation.tokenId))
  setText('review-max-y', `${formatToken(review.activation.maxYIn)} PATIENCE`)
  setText('review-expected-x', `${formatToken(review.activation.expectedXAmount)} TOBY`)
  setText('review-deadline', 'Set immediately before activation signing')
  setText('review-lore-approval', review.loreApprovalRequired ? 'YES' : 'NO')

  // Enable step buttons based on eligibility and allowance state
  const patienceNeeded = !review.patience.allowanceSufficient
  const tobyNeeded = !review.toby.allowanceSufficient

  if (eligible) {
    setNotice('transaction-review-status', 'Fresh values loaded. Approve each transaction in your wallet. Allowances already sufficient are skippable.', 'pass')
    btnPatienceApprove.disabled = !patienceNeeded
    btnTobyApprove.disabled = !tobyNeeded
    btnActivate.disabled = patienceNeeded || tobyNeeded
    setStepStatus('patience-step-status', patienceNeeded ? '' : '✓ Sufficient', patienceNeeded ? '' : 'pass')
    setStepStatus('toby-step-status', tobyNeeded ? '' : '✓ Sufficient', tobyNeeded ? '' : 'pass')
    setStepStatus('activate-step-status', (patienceNeeded || tobyNeeded) ? 'Waiting for allowances' : 'Ready', (patienceNeeded || tobyNeeded) ? 'pending' : '')
  } else {
    setNotice('transaction-review-status', 'Eligibility not established. Resolve issues in sections 02–05 before activating.', 'fail')
    btnPatienceApprove.disabled = true
    btnTobyApprove.disabled = true
    btnActivate.disabled = true
    clearStepStatuses()
  }
}

/**
 * Mechanically shared full fresh transaction gate.
 * Used before EVERY approval and before activation.
 * Any failure invalidates the prepared transaction and forces a fresh Land check.
 */
function ensurePreparedConnectionStable(snap, label) {
  if (!snap) throw new Error(`${label}: No prepared snapshot. Run a fresh Land check first.`)
  if (state.connectionVersion !== snap.connectionVersion) throw new Error(`${label}: Wallet connection changed.`)
  if (state.provider !== snap.provider) throw new Error(`${label}: Wallet provider changed.`)
  if (state.client !== snap.client) throw new Error(`${label}: Base read client changed.`)
  if (state.account !== snap.account) throw new Error(`${label}: Connected account changed.`)
  if (state.chainId !== snap.chainId || state.chainId !== BASE_CHAIN_ID) {
    throw new Error(`${label}: Wallet must remain on Base chain (8453).`)
  }
  if (!state.land || state.land.tokenId !== snap.tokenId) {
    throw new Error(`${label}: Lore Land selection changed.`)
  }
}

function invalidatePreparedTransaction(message) {
  state.preparedSnapshot = null
  disableAllStepButtons()
  setText('review-deadline', 'UNSET — fresh Land check required')
  setNotice('transaction-review-status', message, 'fail')
}

async function freshTransactionGate(label, { requireAllowances = false } = {}) {
  const snap = state.preparedSnapshot

  try {
    ensurePreparedConnectionStable(snap, label)

    // The gate owns the refresh. Callers must not rely on previously cached
    // protocol values before a write.
    const liveFresh = await loadLiveProtocol()
    if (!liveFresh || !state.live) {
      throw new Error(`${label}: Fresh protocol verification failed.`)
    }

    ensurePreparedConnectionStable(snap, label)

    const liveChecks = bindingChecks(state.live)
    if (!liveChecks.every(c => c.pass)) throw new Error(`${label}: Live protocol bindings drifted.`)
    if (!state.live.managerHasDepositorRole) throw new Error(`${label}: ActivationManager lacks DEPOSITOR_ROLE.`)

    if (state.live.txFee !== snap.txFee || state.live.burnFee !== snap.burnFee) {
      throw new Error(`${label}: PATIENCE fee configuration changed. Run a fresh Land check.`)
    }
    if (!isAddressEqual(state.live.feeAddress, snap.feeAddress)) {
      throw new Error(`${label}: PATIENCE FeeAddress changed. Run a fresh Land check.`)
    }
    if (!isAddressEqual(state.live.patienceOwner, snap.patienceOwner)) {
      throw new Error(`${label}: PATIENCE owner changed. Run a fresh Land check.`)
    }

    if (
      state.live.activationYCost !== snap.activationYCost
      || state.live.activationXAmount !== snap.activationXAmount
    ) {
      throw new Error(`${label}: Protocol economics changed. Run a fresh Land check.`)
    }

    if (state.live.protocolCustody) throw new Error(`${label}: Protocol custody is true.`)
    if (!state.live.activationStarted) throw new Error(`${label}: Activation is not started.`)
    if (state.live.activationPaused) throw new Error(`${label}: Activation operation is paused.`)

    if (state.live.activationYCost > state.live.maxActivationY || state.live.activationYCost < state.live.minActivationY) {
      throw new Error(`${label}: PATIENCE cost outside live protocol range.`)
    }
    if (state.live.activationXAmount > state.live.maxActivationX || state.live.activationXAmount < state.live.minActivationX) {
      throw new Error(`${label}: TOBY requirement outside live protocol range.`)
    }

    if (state.live.patienceBalance < state.live.activationYCost) throw new Error(`${label}: PATIENCE balance insufficient.`)
    if (state.live.tobyBalance < state.live.activationXAmount) throw new Error(`${label}: TOBY balance insufficient.`)

    const [
      currentNonce,
      owner,
      freshIsActive,
    ] = await state.client.multicall({
      contracts: [
        { address: CONTRACTS.lore, abi: nft2Abi, functionName: 'transferNonce', args: [snap.tokenId] },
        { address: CONTRACTS.lore, abi: nft2Abi, functionName: 'ownerOf', args: [snap.tokenId] },
        { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'isActive', args: [snap.tokenId] },
      ],
      allowFailure: false,
    })

    ensurePreparedConnectionStable(snap, label)

    if (currentNonce !== snap.transferNonce) {
      throw new Error(`${label}: Lore Land ownership nonce changed. Run a fresh Land check.`)
    }

    if (!isAddressEqual(getAddress(owner), state.account)) {
      throw new Error(`${label}: Connected account is not the owner of the Lore Land.`)
    }

    if (freshIsActive) throw new Error(`${label}: Lore Land is already active.`)

    const freshPatienceAllowance = state.live.patienceAllowance
    const freshTobyAllowance = state.live.tobyAllowance

    if (requireAllowances) {
      if (freshPatienceAllowance < state.live.activationYCost) {
        throw new Error(`${label}: PATIENCE allowance insufficient.`)
      }
      if (freshTobyAllowance < state.live.activationXAmount) {
        throw new Error(`${label}: TOBY allowance insufficient.`)
      }
    }

    return Object.freeze({
      snap,
      provider: state.provider,
      client: state.client,
      account: state.account,
      currentNonce,
      owner: getAddress(owner),
      activationYCost: state.live.activationYCost,
      activationXAmount: state.live.activationXAmount,
      freshPatienceAllowance,
      freshTobyAllowance,
    })
  } catch (error) {
    state.preparedSnapshot = null
    throw error
  }
}

async function handlePatienceApprove() {
  if (btnPatienceApprove.disabled) return
  disableAllStepButtons()
  setStepStatus('patience-step-status', 'Running full fresh transaction gate…', 'pending')

  try {
    const gate = await freshTransactionGate('PATIENCE approve')
    const required = gate.activationYCost

    if (gate.freshPatienceAllowance >= required) {
      state.live.patienceAllowance = gate.freshPatienceAllowance
      renderTransactionReview(true)
      setStepStatus('patience-step-status', '✓ Allowance already sufficient', 'pass')
      return
    }

    const tx = buildPatienceApprove(required)
    ensurePreparedConnectionStable(gate.snap, 'PATIENCE approve')

    setStepStatus(
      'patience-step-status',
      `Wallet review: exact ${formatToken(required)} PATIENCE allowance to ActivationVault`,
      'pending',
    )

    const txHash = await gate.provider.request({
      method: 'eth_sendTransaction',
      params: [{ from: gate.account, to: tx.to, data: tx.data, value: tx.value }],
    })

    setStepStatus('patience-step-status', 'Submitted · waiting for successful Base receipt…', 'pending')
    await waitForReceipt(gate.client, txHash)

    const postGate = await freshTransactionGate('PATIENCE approval confirmation')
    if (postGate.freshPatienceAllowance < required) {
      throw new Error('PATIENCE approval confirmed but the fresh allowance is still insufficient.')
    }

    state.live.patienceAllowance = postGate.freshPatienceAllowance
    renderTransactionReview(true)
    setStepStatus('patience-step-status', '✓ Exact allowance approved and confirmed', 'pass')
  } catch (error) {
    const rejected = isUserRejection(error)
    setStepStatus(
      'patience-step-status',
      rejected ? 'Rejected in wallet — no retry' : `Stopped: ${readableError(error)}`,
      'fail',
    )
    invalidatePreparedTransaction(
      rejected
        ? 'PATIENCE approval rejected in wallet — no retry. Run a fresh Land check to try again.'
        : `PATIENCE approval stopped: ${readableError(error)} Run a fresh Land check before retrying.`,
    )
  }
}

async function handleTobyApprove() {
  if (btnTobyApprove.disabled) return
  disableAllStepButtons()
  setStepStatus('toby-step-status', 'Running full fresh transaction gate…', 'pending')

  try {
    const gate = await freshTransactionGate('TOBY approve')
    const required = gate.activationXAmount

    if (gate.freshTobyAllowance >= required) {
      state.live.tobyAllowance = gate.freshTobyAllowance
      renderTransactionReview(true)
      setStepStatus('toby-step-status', '✓ Allowance already sufficient', 'pass')
      return
    }

    const tx = buildTobyApprove(required)
    ensurePreparedConnectionStable(gate.snap, 'TOBY approve')

    setStepStatus(
      'toby-step-status',
      `Wallet review: exact ${formatToken(required)} TOBY allowance to ActivationManager`,
      'pending',
    )

    const txHash = await gate.provider.request({
      method: 'eth_sendTransaction',
      params: [{ from: gate.account, to: tx.to, data: tx.data, value: tx.value }],
    })

    setStepStatus('toby-step-status', 'Submitted · waiting for successful Base receipt…', 'pending')
    await waitForReceipt(gate.client, txHash)

    const postGate = await freshTransactionGate('TOBY approval confirmation')
    if (postGate.freshTobyAllowance < required) {
      throw new Error('TOBY approval confirmed but the fresh allowance is still insufficient.')
    }

    state.live.tobyAllowance = postGate.freshTobyAllowance
    renderTransactionReview(true)
    setStepStatus('toby-step-status', '✓ Exact allowance approved and confirmed', 'pass')
  } catch (error) {
    const rejected = isUserRejection(error)
    setStepStatus(
      'toby-step-status',
      rejected ? 'Rejected in wallet — no retry' : `Stopped: ${readableError(error)}`,
      'fail',
    )
    invalidatePreparedTransaction(
      rejected
        ? 'TOBY approval rejected in wallet — no retry. Run a fresh Land check to try again.'
        : `TOBY approval stopped: ${readableError(error)} Run a fresh Land check before retrying.`,
    )
  }
}

async function handleActivate() {
  if (btnActivate.disabled) return
  disableAllStepButtons()
  setStepStatus('activate-step-status', 'Running full pre-activation verification…', 'pending')

  try {
    const initialSnap = state.preparedSnapshot
    ensurePreparedConnectionStable(initialSnap, 'Activation')

    // Obtain the deadline source first. The full transaction gate below is
    // deliberately the final network verification before tx construction.
    const block = await state.client.getBlock({ blockTag: 'latest' })
    ensurePreparedConnectionStable(initialSnap, 'Activation')

    const gate = await freshTransactionGate('Activation', { requireAllowances: true })

    const deadline = block.timestamp + BigInt(DEADLINE_WINDOW_SECONDS)
    const deadlineDisplay = new Date(Number(deadline) * 1000).toUTCString()

    setText('review-deadline', `${formatRaw(deadline)} · ${deadlineDisplay}`)
    setStepStatus(
      'activate-step-status',
      `Wallet review: Lore #${formatRaw(gate.snap.tokenId)} · maxYIn ${formatToken(gate.activationYCost)} PATIENCE · expectedX ${formatToken(gate.activationXAmount)} TOBY · deadline ${deadlineDisplay}`,
      'pending',
    )

    const tx = buildActivate(
      gate.snap.tokenId,
      gate.activationYCost,
      gate.activationXAmount,
      deadline,
    )

    ensurePreparedConnectionStable(gate.snap, 'Activation')

    const txHash = await gate.provider.request({
      method: 'eth_sendTransaction',
      params: [{ from: gate.account, to: tx.to, data: tx.data, value: tx.value }],
    })

    setStepStatus('activate-step-status', 'Submitted · waiting for successful Base receipt…', 'pending')
    await waitForReceipt(gate.client, txHash)

    setStepStatus('activate-step-status', 'Receipt successful · verifying activation on-chain…', 'pending')

    const [
      verifiedIsActive,
      verifiedLockId,
      verifiedTransferNonce,
    ] = await gate.client.multicall({
      contracts: [
        { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'isActive', args: [gate.snap.tokenId] },
        { address: CONTRACTS.manager, abi: activationManagerAbi, functionName: 'activeLockId', args: [gate.snap.tokenId] },
        { address: CONTRACTS.lore, abi: nft2Abi, functionName: 'transferNonce', args: [gate.snap.tokenId] },
      ],
      allowFailure: false,
    })

    if (!verifiedIsActive) throw new Error('Receipt succeeded but isActive() is still false.')
    if (verifiedLockId === 0n) throw new Error('Receipt succeeded but activeLockId() is zero.')
    if (verifiedTransferNonce !== gate.currentNonce) {
      throw new Error('Activation receipt succeeded but the Lore ownership nonce changed.')
    }

    const lockRecord = await gate.client.readContract({
      address: CONTRACTS.manager,
      abi: activationManagerAbi,
      functionName: 'getLock',
      args: [verifiedLockId],
    })

    if (lockRecord.tokenId !== gate.snap.tokenId) throw new Error('Activation lock token ID mismatch.')
    if (!isAddressEqual(lockRecord.locker, gate.account)) throw new Error('Activation lock locker mismatch.')
    if (lockRecord.xAmount !== gate.activationXAmount) throw new Error('Activation lock TOBY amount mismatch.')
    if (lockRecord.ownershipNonceAtActivation !== gate.currentNonce) throw new Error('Activation lock ownership nonce mismatch.')
    if (lockRecord.withdrawn) throw new Error('Activation lock is unexpectedly marked withdrawn.')

    state.preparedSnapshot = null
    disableAllStepButtons()

    setStepStatus(
      'activate-step-status',
      `✓ Activation complete · Lock #${formatRaw(verifiedLockId)} · ${formatToken(lockRecord.xAmount)} TOBY locked`,
      'pass',
    )
    setNotice(
      'transaction-review-status',
      `Activation complete. Lock ID ${formatRaw(verifiedLockId)}, locker ${lockRecord.locker}, TOBY locked ${formatToken(lockRecord.xAmount)}, unlock ${new Date(Number(lockRecord.unlockTime) * 1000).toISOString()}.`,
      'pass',
    )
    setVerdict(
      'pass',
      'Lore Land activated',
      `Lock #${formatRaw(verifiedLockId)} · unlock ${new Date(Number(lockRecord.unlockTime) * 1000).toISOString()}`,
    )

    if (state.client === gate.client && state.account === gate.account && state.chainId === BASE_CHAIN_ID) {
      await loadLiveProtocol()
    }
  } catch (error) {
    const rejected = isUserRejection(error)
    setStepStatus(
      'activate-step-status',
      rejected ? 'Rejected in wallet — no retry' : `Stopped: ${readableError(error)}`,
      'fail',
    )
    invalidatePreparedTransaction(
      rejected
        ? 'Activation rejected in wallet — no retry. Run a fresh Land check to try again.'
        : `Activation stopped: ${readableError(error)} Run a fresh Land check before retrying.`,
    )
  }
}

function isUserRejection(error) {
  const msg = error?.message || ''
  const code = error?.code
  // EIP-1193 user rejection codes
  return code === 4001 || code === 'ACTION_REJECTED' || /user (rejected|denied)/i.test(msg) || /rejected/i.test(msg)
}

function disableAllStepButtons() {
  btnPatienceApprove.disabled = true
  btnTobyApprove.disabled = true
  btnActivate.disabled = true
}

function resetTransactionReview(message = 'Connect a Base wallet and check one Lore Land to enable activation.') {
  state.preparedSnapshot = null
  for (const id of [
    'review-patience-token', 'review-patience-spender', 'review-patience-amount', 'review-patience-current', 'review-patience-state',
    'review-toby-token', 'review-toby-spender', 'review-toby-amount', 'review-toby-current', 'review-toby-state',
    'review-activation-target', 'review-token-id', 'review-max-y', 'review-expected-x',
  ]) setText(id, '—')
  setText('review-deadline', 'UNSET')
  setText('review-lore-approval', 'NO')
  setNotice('transaction-review-status', message, 'pending')
  btnPatienceApprove.disabled = true
  btnTobyApprove.disabled = true
  btnActivate.disabled = true
  clearStepStatuses()
}

function clearStepStatuses() {
  setStepStatus('patience-step-status', '', '')
  setStepStatus('toby-step-status', '', '')
  setStepStatus('activate-step-status', '', '')
}

function renderBindingFailure(error) {
  byId('binding-checks').innerHTML = `<div class="binding fail"><span class="status-dot">×</span><div><strong>Live reads incomplete</strong><code>${escapeHtml(readableError(error))}</code><small>Eligibility fails closed.</small></div></div>`
}

function resetConnection() {
  state.connectionVersion += 1
  Object.assign(state, { provider: null, client: null, account: null, chainId: null, live: null, land: null, preparedSnapshot: null })
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

function setStepStatus(id, message, kind) {
  const element = byId(id)
  element.textContent = message
  element.className = `step-status${kind ? ' ' + kind : ''}`
}

function setText(id, value) {
  byId(id).textContent = value
}

function readableError(error) {
  return error?.shortMessage || error?.message || 'Unknown error'
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
