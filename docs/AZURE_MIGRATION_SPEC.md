# Caerphilly Sustainability App — Backend & Frontend Spec

_Reference document for migrating the current Lovable Cloud (Supabase / Postgres) backend to **Microsoft Azure**._

Generated: 2026-06-17

---

## 1. High-level architecture (current)

```
┌────────────────────────────────────────┐
│ React 18 + Vite 5 SPA (TypeScript)     │
│ Tailwind v3, shadcn/ui, react-router   │
│ @tanstack/react-query                  │
└──────────────┬─────────────────────────┘
               │ HTTPS / JWT (supabase-js)
               ▼
┌────────────────────────────────────────┐
│ Supabase (Lovable Cloud)               │
│  • Postgres 15 + Row Level Security    │
│  • PostgREST Data API (REST + RT)      │
│  • GoTrue Auth (email/pw, OAuth)       │
│  • Edge Functions (Deno) — n/a today   │
│  • Storage (buckets) — none today      │
└────────────────────────────────────────┘
```

### Target Azure mapping

| Current (Supabase) | Azure equivalent |
|---|---|
| Postgres + RLS | **Azure Database for PostgreSQL — Flexible Server** (keep RLS verbatim) |
| PostgREST auto REST API | **Azure Container Apps** running PostgREST, **or** **Azure Functions / App Service** with hand-written REST API (Node/TS) |
| Realtime (websocket) | **Azure Web PubSub** or PostgREST + custom WS bridge |
| GoTrue Auth (email/pw, Google) | **Azure AD B2C** (or **Entra External ID**); migrate users by import |
| Edge Functions (Deno) | **Azure Functions** (Node/TS) behind APIM |
| Secrets (`LOVABLE_API_KEY`, etc.) | **Azure Key Vault** + Managed Identity |
| Static SPA hosting | **Azure Static Web Apps** (CI from GitHub) |
| CDN / TLS | Built into Static Web Apps + Azure Front Door |
| `gen_random_uuid()` / pgcrypto | Same — enable `pgcrypto` extension on Flexible Server |

---

## 2. Frontend (this repo)

### 2.1 Stack
- **React 18**, **Vite 5**, **TypeScript 5**
- **Tailwind CSS 3** + **shadcn/ui** (Radix primitives)
- **react-router-dom 6**
- **@tanstack/react-query** for server state
- **@supabase/supabase-js 2** — single point of cloud coupling
- **lucide-react** icons
- **zod** + **react-hook-form** for form validation
- **i18next / custom translation hook** — EN / CY (Welsh)

### 2.2 Routes (`src/App.tsx`, `src/pages/`)
| Path | Page | Notes |
|---|---|---|
| `/` | `Index` | Stage machine: landing → language → auth → register → app |
| `/auth` | `Auth` | Login / register tabs |
| `/reset-password` | `ResetPassword` | Email recovery |
| `/dashboard` | `Dashboard` | Resident shell — bottom-tab nav |
| `/business/*` | `BusinessApp` | Business shell (separate nav) |
| `/business/impact` | `BusinessImpact` | |
| `/business/community` | `BusinessCommunity` | |
| `/business/carbon-report` | `BusinessCarbonReportPage` | |
| `*` | `NotFound` | |

### 2.3 Cloud-coupled hooks (the contract to replace)
All file paths under `src/hooks/`:

| Hook | Tables touched | Purpose |
|---|---|---|
| `useAuth.tsx` | `auth.users` (via GoTrue) | session, signOut clears `cloudrow:*` cache |
| `useAccountType.tsx` | `profiles.account_type` | resident vs business gating |
| `useSavings.tsx` | `user_state` (jsonb blob) | money / CO₂ / water, points, accessories |
| `useWallet.tsx` | `user_wallet` (many rows) | saved local shops |
| `useBinDay.tsx` | `user_bin_day` | recycling day + dismissed flag |
| `useUserPreferences.tsx` | `user_preferences` | Nelson/Barb avatar, learning style |
| `useBusinessSpotlight.tsx` | `business_cards` (status=approved) | rotating spotlight |
| `useTranslations.tsx` | `translations` | language strings |

Per-user local cache key convention: `cloudrow:{table}:{column}:{userId}`.

### 2.4 Build / deploy on Azure
1. `npm ci && npm run build` → `dist/`
2. Push to GitHub; **Azure Static Web Apps** workflow auto-deploys.
3. Env vars (set in SWA configuration):
   - `VITE_SUPABASE_URL` → replace with `VITE_API_BASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` → replace with `VITE_AUTH_CLIENT_ID` (B2C app reg)
4. Replace `@/integrations/supabase/client.ts` with a thin REST client targeting the new API base; keep the hook signatures so consumer components don't change.

---

## 3. Backend — Database

### 3.1 Engine
- PostgreSQL 15 with extensions: `pgcrypto` (for `gen_random_uuid()`).
- Azure: **Flexible Server**, zone-redundant HA, `general_purpose` SKU to start, PITR enabled.

### 3.2 Schemas
All app tables live in `public`. Auth lives in a separate `auth` schema (current Supabase). After migration to Azure AD B2C, the `auth.users` reference becomes a logical `user_id uuid` keyed to the B2C `oid` claim — no FK to an external `auth` schema.

### 3.3 Tables (public)

> Standard columns omitted: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (BEFORE UPDATE trigger -> `update_updated_at_column()`).

**`profiles`** — one row per user
- `user_id uuid NOT NULL UNIQUE` (B2C subject)
- `username text`, `display_name text`
- **PII (write-protected by trigger):** `first_name`, `last_name`, `address`, `postcode`, `phone`, `age`
- `account_type text` — `'resident'` | `'business'` (write-protected)
- `avatar_level int`, `total_points int`, `calc_bonus_awarded bool`

**`business_cards`** — business directory
- `user_id`, `business_name` (NOT NULL), `tagline`, `sector`, `website`, `phone`, `address`, `postcode`, `latitude`, `longitude`, `logo_url`, `pen_portrait`, `climate_goals`, `offer_to_residents`, `offer_to_businesses`
- `status text NOT NULL DEFAULT 'approved'` — `'pending' | 'approved' | 'rejected'` (write-protected via `business_cards_guard_status` trigger)
- View `business_cards_public` exposes approved rows without PII

**`map_locations`** — public POIs (`title`, `description`, `street_address`, `city`, `postcode`, `country`, `latitude`, `longitude`, `category`, `carbon_action`)

**`pledges` / `user_pledges`** — catalogue + per-user opt-ins
**`user_renewables`** — per-user renewable tech enabled
**`user_responses`** — questionnaire answers
**`user_stories` / `story_kudos`** — community feed + likes
**`tree_requests`** — physical tree planting requests
**`translations`** — i18n key/value (`lang`, `namespace`, `key`, `value`)

**Per-user cloud-sync tables** (created in 2026-06-17 migration; one row per user keyed on `user_id`):
- `user_state` (jsonb `data`)
- `user_wallet` (many rows: `shop_id`, `shop_name`, `payload jsonb`)
- `user_bin_day` (`day_of_week`, `dismissed bool`)
- `user_preferences` (`sheep_head text`, `learning_styles jsonb`)
- `user_sprints` (`sprint_key`, `state jsonb`)
- `user_walk_stamps` (`stamps jsonb`)
- `user_calc_categories` (`completed jsonb`)

### 3.4 Functions / Triggers
- `handle_new_user()` — AFTER INSERT on `auth.users` → seeds `profiles` from `raw_user_meta_data`. **On Azure**: replace with an Azure Function that runs on the B2C "post-signup" custom policy webhook.
- `update_updated_at_column()` — generic BEFORE UPDATE trigger.
- `profiles_guard_protected_cols()` — **BEFORE UPDATE** on `profiles`. Blocks writes from non-`service_role` to: `account_type`, `phone`, `address`, `postcode`, `age`, `first_name`, `last_name`. Also caps `total_points` increase to +200/update, `avatar_level` jump to +1, and prevents reset of `calc_bonus_awarded`. **(This is the trigger updated by the current security-finding fix.)**
- `business_cards_guard_status()` — BEFORE UPDATE on `business_cards`. Owners cannot change `status` (moderation flag).
- `get_public_profile(uuid)` — SECURITY DEFINER, returns safe public profile columns.
- `get_leaderboard(int)` — SECURITY DEFINER, returns top-N by `total_points`.

### 3.5 Row Level Security (every table)
All tables have RLS enabled. Pattern in use:

```sql
-- User-owned tables (the bulk)
USING  (auth.uid() = user_id)
CHECK  (auth.uid() = user_id)
GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated;
GRANT ALL TO service_role;

-- Public read tables (translations, map_locations, business_cards_public view)
USING (true) FOR SELECT TO anon, authenticated;

-- Moderation-gated (business_cards)
USING (auth.uid() = user_id OR status = 'approved')
```

**On Azure**: PostgreSQL Flexible Server supports RLS identically. Replace `auth.uid()` (a Supabase SQL function reading the JWT `sub` claim) with a custom function `app.current_user_id()` that reads from a request-scoped GUC set by the API layer per request: `SET LOCAL app.user_id = '<oid from B2C token>'`.

### 3.6 GRANTs
Every public-schema table has explicit GRANTs to `authenticated` (and `anon` only where read-public). Service-side code uses `service_role`. Mirror these on Azure with three Postgres roles: `app_anon`, `app_authenticated`, `app_service` — the REST layer connects as the appropriate role per request.

---

## 4. API surface

Today there are **no edge functions** and **no custom REST endpoints** — the frontend talks to PostgREST directly via `supabase-js`. Operations actually used:

| Operation | Tables | Frequency |
|---|---|---|
| `select` (single row by `user_id`) | `profiles`, `user_state`, `user_bin_day`, `user_preferences`, `user_calc_categories`, `user_walk_stamps` | every screen mount |
| `select` (many) | `user_wallet`, `user_sprints`, `user_pledges`, `user_renewables`, `user_responses`, `user_stories`, `story_kudos`, `business_cards` (status=approved), `map_locations`, `translations`, `tree_requests` | tab open |
| `upsert` | every `user_*` table | on user action |
| `insert` | `user_stories`, `story_kudos`, `tree_requests`, `user_pledges`, `business_cards` | |
| `update` | `profiles` (display_name, points, avatar_level only — sensitive cols blocked), `business_cards` (own non-status fields) | |
| `delete` | `user_wallet`, `user_pledges`, `user_renewables`, `story_kudos` | |
| RPC | `get_public_profile`, `get_leaderboard` | leaderboard screen |
| Auth | `signUp`, `signInWithPassword`, `signInWithOAuth({google})`, `signOut`, `onAuthStateChange`, `resetPasswordForEmail` | |

**Azure REST endpoints to scaffold** (one-to-one with above):

```
GET    /api/profile/me
PATCH  /api/profile/me           (display_name, username only)
GET    /api/state                (returns user_state.data)
PUT    /api/state                (replaces user_state.data)
GET    /api/wallet               POST /api/wallet            DELETE /api/wallet/{id}
GET    /api/bin-day              PUT  /api/bin-day
GET    /api/preferences          PUT  /api/preferences
GET    /api/sprints              PUT  /api/sprints/{key}
GET    /api/walk-stamps          PUT  /api/walk-stamps
GET    /api/calc-categories      PUT  /api/calc-categories
GET    /api/pledges              GET  /api/user-pledges      POST/DELETE /api/user-pledges
GET    /api/renewables           POST/DELETE /api/renewables
GET    /api/responses            POST /api/responses
GET    /api/stories              POST /api/stories
GET    /api/stories/{id}/kudos   POST/DELETE /api/stories/{id}/kudos
GET    /api/business-cards       POST /api/business-cards     PATCH /api/business-cards/{id}
GET    /api/business-cards/spotlight
GET    /api/map-locations
GET    /api/tree-requests        POST /api/tree-requests
GET    /api/leaderboard?limit=
GET    /api/profile/{user_id}/public
GET    /api/translations?lang=
```

Auth headers: `Authorization: Bearer <B2C JWT>`. API layer validates JWT (JWKS from B2C), extracts `oid`, sets `app.user_id` GUC, and lets RLS enforce ownership.

---

## 5. Authentication

### 5.1 Today (Supabase GoTrue)
- Email + password (HIBP check enabled recommended)
- Google OAuth (`signInWithOAuth({provider:'google'})`)
- Password reset via email link → `/reset-password`
- `handle_new_user` trigger seeds `profiles` row with `display_name`, `first_name`, `last_name`, `address`, `postcode`, `phone`, `age` from sign-up form's `raw_user_meta_data`.

### 5.2 On Azure (B2C / Entra External ID)
- User flows / custom policies for: `signup_signin`, `password_reset`, `profile_edit`.
- Identity providers: Local accounts (email/pw) + Google.
- Custom claims in token: `oid`, `email`, `given_name`, `family_name`, plus app claims for first-time signup payload (address/postcode/phone/age collected on the signup page).
- **Post-signup REST API** webhook (Azure Function) takes the first-signup payload and writes `profiles` (replacing `handle_new_user`).
- Tokens are JWT (RS256). Frontend stores in `httpOnly` cookie issued by an `/auth/exchange` Function (preferred) or in memory.

---

## 6. Secrets / config

Current Supabase secrets → Azure Key Vault entries:

| Today | Azure |
|---|---|
| `LOVABLE_API_KEY` | KV `lovable-api-key` (consumed by Functions via Managed Identity) |
| `SUPABASE_URL` | n/a (replaced by API base URL in app config) |
| `SUPABASE_PUBLISHABLE_KEY` | n/a (replaced by B2C client id) |
| `SUPABASE_SERVICE_ROLE_KEY` | KV `pg-app-service-password` (DB role `app_service`) |
| `SUPABASE_DB_URL` | KV `pg-conn-string` |

---

## 7. Migration plan (data)

1. **Snapshot Postgres** from Supabase (`pg_dump --schema=public --schema=auth --data-only`).
2. Provision Flexible Server, run all `supabase/migrations/*.sql` in order to recreate schema (RLS, policies, triggers, functions, GRANTs).
3. Replace `auth.uid()` references with `app.current_user_id()` (single sed pass + recompile policies).
4. **Restore data**: `auth.users` → load into B2C using **B2C bulk user import** (map `id` → `oid`); load all `public.*` tables via `pg_restore --data-only`.
5. Verify row counts and a sanity query per table.
6. Cut DNS → Static Web Apps; flip `VITE_API_BASE_URL`; smoke test signup, login, savings persistence, wallet add, bin day, business spotlight, leaderboard.

---

## 8. Operational concerns

- **Backups**: Flexible Server PITR, 35-day retention.
- **Observability**: Application Insights for Functions + SWA; Azure Monitor for PG slow-log & deadlocks.
- **Networking**: VNet-integrated PG, private endpoint; Functions in same VNet; SWA → APIM → Functions.
- **CORS**: APIM allows the SWA origin only.
- **Rate limiting**: APIM policies per route (e.g. `POST /api/stories` 10/min/user).
- **Cost guardrails**: budget alerts on PG vCores + Functions executions.

---

## 9. Recent security hardening (relevant to this migration)

- 2026-06-17 — `profiles_guard_protected_cols` trigger extended to **block self-writes** to `account_type`, `phone`, `address`, `postcode`, `age`, `first_name`, `last_name`. Owners can still update `display_name`, `username`, `avatar_level` (+1 cap), and `total_points` (+200 cap). Carry this trigger over to Azure verbatim — it is the only thing stopping a logged-in user from elevating their own `account_type` to `business`.
- `business_cards_guard_status` trigger likewise blocks owners from self-approving their listing.

---
