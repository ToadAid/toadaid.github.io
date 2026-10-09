// Use the host wallet only in a verified Farcaster Mini App. Merely importing
// the SDK also exposes a bridge in normal browsers, where it cannot serve RPC.
export function createWalletBridge({
  browser = window,
  loadSdk = () => import('https://esm.sh/@farcaster/miniapp-sdk@0.2.3'),
  timeoutMs = 1500,
} = {}) {
  let sdkPromise;
  const announced = new Map();
  browser.addEventListener?.('eip6963:announceProvider', event => {
    const detail = event.detail;
    if (typeof detail?.provider?.request !== 'function') return;
    announced.set(detail.provider, {
      provider: detail.provider, mode: 'Browser',
      name: typeof detail.info?.name === 'string' ? detail.info.name.slice(0,80) : 'Browser wallet',
    });
  });
  function requestDiscovery() {
    if (browser.dispatchEvent) browser.dispatchEvent(new Event('eip6963:requestProvider'));
  }
  requestDiscovery();
  function bounded(promise) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Mini App host did not respond')), timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
  }
  function initialize() {
    if (!sdkPromise) sdkPromise = (async () => {
      try {
        const mod = await bounded(loadSdk());
        const sdk = mod?.sdk;
        if (!sdk || typeof sdk.isInMiniApp !== 'function' ||
            !await bounded(sdk.isInMiniApp(timeoutMs))) return null;
        // ready is host-only, and must never prevent browser controls loading.
        if (sdk.actions?.ready) bounded(sdk.actions.ready()).catch(() => {});
        return sdk;
      } catch { return null; }
    })();
    return sdkPromise;
  }
  async function candidates() {
    const result = [];
    const add = (provider, mode, name = 'Browser wallet') => {
      if (typeof provider?.request === 'function' && !result.some(x => x.provider === provider)) {
        result.push({ provider, mode, name });
      }
    };
    const sdk = await initialize();
    if (sdk?.wallet?.getEthereumProvider) {
      try { add(await bounded(sdk.wallet.getEthereumProvider()), 'Mini App', 'Mini App wallet'); } catch {}
    }
    requestDiscovery();
    for (const entry of announced.values()) add(entry.provider, entry.mode, entry.name);
    // EIP-6963 names distinct wallets without the shared window.ethereum race.
    // Legacy injection is only a fallback if no extension announced itself.
    if (announced.size) return result;
    // Some extensions expose several providers instead of one active wallet.
    for (const provider of browser.ethereum?.providers || []) add(provider, 'Browser');
    add(browser.ethereum, 'Browser');
    add(browser.coinbaseWalletExtension, 'Browser', 'Coinbase Wallet');
    return result;
  }
  async function connect(selection) {
    const available = await candidates();
    const options = selection ? available.filter(x => x.provider === selection.provider) : available;
    if (!options.length) throw new Error('No wallet detected. Open this page in your wallet browser or enable a browser wallet extension.');
    let lastError;
    for (const { provider, mode } of options) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const address = Array.isArray(accounts) ? accounts[0] : null;
        if (typeof address !== 'string' || !/^0x[0-9a-f]{40}$/i.test(address)) {
          throw new Error('The wallet did not return a valid account.');
        }
        return { provider, address, mode, name: options.find(x => x.provider === provider)?.name };
      } catch (error) {
        // Never prompt another wallet after the user declines a connection.
        if (Number(error?.code) === 4001) throw error;
        lastError = error;
      }
    }
    throw lastError || new Error('Wallet connection unavailable.');
  }
  async function composeCast(payload) {
    const sdk = await initialize();
    if (typeof sdk?.actions?.composeCast !== 'function') return 'unavailable';
    try {
      // Posting waits for the user's decision. Do not time out a live composer
      // and open a second one while the first is still awaiting confirmation.
      const result = await sdk.actions.composeCast(payload);
      return result?.cast ? 'posted' : 'cancelled';
    } catch { return 'unavailable'; }
  }
  return { initialize, listWallets: candidates, connect, composeCast };
}
