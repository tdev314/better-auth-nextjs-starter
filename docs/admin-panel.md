# Admin Panel -- OAuth Client Management

The admin panel lets administrators register, configure, and manage OAuth clients (internal applications) that authenticate against this auth server.

## Setup

### 1. Run the database migration

The admin plugin adds `role`, `banned`, `ban_reason`, and `ban_expires` columns to the `users` table. Apply the migration:

```bash
pnpm db:migrate
```

### 2. Promote the first admin user

Connect to your PostgreSQL database and set your user's role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 3. Access the panel

Once promoted, a gear icon appears in the header. Click it or navigate directly to:

```
/admin/clients
```

Non-admin users are redirected away automatically.

---

## Features

### Creating a client

1. Go to `/admin/clients` and click **New Client**.
2. Fill in the required fields:
   - **Application Name** -- display name shown on consent screens.
   - **Redirect URIs** -- one per line; at least one is required.
3. Optionally toggle:
   - **Skip consent screen** -- bypass user authorization prompt (recommended for first-party apps).
   - **Enable end session** -- allow RP-initiated logout.
4. Click **Create Client**.
5. Copy the **Client ID** and **Client Secret** immediately. The secret is displayed only once and cannot be retrieved later.

### Viewing and editing a client

Click a client name in the table to open its detail page. Fields are grouped into four sections:

| Section | Fields |
|---------|--------|
| **Basic Information** | Name, Application URL, Icon URL |
| **Behavior** | Skip Consent, Enable End Session, Require PKCE, Public Client, Disabled |
| **OAuth Configuration** | Redirect URIs, Scopes (`openid`, `profile`, `email`, `offline_access`), Grant Types (`authorization_code`, `refresh_token`, `client_credentials`) |
| **Legal & Contact** | Contact Emails, Terms of Service URL, Privacy Policy URL |

Click **Save Changes** to persist edits.

### Enabling / disabling a client

Use the three-dot menu on the client list to toggle a client between **Active** and **Disabled**. Disabled clients reject all authorization requests without being deleted.

### Rotating a client secret

On the client detail page, scroll to the **Danger Zone** and click **Rotate Secret**. A confirmation dialog appears. After confirming:

- A new secret is generated and displayed once.
- The previous secret is immediately invalidated.
- All applications using the old secret must be updated.

Public clients do not have secrets, so this option is hidden for them.

### Deleting a client

Click **Delete Client** from the row dropdown or the detail page's Danger Zone. Deletion is permanent and revokes all associated access tokens, refresh tokens, and consents.

---

## Route protection

The admin panel is protected at two levels:

1. **Middleware** (`src/middleware.ts`) -- unauthenticated requests to `/admin/*` are redirected to `/auth/sign-in`.
2. **Layout guard** (`src/app/admin/layout.tsx`) -- authenticated users without the `admin` role are redirected to `/`.
3. **Server actions** (`src/lib/actions/admin-clients.ts`) -- every action independently verifies `session.user.role === "admin"` before executing.

---

## Architecture

```
src/
├── app/admin/
│   ├── layout.tsx              # Admin shell with session/role guard
│   ├── page.tsx                # Redirects to /admin/clients
│   └── clients/
│       ├── page.tsx            # Client list (server component)
│       └── [id]/
│           └── page.tsx        # Client detail/edit (server component)
├── components/admin/
│   ├── client-table.tsx        # Table with row actions
│   ├── client-form.tsx         # Edit form with grouped fields
│   ├── create-client-dialog.tsx# Create dialog + secret reveal
│   └── redirect-uri-input.tsx  # Multi-value URI input
└── lib/actions/
    └── admin-clients.ts        # Server actions (CRUD + rotate + toggle)
```

### Server actions

| Action | Description |
|--------|-------------|
| `getClients()` | List all OAuth clients, ordered by creation date |
| `getClient(id)` | Fetch a single client by internal ID |
| `createClient(data)` | Register a new client via `auth.api.adminCreateOAuthClient()` |
| `updateClient(id, data)` | Update client fields directly via Drizzle |
| `deleteClient(id)` | Remove a client and cascade-delete tokens |
| `toggleClient(id, disabled)` | Enable or disable a client |
| `rotateClientSecret(clientId)` | Generate and hash a new secret (SHA-256, base64url) |

---

## Using a registered client

After creating a client, use the credentials in your internal application's OAuth flow:

```
Authorization endpoint:  {BETTER_AUTH_URL}/api/auth/oauth2/authorize
Token endpoint:          {BETTER_AUTH_URL}/api/auth/oauth2/token
Userinfo endpoint:       {BETTER_AUTH_URL}/api/auth/oauth2/userinfo
OIDC discovery:          {BETTER_AUTH_URL}/.well-known/openid-configuration
```

Standard OAuth 2.1 authorization code flow with the issued `client_id` and `client_secret`.
