# RATRI - Master Guidelines

## Product Vision
Ratri is a real-time social room platform where people can create or join a room and spend time together online without a mandatory signup. The Room is the central domain object.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, NestJS, Socket.IO
- **Database:** MongoDB
- **Real-time / Cache:** Redis
- **Media:** WebRTC for voice, video, screen share
- **Monorepo:** pnpm + Turborepo

## Design & UI
- Original, warm, social, confident, and human design language.
- DO NOT use generic AI/SaaS glowing gradients.
- Typography: Readable, humanistic.
- Icons: Lucide.
- Mobile UX is a first-class citizen.

## Core Rules
- **No fake content:** Don't invent statistics, testimonials, or placeholders.
- **Server Authority:** The server is authoritative for room states, roles, and playback logic.
- **Reliability:** Implement robust WebRTC connection and reconnect handling.
- **Phase Approach:** Follow Phase 0 to Phase 6 incrementally.

## Phases
1. **Phase 1 (Foundation):** Monorepo, CI, Docker Compose, DB schemas, room creation/join UI.
2. **Phase 2 (Real-time Core):** Presence, chat, permissions, moderation.
3. **Phase 3 (Synchronized Media):** Playback engine, drift correction, YouTube/Direct media.
4. **Phase 4 (WebRTC):** Voice, video, screen sharing.
5. **Phase 5 (Polish & Hardening):** Accessibility, SEO, load testing, security review.
6. **Phase 6 (Distribution):** Desktop (Tauri), Mobile (React Native).
