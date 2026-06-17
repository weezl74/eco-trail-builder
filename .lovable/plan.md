## Goal

Make every piece of user data **per-user**, **persistent across logout/login**, **zero for new users**, and **synced to Lovable Cloud** so the same user sees the same state on any device.

---

## 1. New Cloud tables (per-user, RLS to `auth.uid()`)

Local data currently scattered across `localStorage` becomes rows owned by the user:

| Table | Holds | Replaces local key |
|---|---|---|
| `user_state` (1 row per user, JSONB) | savings (£/CO₂/water), wool points, tree points, trees planted, pledged items, renewables, accessories | `eco_state_v2:{userId}` |
| `user_wallet` (many rows) | saved businesses + photos | `wallet_items_v1` |
| `user_bin_day` (1 row) | collection schedule + dismissed flag | `binday_v1`, `binday_dismissed_v1` |
| `user_preferences` (1 row) | sheep head (Nelson/Barb), learning style prefs | `sheepHead`, `learningPreferences` |
| `user_sprints` (many rows) | sprint progress + waste-calc sprint data | `sprints_{userId}`, `userSprints` |
| `user_walk_stamps` (1 row) | #WalkMyWarmUp stamp count | `walkwarmup_{userId}` |
| `user_calc_categories` (1 row, JSONB) | completed calculator categories | `completedCategories_{userId}` |

Every table:
- FK `user_id uuid references auth.users(id) on delete cascade`
- `GRANT SELECT, INSERT, UPDATE, DELETE … TO authenticated; GRANT ALL … TO service_role;`
- RLS: user can only read/write rows where `user_id = auth.uid()`
- `created_at` / `updated_at` with trigger

`app_language` stays device-wide in `localStorage` (not user-specific).

---

## 2. Hook rewrites

Each hook keeps the same public API (so components don't change) but swaps localStorage for Supabase:

- `useSavings` → reads/writes `user_state`
- `useWallet` / `useWalletBusinesses` → reads/writes `user_wallet`
- `useBinDay` → reads/writes `user_bin_day`
- New `useUserPreferences` → wraps `user_preferences`; `SheepAvatarScreen` & `LearningStyleAssessment` use it
- Sprint state in `SprintChallenges`, `SprintsScreen`, `WasteCalculator` → `user_sprints`
- `WalkMyWarmUpScreen` → `user_walk_stamps`
- `WasteCalculator` completed categories → `user_calc_categories`

Loading pattern:
1. On mount + on `auth` change: fetch row(s) for current user
2. Show zero/empty defaults while loading, and for brand-new users
3. Optimistic update locally, then upsert to cloud
4. On logout: clear in-memory state; **do not delete cloud rows** — they return on next login

A tiny per-user localStorage cache (`{table}:{userId}`) is kept as an offline fallback so the UI doesn't flash empty on reload; cloud is the source of truth.

---

## 3. New-user guarantee

- `handle_new_user` trigger already creates a `profiles` row on signup. No new rows needed elsewhere — hooks treat "no row" as "zeros/empty", so a new user automatically sees: default Nelson, no wallet items, no bin day, 0 stamps, 0 savings, no sprints.

---

## 4. Logout behaviour

- Keep cloud rows (persistence is the whole point).
- Clear the in-memory + local cache on `signOut` so user B on the same device doesn't briefly see user A's data.

---

## 5. Migration of existing local data (one-off)

On first login after this ships, each hook checks for the legacy localStorage key and, if found AND no cloud row exists yet for this user, uploads it once then deletes the local key. Prevents data loss for current testers.

---

## Rollout order

1. Migration: create all 7 tables with GRANTs + RLS.
2. Rewrite hooks one at a time (savings → wallet → bin day → preferences → sprints → stamps → calc categories), verifying each in preview before moving on.
3. Wire logout cache-clear in `useAuth`.
4. Smoke test: register fresh user → zeros everywhere; log out → log back in → state returns; log in on a different "device" (incognito) → same state.

## Technical notes

- All writes go through `supabase.from(...).upsert(...)` keyed on `user_id` for the single-row tables.
- JSONB used for `user_state` and `user_calc_categories` to avoid schema churn as shapes evolve.
- No edge functions needed — direct table access under RLS is sufficient.
- No new dependencies.