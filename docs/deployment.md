# Deployment

This app uses PostgreSQL and Drizzle migrations. Before the Next.js build, apply any pending migrations so the database matches the committed schema.

Use this **custom build command** on platforms that let you override the default build step (Render, Railway, Fly.io, etc.):

```bash
pnpm db:migrate && pnpm build
```

Set the **start command** to:

```bash
pnpm start
```

Commit schema and migration files from `pnpm db:sync` locally before deploying. Production builds only apply existing migrations—they do not regenerate the schema.

---

## What the build command does

| Step | Script | Purpose |
|------|--------|---------|
| 1 | `pnpm db:migrate` | Applies pending Drizzle migrations to the database |
| 2 | `pnpm build` | Runs `next build` to produce the production app |

### `pnpm db:migrate`

Runs `npx drizzle-kit migrate` against `DATABASE_URL`, applying SQL files from the `migrations/` directory.

### `pnpm db:sync` (local development only)

When you change Better Auth plugins or auth config, run this locally—not in production deploys:

```bash
pnpm db:sync
```

Defined in `package.json` as:

```bash
pnpm db:auth && pnpm db:gen && pnpm db:migrate
```

| Script | Command | Purpose |
|--------|---------|---------|
| `db:auth` | `npx auth generate -y` | Regenerates `src/database/schema.ts` from your Better Auth plugins |
| `db:gen` | `npx drizzle-kit generate` | Creates Drizzle migration SQL when the schema changed |
| `db:migrate` | `npx drizzle-kit migrate` | Applies pending migrations to the database |

After `db:sync`, commit the updated schema and any new files under `migrations/`.

---

## Required environment variables at build time

`db:migrate` connects to PostgreSQL during the build, so these must be available **before** the build starts—not only at runtime.

| Variable | Required at build | Description |
|----------|-------------------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Drizzle |

See [environment-variables.md](./environment-variables.md) for the full list (including runtime-only vars like `BETTER_AUTH_SECRET`).

---

## Platform examples

### Render

In your Web Service settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `pnpm db:migrate && pnpm build` |
| **Start Command** | `pnpm start` |

Attach a PostgreSQL instance and set `DATABASE_URL` (and other required vars) on the service. Render injects linked database URLs into the build environment automatically.

### Railway / Fly.io / similar

Use the same build and start commands. Ensure `DATABASE_URL` is set in the service environment before the build phase runs.

### Vercel

Vercel builds do not run against a persistent database by default. Options:

1. **Run migrations separately** — e.g. in CI or a one-off job: `pnpm db:migrate`, then deploy with the default `pnpm build`.
2. **Use a build hook** — if you configure `DATABASE_URL` for the build environment, set the build command to `pnpm db:migrate && pnpm build` in Project Settings → General → Build & Development Settings.

---

## Local production check

To verify the same flow locally:

```bash
pnpm db:migrate && pnpm build && pnpm start
```

Ensure `.env` (or exported vars) includes a valid `DATABASE_URL` pointing at a database you can migrate.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Build fails on `db:migrate` with connection error | `DATABASE_URL` missing or wrong during build |
| App starts but auth tables missing | Build command skipped `db:migrate`; migrations never ran |
| Runtime errors about missing columns | New migrations not committed; run `pnpm db:sync` locally, commit, redeploy |

After changing Better Auth plugins or adding columns, run `pnpm db:sync` locally and commit the updated schema and migration files before deploying.
