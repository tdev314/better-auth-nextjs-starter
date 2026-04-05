---
name: OAuth Provider Full Setup
overview: Complete the Better Auth OAuth 2.1 Provider setup with OIDC, MCP support, consent page, .well-known discovery endpoints, dynamic client registration, and an MCP handler route.
todos:
  - id: fix-auth-config
    content: "Fix auth.ts: loginPage, disabledPaths, scopes, validAudiences, dynamic registration, allowPublicClientPrelogin"
    status: completed
  - id: consent-page
    content: Create src/app/consent/page.tsx with client info display, scope list, and accept/deny buttons
    status: completed
  - id: well-known-oidc
    content: Create src/app/.well-known/openid-configuration/route.ts
    status: completed
  - id: well-known-oauth-as
    content: Create src/app/.well-known/oauth-authorization-server/route.ts
    status: completed
  - id: well-known-resource
    content: Create src/app/.well-known/oauth-protected-resource/route.ts
    status: completed
  - id: install-mcp-deps
    content: Install mcp-handler and zod dependencies
    status: completed
  - id: mcp-handler-route
    content: Create src/app/api/mcp/[transport]/route.ts with mcpHandler and sample echo tool
    status: completed
  - id: create-client-script
    content: Create scripts/create-oauth-client.ts for bootstrapping the first OAuth client
    status: completed
  - id: env-vars
    content: Add OAUTH_AUDIENCE and OAUTH_ISSUER to .env.example
    status: completed
  - id: middleware-update
    content: Update middleware.ts to protect /consent route (requires session)
    status: completed
isProject: false
---

# Complete OAuth 2.1 Provider Setup

## Current State

Already done:
- `@better-auth/oauth-provider` v1.5.6 installed
- `oauthProvider()` mounted in [src/lib/auth.ts](src/lib/auth.ts) with `jwt()` plugin
- `oauthProviderClient()` in [src/lib/auth-client.ts](src/lib/auth-client.ts)
- `oauthProviderResourceClient(auth)` in [src/lib/server-client.ts](src/lib/server-client.ts)
- Database schema with all OAuth tables (`oauthClients`, `oauthRefreshTokens`, `oauthAccessTokens`, `oauthConsents`) in [auth-schema.ts](auth-schema.ts)
- Migrations run

## Issues to Fix

### 1. Fix auth config (`src/lib/auth.ts`)

- **`loginPage` mismatch**: Currently `/login`, but app uses `/auth/sign-in` -- change to `/auth/sign-in`
- **Add `disabledPaths: ["/token"]`** at the `betterAuth()` level (docs recommend this to avoid conflict with Better Auth's own token endpoint)
- **Add scopes**: `["openid", "profile", "email", "offline_access"]` (standard OIDC scopes)
- **Add `validAudiences`**: Set to the app's API URL (e.g. from `BETTER_AUTH_URL` env var or a dedicated `OAUTH_AUDIENCE` env)
- **Enable dynamic client registration** with `allowDynamicClientRegistration: true` and `allowUnauthenticatedClientRegistration: true` (required for MCP clients like ChatGPT/Claude to self-register)
- **Enable `allowPublicClientPrelogin: true`** so public clients can fetch client info before login

## New Files to Create

### 2. Consent Page (`src/app/consent/page.tsx`)

Create a consent screen that:
- Reads `client_id` and `scope` from query params (provided by the OAuth flow redirect)
- Fetches client info via `authClient.oauth2.publicClient({ query: { client_id } })`
- Displays client name, icon, and requested scopes in a card layout
- Has "Allow" and "Deny" buttons that call `authClient.oauth2.consent({ accept: true/false })`
- Uses existing UI components (`Button` from `src/components/ui/button.tsx`) and matches the app's Tailwind styling

### 3. Well-Known Discovery Routes

Three route files using the helpers from `@better-auth/oauth-provider`:

- **`src/app/.well-known/openid-configuration/route.ts`** -- OIDC discovery metadata via `oauthProviderOpenIdConfigMetadata(auth)`
- **`src/app/.well-known/oauth-authorization-server/route.ts`** -- RFC 8414 OAuth AS metadata via `oauthProviderAuthServerMetadata(auth)`
- **`src/app/.well-known/oauth-protected-resource/route.ts`** -- Protected resource metadata for MCP via `serverClient.getProtectedResourceMetadata()`

Each is a simple `GET` handler that returns JSON. Add CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET`) for local MCP testing compatibility.

### 4. MCP Handler Route (`src/app/api/mcp/[transport]/route.ts`)

- Install `mcp-handler` and `zod` dependencies
- Create an MCP transport route using the `mcpHandler` helper from `@better-auth/oauth-provider`
- Wire up `verifyOptions` with `issuer` and `audience` from env vars
- Include a sample `echo` tool to verify the setup works
- Export `GET`, `POST`, `DELETE` handlers

### 5. Create First OAuth Client Script (`scripts/create-oauth-client.ts`)

A runnable script (`npx tsx scripts/create-oauth-client.ts`) that:
- Imports the `auth` instance
- Calls `auth.api.adminCreateOAuthClient()` to create a confidential client with `skip_consent: true` and `enable_end_session: true`
- Logs the `client_id` and `client_secret` for the user to save

### 6. Environment Variables

Add to [.env.example](.env.example):
- `OAUTH_AUDIENCE` -- the resource server audience URL (e.g. `https://api.example.com`)
- `OAUTH_ISSUER` -- the issuer URL if different from `BETTER_AUTH_URL`

### 7. Middleware Update (`src/middleware.ts`)

Add `/consent` to the `protectedRoutes` array so unauthenticated users hitting the consent page get redirected to sign in first (consent requires an active session).

## Architecture Flow

```mermaid
sequenceDiagram
    participant Client as OAuth Client / MCP
    participant WellKnown as .well-known endpoints
    participant AuthServer as /api/auth (Better Auth)
    participant ConsentPage as /consent
    participant MCPRoute as /api/mcp

    Client->>WellKnown: GET /.well-known/oauth-authorization-server
    WellKnown-->>Client: OAuth AS metadata (endpoints, scopes)

    Client->>AuthServer: GET /api/auth/oauth2/authorize
    AuthServer-->>Client: Redirect to /auth/sign-in (if not logged in)
    Client->>AuthServer: User logs in
    AuthServer-->>Client: Redirect to /consent?client_id=...&scope=...

    Client->>ConsentPage: User sees consent screen
    ConsentPage->>AuthServer: POST /api/auth/oauth2/consent (accept=true)
    AuthServer-->>Client: Redirect to callback with authorization code

    Client->>AuthServer: POST /api/auth/oauth2/token (code exchange)
    AuthServer-->>Client: access_token + id_token + refresh_token

    Client->>MCPRoute: POST /api/mcp (Bearer token)
    MCPRoute->>MCPRoute: Verify JWT via JWKS
    MCPRoute-->>Client: MCP response
```
