| ID | Decision | Reason |
|----|----------|--------|
| D1 | Realtime via **Socket.IO** on NestJS gateways with **Redis adapter** | Built-in reconnect, rooms, acks, fallbacks, horizontal scaling |
| D2 | **NTP-style clock sync** per client (Section 14.2) | Wall clocks differ; playback math needs a shared timeline |
| D3 | **Mesh** WebRTC for ≤4 participants behind a `MediaTransport` interface; SFU (LiveKit or mediasoup) later | Fast to ship; swap without UI rewrite |
| D4 | **coturn** with short-lived HMAC credentials | NAT traversal; no static secrets in clients |
| D5 | **Server-authoritative playback** in Redis; clients send *requests*, server publishes canonical state | Prevents races and malicious control |
| D6 | **MediaProvider** interface; v1 providers: YouTube IFrame API, direct URL (user-owned/licensed) | Legal and technical clarity |
| D7 | **Pre-render marketing/guides** at build time; app and `/r/:code` stay client-rendered | SPA is weak for SEO; avoid framework migration |
| D8 | Room code is public; **session token** authorizes | Codes are shareable, not secret |
| D9 | **Zod** single source of truth; types inferred with `z.infer` | One schema for client, server, tests |
| D10 | **pnpm + Turborepo** monorepo (unless audit shows a better existing structure) | Shared contracts, cached builds |
| D11 | **Mongoose** behind repository classes; services never import Mongoose models directly | Testability, mild portability |
| D12 | Messages are **persisted with TTL**; reactions, typing, presence and playback ticks are **ephemeral** | Privacy and cost |
