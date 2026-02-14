# RTCE - Real-Time Collaborative Document Editor

A production-quality, real-time collaborative document editor built with React, Node.js, Express, Socket.io, and PostgreSQL. Multiple users can edit the same document simultaneously with live cursor positions, presence indicators, version history, and permission-based access control.

## Architecture

```
Browser Client (React + Vite)
  |
  |-- REST API (Axios) --> Express Server
  |-- WebSocket (Socket.io) --> Socket.io Server
  |                                 |
  |                          Sync Engine (version-vector)
  |                                 |
  +-------- PostgreSQL <------------+
              |
           Redis (optional, presence/pub-sub)
```

**Frontend:** React 18, React Router v6, Socket.io-client, Axios, Vanilla CSS design system

**Backend:** Express 4, Socket.io 4, Knex.js (PostgreSQL), Zod validation, JWT + bcrypt auth

**Real-time sync:** Version-vector conflict resolution. The server validates every operation against the document version, applies if matched, or sends a full resync snapshot on mismatch. No data loss on concurrent edits.

## Quick Start

**Prerequisites:** Docker, Node.js 18+

```bash
# 1. Clone and set up environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 2. Start Postgres and Redis
docker-compose up -d

# 3. Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# 4. Run database migrations and seed
cd server
npx knex migrate:latest --knexfile knexfile.ts
npx knex seed:run --knexfile knexfile.ts
cd ..

# 5. Start development servers (in two terminals)
cd server && npm run dev
cd client && npm run dev
```

Open http://localhost:5173 in your browser. Use the demo accounts:
- alice@example.com / password123
- bob@example.com / password123

## Running Tests

```bash
# Backend (sync engine unit tests)
cd server && npm test

# Frontend (PresenceBar component test)
cd client && npm test
```

## Linting and Formatting

```bash
# Lint
cd server && npm run lint
cd client && npm run lint

# Format
cd server && npm run format
cd client && npm run format
```

## Key Features

- Real-time collaborative editing with Socket.io rooms
- Version-vector conflict resolution with automatic resync
- Live cursor positions and presence indicators per document
- Version history with snapshot creation, viewing, and restoring
- JWT authentication with bcrypt password hashing
- Document permission system (owner/editor/viewer)
- Zod input validation on all API endpoints
- Rate limiting and Helmet security headers
- Docker Compose for PostgreSQL and Redis
- TypeScript throughout, ESLint + Prettier configured
- Automated tests for sync engine and presence UI

## Database Schema

Five PostgreSQL tables: `users`, `documents`, `document_members`, `document_versions`, `ops_log`

Migrations are managed with Knex.js and located in `server/src/migrations/`.
## License

MIT
