function read(name, inputs, outputs) {
  return { type: 'function', name, stateMutability: 'view', inputs, outputs }
}

const tokenReadAbi = [
  read('name', [], [{ type: 'string' }]),
  read('symbol', [], [{ type: 'string' }]),
  read('decimals', [], [{ type: 'uint8' }]),
  read('balanceOf', [{ name: 'account', type: 'address' }], [{ type: 'uint256' }]),
  read('allowance', [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], [{ type: 'uint256' }]),
]

export const activationManagerAbi = [
  read('nft2', [], [{ type: 'address' }]),
  read('tokenX', [], [{ type: 'address' }]),
  read('vault', [], [{ type: 'address' }]),
  read('tokenXDecimals', [], [{ type: 'uint8' }]),
  read('LOCK_DURATION', [], [{ type: 'uint256' }]),
  read('activationStarted', [], [{ type: 'bool' }]),
  read('activationYCost', [], [{ type: 'uint256' }]),
  read('activationXAmount', [], [{ type: 'uint256' }]),
  read('minActivationY', [], [{ type: 'uint256' }]),
  read('maxActivationY', [], [{ type: 'uint256' }]),
  read('minActivationX', [], [{ type: 'uint256' }]),
  read('maxActivationX', [], [{ type: 'uint256' }]),
  read('protocolCustody', [{ name: 'account', type: 'address' }], [{ type: 'bool' }]),
  read('isActive', [{ name: 'tokenId', type: 'uint256' }], [{ type: 'bool' }]),
  read('activeLockId', [{ name: 'tokenId', type: 'uint256' }], [{ type: 'uint256' }]),
  read('getLock', [{ name: 'lockId', type: 'uint256' }], [{
    type: 'tuple',
    components: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'locker', type: 'address' },
      { name: 'xAmount', type: 'uint256' },
      { name: 'startTime', type: 'uint64' },
      { name: 'unlockTime', type: 'uint64' },
      { name: 'ownershipNonceAtActivation', type: 'uint256' },
      { name: 'withdrawn', type: 'bool' },
    ],
  }]),
  read('operationPaused', [{ name: 'operation', type: 'bytes32' }], [{ type: 'bool' }]),
]

export const activationVaultAbi = [
  read('tokenY', [], [{ type: 'address' }]),
  read('DEPOSITOR_ROLE', [], [{ type: 'bytes32' }]),
  read('hasRole', [{ name: 'role', type: 'bytes32' }, { name: 'account', type: 'address' }], [{ type: 'bool' }]),
  read('balance', [], [{ type: 'uint256' }]),
  read('totalGrossQuoted', [], [{ type: 'uint256' }]),
  read('totalActuallyReceived', [], [{ type: 'uint256' }]),
  read('totalWithdrawn', [], [{ type: 'uint256' }]),
  read('totalActivationsCollected', [], [{ type: 'uint256' }]),
]

export const patienceAbi = [
  ...tokenReadAbi,
  read('txFee', [], [{ type: 'uint256' }]),
  read('burnFee', [], [{ type: 'uint256' }]),
  read('FeeAddress', [], [{ type: 'address' }]),
  read('owner', [], [{ type: 'address' }]),
]

export const tobyAbi = tokenReadAbi

export const nft2Abi = [
  read('name', [], [{ type: 'string' }]),
  read('symbol', [], [{ type: 'string' }]),
  read('ownerOf', [{ name: 'tokenId', type: 'uint256' }], [{ type: 'address' }]),
  read('transferNonce', [{ name: 'tokenId', type: 'uint256' }], [{ type: 'uint256' }]),
  read('accountOf', [{ name: 'tokenId', type: 'uint256' }], [{ type: 'address' }]),
]
