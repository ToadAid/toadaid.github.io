import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Production build refuses to proceed without both required env vars.
  // Local dev falls back gracefully (VITE_BASE_RPC_URL defaults to public endpoint).
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), '')
    const projectId = env.VITE_WALLETCONNECT_PROJECT_ID?.trim()
    const rpcUrl = env.VITE_BASE_RPC_URL?.trim()

    if (!projectId) {
      throw new Error('Production build requires VITE_WALLETCONNECT_PROJECT_ID')
    }
    if (!rpcUrl) {
      throw new Error('Production build requires VITE_BASE_RPC_URL (domain-restricted RPC credential for browser exposure)')
    }

    const forbidden = ['dummy', 'changeme', 'example']
    if (forbidden.some(f => projectId.toLowerCase().includes(f))) {
      throw new Error('VITE_WALLETCONNECT_PROJECT_ID cannot be a placeholder')
    }
    if (forbidden.some(f => rpcUrl.toLowerCase().includes(f))) {
      throw new Error('VITE_BASE_RPC_URL cannot be a placeholder')
    }
  }
  return {
    base: '/lore-activation/',
    build: {
      outDir: '../../lore-activation',
      emptyOutDir: true,
    },
  }
})
