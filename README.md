# Better Auth Next.js Starter (App Router)

[Demo](https://nextjs.better-auth-starter.com)

- [Pages Router](https://github.com/daveyplate/better-auth-nextjs-pages-starter)
- [TanStack Start](https://github.com/daveyplate/better-auth-tanstack-starter)

## Installation

First, create a PostgreSQL Database then configure your environment variables.

You can generate a `BETTER_AUTH_SECRET` [here](https://www.better-auth.com/docs/installation#set-environment-variables).

```bash
BETTER_AUTH_SECRET=""
DATABASE_URL=""
```

Then generate the Better Auth schema and run Drizzle migrations:

```bash
pnpm db:sync
```

This runs `db:auth` → `db:gen` → `db:migrate` (Better Auth schema generation, Drizzle migration generation, and migration apply).

- Twitter: [@daveycodez](https://x.com/daveycodez)

☕️ [Buy me a coffee](https://buymeacoffee.com/daveycodez)

## Documentation

- [Deployment (custom build command)](docs/deployment.md)
- [Environment variables](docs/environment-variables.md)
- [Admin panel & OAuth clients](docs/admin-panel.md)
- [TypeScript: better-invite plugin inference](docs/typescript-better-invite.md)

## Features:

[Better Auth](https://better-auth.com)

[Better Auth UI](https://better-auth-ui.com)

[shadcn/ui](https://ui.shadcn.com)

[TailwindCSS](https://tailwindcss.com)

[Drizzle ORM](https://orm.drizzle.team)

[PostgreSQL](https://postgresql.org)

[Biome](https://biomejs.dev)

[Next.js](https://nextjs.org)

[Turborepo](https://turbo.build)

## Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

This app needs the database migrated before the Next.js build. On Render, Railway, and similar hosts, set the **build command** to:

```bash
pnpm db:sync && pnpm build
```

and the **start command** to `pnpm start`.

See [docs/deployment.md](docs/deployment.md) for platform-specific notes, required build-time env vars, and troubleshooting.
