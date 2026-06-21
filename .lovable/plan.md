
# Migration Plan — Render API (Azure SQL) replaces Supabase for data

Supabase stays for **auth only** (login, session, password reset). All profile / leaderboard / app data moves to `https://caerphilly-api.onrender.com`.

## 1. Audit summary

35 files reference Supabase. Categorised:

**Auth (KEEP Supabase) — 6 files**
- `src/integrations/supabase/client.ts` — keep
- `src/hooks/useAuth.tsx` — keep (session, signOut)
- `src/pages/Auth.tsx`, `src/components/LoginForm.tsx`, `src/components/RegisterForm.tsx` — keep `signInWithPassword`, `signUp`
- `src/pages/ResetPassword.tsx` — keep `updateUser({ password })`
- `src/components/ForcePasswordResetGate.tsx` — keep

**Data fetching / updates (MIGRATE to API) — 29 files**
Hooks: `useAccountType`, `useSavings`, `useWallet`, `useBinDay`, `useUserPreferences`, `useTranslations`, `useGroups`, `useBusinessStamps`, `useBusinessSpotlight`
Components: `Leaderboard`, `AccountScreen`, `CommunityStories`, `CategoryQuestionnaire`, `KnowledgeBase`, `TreePlanting`, `WasteCalculator`, `SprintChallenges`, `SimplifiedApp`, `pages/Index`, all `screens/*.tsx`, all `business/*.tsx`

## 2. Scope I will implement now

To avoid making 29 broken files (the Render API contract isn't documented in the repo), I will implement the **minimum slice that satisfies your stated success criteria** ("app must still load", "leaderboard must still display", "account page must still load user data") and stub the rest behind a single API client. Everything else continues to work because the Supabase data calls remain in place (no behaviour change) until you confirm endpoint shapes.

### 2a. New file: `src/lib/api.ts`
Typed fetch client for the Render API:
- `apiGet<T>(path)` / `apiPost` / `apiPatch` / `apiDelete`
- Attaches `Authorization: Bearer <supabase access_token>` from current session
- Base URL: `https://caerphilly-api.onrender.com`

### 2b. Migrate the 3 user-visible data paths you called out

| Concern | Today (Supabase) | After |
|---|---|---|
| Leaderboard list | `supabase.rpc('get_leaderboard')` in `src/components/Leaderboard.tsx` | `GET /leaderboard` → `[{ user_id, display_name, wool_points, tree_points, avatar_level }]` |
| Account profile (display_name, points) | `supabase.from('profiles').select(...)` in `AccountScreen.tsx` + `screens/AccountSubScreen.tsx` | `GET /profiles/me` → `{ display_name, username, wool_points, tree_points, avatar_level, ... }` |
| Profile fetched after login (Index stage machine) | `supabase.from('profiles').select('account_type')` | `GET /profiles/me` (same call, cached via react-query) |

I will introduce `src/hooks/useProfile.ts` (react-query) as the single source for current-user profile, and `src/hooks/useLeaderboard.ts` for the leaderboard. Components are updated to consume these hooks instead of calling Supabase directly.

### 2c. Leave-as-is (for now)
The other ~26 files (sprints, pledges, wallet, bin day, stories, business stamps, tree planting, etc.) keep their existing Supabase calls. They will be migrated in follow-up passes once the Render API endpoints for those resources are confirmed. This honours rule 8 (no breaking changes) — partially migrating tables whose API shape we don't yet know would break those screens.

## 3. Assumptions I need you to confirm

1. **Auth bridging.** The Render API accepts the Supabase JWT (`session.access_token`) as `Authorization: Bearer …` and decodes `sub` as the user id. ✅ / ❌
2. **Endpoints exist** at:
   - `GET /profiles/me`
   - `GET /leaderboard?limit=50`
   Returning fields named exactly `display_name`, `wool_points`, `tree_points`, `avatar_level`, `username`. ✅ / ❌
3. **Points model.** Today Supabase only stores `total_points`. You've referenced `wool_points` and `tree_points` separately — I will assume the Render API returns both as numbers. ✅ / ❌
4. Should I also migrate **the rest of the 26 files** in this same pass (risk: many endpoints I'll have to assume), or stage it and only do leaderboard + profile now?

If you confirm (or correct) the above, I'll ship the changes in this turn. If you want the full 29-file migration in one go, please paste the API's endpoint list (or OpenAPI URL) so I don't have to guess.
