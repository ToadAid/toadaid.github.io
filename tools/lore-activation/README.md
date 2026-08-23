# Lore Activation Helper source

This isolated Vite project builds the read-only static preview served at
`/lore-activation/`. Run `npm ci`, `npm test`, and `npm run build` here.

WalletConnect is intentionally disabled unless an operator supplies the public
Reown project identifier at build time. Copy `.env.example` to `.env.local`, set
`VITE_WALLETCONNECT_PROJECT_ID`, and rebuild. Do not commit `.env.local`.

All chain reads use the connected WalletConnect provider. No external RPC URL,
transaction method, approval flow, or activation flow is included in Stage 1.
