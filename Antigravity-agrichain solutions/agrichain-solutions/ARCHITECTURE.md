# Architecture Overview

## High‑level architecture
- **Next.js 16 App Router** – Server‑first rendering with dynamic routing.
- **Prisma 7 + PostgreSQL** – Type‑safe ORM, migration through `prisma migrate`.
- **NextAuth v5** – JWT based authentication with custom callbacks.
- **Blockchain layer** – Solidity contracts deployed on EVM compatible networks; anchor data exposed via JSON RPC.
- **Marketplace** – Server Actions for cart, checkout; middleware for protection.
- **Real‑time logistics** – Socket.IO server with JWT authentication, data cached in PostgreSQL.
- **RSS** – See Flow diagrams...etc
