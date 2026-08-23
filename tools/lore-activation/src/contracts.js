import { getAddress } from 'viem'

export const BASE_CHAIN_ID = 8453
export const EXPECTED_LOCK_DURATION = 7_776_000n
export const EXPECTED_DECIMALS = 18
// Source-pinned from the verified deployment: keccak256("ACTIVATION").
export const ACTIVATION_OPERATION_ID = '0xfa502000117f63b5e128376c49fb9ce174ea7d81f4e6aca78aec26b844e91f68'

export const CONTRACTS = Object.freeze({
  lore: getAddress('0x0495601Af6f86efb14C9D478eA46b2Aa09cB164A'),
  manager: getAddress('0xdAF88bf803765882A674bC9B2BCE20d47A7250f2'),
  toby: getAddress('0xb8D98a102b0079B69FFbc760C8d857A31653e56e'),
  vault: getAddress('0xD49c3F0dd67378Be76a1142Dfb9a5107F99a34DD'),
  patience: getAddress('0x6D96f18F00B815B2109A3766E79F6A7aD7785624'),
})

export const CONTRACT_LABELS = Object.freeze({
  lore: 'Canonical LORE / NFT2',
  manager: 'ActivationManager',
  vault: 'ActivationVault',
  patience: 'PATIENCE / Token Y',
  toby: 'TOBY / Token X',
})
