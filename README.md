# Twitter Clone

A Twitter-style social platform built with Next.js, TypeORM, and PostgreSQL. Includes an MCP (Model Context Protocol) server for AI-agent interaction.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Auth:** JWT (`jose`) + bcrypt
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **MCP:** `@modelcontextprotocol/sdk` for AI-agent integration

## Features

- User registration & login (JWT-based sessions)
- Create, read, update, and delete posts
- Like and reply to posts
- Follow/unfollow users
- Timeline feed
- User profiles (view + edit)
- File uploads
- Explore feed
- Middleware-based route protection
- MCP server exposing app capabilities to AI agents

## Project Structure

```
src/
├── app/                # Next.js app router
│   ├── (auth)/         # Login & register pages
│   ├── (main)/         # Authenticated pages (explore, timeline, profile)
│   └── api/            # API routes (posts, users, timeline, like, reply, follow)
├── components/         # React components (posts, profile, layout)
├── lib/
│   ├── auth/           # JWT, password hashing, sessions
│   ├── db/             # TypeORM data source, entities, migrations
│   └── validations/    # Zod schemas
├── mcp/                # MCP server entry point
└── middleware.ts       # Route protection
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 6. (Optional) Start the MCP server

```bash
npm run mcp
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run mcp` | Start the MCP server |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Roll back the last migration |
| `npm run migration:generate` | Generate a new migration |

## Environment Variables

See `.env.example` for the full list. Key variables:

- `POSTGRES_*` — database connection
- `DATABASE_URL` — TypeORM connection string
- `JWT_SECRET` / `JWT_EXPIRES_IN` — auth token config
- `NEXT_PUBLIC_APP_URL` — public app URL

## License

Private project — all rights reserved.
