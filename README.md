# ThreadSphere

A modern community forum platform — create communities, post threads with tags, connect with users, and get real-time notifications.

**UI brand:** ThreadSphere · **Accent:** deep red · **Layout:** 3-column (sidebar · feed · widgets)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router), Tailwind CSS, Tiptap |
| Backend | Express, Socket.io |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Validation | Zod (shared schemas) |
| Knowledge graph | [Graphify](https://graphify.net/) |

## Quick Start

```bash
# Install dependencies
npm install

# Start Postgres + Redis
docker compose up -d

# Copy env
cp .env.example apps/api/.env

# Run dev (web :3000, api :4000)
npm run dev
```

## Project Structure

```
apps/web/           → Next.js frontend
apps/api/           → Express + Socket.io API
packages/shared/    → Zod schemas & constants
docs/PROGRESS.md    → Living progress tracker
docs/ARCHITECTURE.md → System design & diagrams
```

## Documentation

- [Development Progress](./docs/PROGRESS.md) — task tracker & session log
- [Architecture](./docs/ARCHITECTURE.md) — diagrams, data model, API plan

## Graphify

This project uses [Graphify](https://graphify.net/) to maintain a queryable knowledge graph of the codebase.

```bash
graphify build                              # Rebuild graph
graphify query "how does auth validation work?"
```

In Cursor, use `/graphify` or query via the graphify rule in `.cursor/rules/`.

## License

Private — saadsrabon/threadforum
