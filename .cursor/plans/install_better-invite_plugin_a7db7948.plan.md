---
name: Install better-invite plugin
overview: Install the `better-invite` package and wire it into the existing Better Auth server and client configs, then run the database migration.
todos:
  - id: install-pkg
    content: Install `better-invite` with pnpm
    status: completed
  - id: server-plugin
    content: Add `invite()` plugin to `src/lib/auth.ts`
    status: completed
  - id: client-plugin
    content: Add `inviteClient()` plugin to `src/lib/auth-client.ts`
    status: completed
  - id: migrate-db
    content: Run `pnpm dlx @better-auth/cli migrate`
    status: completed
isProject: false
---

# Install better-invite Plugin

## 1. Install the package

```bash
pnpm add better-invite
```

## 2. Add server plugin to [src/lib/auth.ts](src/lib/auth.ts)

- Import `invite` from `"better-invite"`
- Add `invite()` to the `plugins` array (after `admin()` since it depends on it)
- Use a minimal placeholder for the `sendUserInvitation` callback (console.log)

```ts
import { invite } from "better-invite";

// inside plugins array:
invite({
  async sendUserInvitation({ email, role, url, token, newAccount }) {
    console.log(`[Invite] ${email} (role: ${role}, new: ${newAccount}): ${url}`);
  },
}),
```

## 3. Add client plugin to [src/lib/auth-client.ts](src/lib/auth-client.ts)

- Import `inviteClient` from `"better-invite"`
- Add `inviteClient()` to the `plugins` array

```ts
import { inviteClient } from "better-invite";

// inside plugins array:
inviteClient(),
```

## 4. Run database migration

```bash
pnpm dlx @better-auth/cli migrate
```

This will add the necessary invitation table(s) to the PostgreSQL database.
