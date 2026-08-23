import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Production build refuses to proceed without both required env vars.
  // Local dev falls back gracefully (VITE_BASE_RPC_URL defaults to public endpoint).
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), '')
    if (!env.VITE_WALLETCONNECT_PROJECT_ID?.trim()) {
      throw new Error('Production build requires VITE_WALLETCONNECT_PROJECT_ID')
    }
    if (!env.VITE_BASE_RPC_URL?.trim()) {
      throw new Error('Production build requires VITE_BASE_RPC_URL (domain-restricted RPC credential for browser exposure)')
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
