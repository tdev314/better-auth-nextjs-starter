# Deployment

This app uses PostgreSQL and Drizzle migrations. Before the Next.js build can succeed, the database schema must match the Better Auth configuration.

Use this **custom build command** on platforms that let you override the default build step (Render, Railway, Fly.io, etc.):

```bash
pnpm db:sync && pnpm build
```

Set the **start command** to:

```bash
pnpm start
```

---

## What the build command does

| Step | Script | Purpose |
|------|--------|---------|
| 1 | `pnpm db:sync` | Syncs the database schema with Better Auth, then applies migrations |
| 2 | `pnpm build` | Runs `next build` to produce the production app |

### `pnpm db:sync`

Defined in `package.json` as:

```bash
pnpm db:auth && pnpm db:gen && pnpm db:migrate
```

| Script | Command | Purpose |
|--------|---------|---------|
| `db:auth` | `npx auth generate -y` | Regenerates `src/database/schema.ts` from your Better Auth plugins |
| `db:gen` | `npx drizzle-kit generate` | Creates Drizzle migration SQL when the schema changed |
| `db:migrate` | `npx drizzle-kit migrate` | Applies pending migrations to the database |

When the committed schema and migrations are already up to date, `db:auth` and `db:gen` are effectively no-ops; `db:migrate` still runs and applies any pending migrations.

---

## Required environment variables at build time

`db:sync` connects to PostgreSQL during the build, so these must be available **before** the build starts—not only at runtime.

| Variable | Required at build | Description |
|----------|-------------------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Drizzle |
| `BETTER_AUTH_SECRET` | Yes | Used by Better Auth CLI during schema generation |
| `BETTER_AUTH_URL` | Recommended | Public URL of the auth server (e.g. `https://auth.example.com`) |

See [environment-variables.md](./environment-variables.md) for the full list.

---

## Platform examples

### Render

In your Web Service settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `pnpm db:sync && pnpm build` |
| **Start Command** | `pnpm start` |

Attach a PostgreSQL instance and set `DATABASE_URL` (and other required vars) on the service. Render injects linked database URLs into the build environment automatically.

### Railway / Fly.io / similar

Use the same build and start commands. Ensure `DATABASE_URL` is set in the service environment before the build phase runs.

### Vercel

Vercel builds do not run against a persistent database by default. Options:

1. **Run migrations separately** — e.g. in CI or a one-off job: `pnpm db:migrate`, then deploy with the default `pnpm build`.
2. **Use a build hook** — if you configure `DATABASE_URL` for the build environment, you can set the build command to `pnpm db:sync && pnpm build` in Project Settings → General → Build & Development Settings.

For most Vercel setups, committing migrations and running `pnpm db:migrate` in CI before deploy is simpler than syncing during the Vercel build.

---

## Local production check

To verify the same flow locally:

```bash
pnpm db:sync && pnpm build && pnpm start
```

Ensure `.env` (or exported vars) includes a valid `DATABASE_URL` pointing at a database you can migrate.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Build fails on `db:migrate` with connection error | `DATABASE_URL` missing or wrong during build |
| Build fails on `auth generate` | `BETTER_AUTH_SECRET` not set |
| App starts but auth tables missing | Build command skipped `db:sync`; migrations never ran |
| `drizzle-kit generate` creates new files every deploy | Schema in git is out of sync with `src/lib/auth.ts`; run `pnpm db:sync` locally, commit schema + migrations, redeploy |

After changing Better Auth plugins or adding columns, run `pnpm db:sync` locally and commit the updated schema and migration files before deploying.
