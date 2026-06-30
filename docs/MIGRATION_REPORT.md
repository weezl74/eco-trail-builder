# Render API Migration — Final Audit

Base URL: `https://caerphilly-api.onrender.com`

Supabase usage retained ONLY for: `supabase.auth.*` (sign in / sign up / session / JWT / password update). All other reads/writes move to the API below.

---

## 1. Migration Report (current state)

| # | File | Old Table | New Endpoint(s) | Status |
|---|------|-----------|-----------------|--------|
| 1 | `src/hooks/useAuth.tsx` | `auth.users` (auth only) | — (Supabase Auth kept) | ✅ Auth-only, keep |
| 2 | `src/components/RegisterForm.tsx` | `profiles` (account_type set) | `POST /profile/update` | ✅ Done |
| 3 | `src/components/KnowledgeBase.tsx` | `profiles` (points) | `POST /profile/update` | ✅ Done |
| 4 | `src/components/TreePlanting.tsx` | `tree_requests` (select/insert/update), `profiles` | `GET /tree-requests?user_id`, `POST /tree-requests`, `PATCH /tree-requests/{id}`, `POST /profile/update` | ⛔ Pending — still direct `supabase.from('tree_requests')` |
| 5 | `src/components/CategoryQuestionnaire.tsx` | `user_responses` | `GET /responses?user_id&category`, `POST /responses/save` | ✅ Done |
| 6 | `src/components/screens/CalculatorScreen.tsx` | `user_responses`, `profiles` | `GET /responses?user_id`, `POST /profile/update`, `GET /profile` | ✅ Done |
| 7 | `src/components/WasteCalculator.tsx` | `profiles`, `user_pledges`, `user_renewables`, `user_calc_categories` | `GET /profile`, `POST /profile/update`, `GET /pledges?user_id`, `POST /pledges`, `GET /renewables?user_id`, `POST /renewables`, `PATCH /renewables/{id}`, `GET /calculator/categories?user_id`, `POST /calculator/categories` | ⛔ Pending — mixed: sprints/responses migrated, but `profiles` / `user_pledges` / `user_renewables` / `user_calc_categories` still direct |
| 8 | `src/components/CommunityStories.tsx` | `user_stories`, `story_kudos` | `GET /stories`, `POST /stories/{id}/kudos` | ✅ Done |
| 9 | `src/components/screens/AddStoryDialog.tsx` | `user_stories` | `GET /stories`, `POST /stories` | ✅ Done |
| 10 | `src/components/screens/PledgesScreen.tsx` | `pledges` (catalogue) | `GET /pledges-catalogue?user_group` | ⛔ Pending |
| 11 | `src/components/screens/ShopLocalScreen.tsx` | `map_locations`, `business_cards_public` | `GET /map-locations`, `GET /business-cards/public` | ⛔ Pending |
| 12 | `src/components/screens/WalkMyWarmUpScreen.tsx` | `user_walk_stamps` (select/upsert) | `GET /walk-stamps?user_id`, `POST /walk-stamps` | ⛔ Pending |
| 13 | `src/hooks/useWallet.tsx` | `user_wallet` (select/upsert/delete) | `GET /wallet?user_id`, `POST /wallet`, `DELETE /wallet?user_id&business_id` | ⛔ Pending |
| 14 | `src/hooks/useUserPreferences.tsx` | `user_preferences` (select/upsert) | `GET /preferences?user_id`, `POST /preferences` | ⛔ Pending |
| 15 | `src/hooks/useBinDay.tsx` | `user_bin_day` (select/upsert) | `GET /bin-day?user_id`, `POST /bin-day` | ⛔ Pending |
| 16 | `src/hooks/useBusinessStamps.tsx` | `user_business_stamps` (select/upsert) | `GET /business-stamps?user_id`, `POST /business-stamps` | ⛔ Pending |
| 17 | `src/hooks/useGroups.tsx` | `groups`, `group_members` (select/insert/delete), RPC `get_public_profile` | `GET /users/{user_id}/group`, `GET /groups/by-code/{code}`, `POST /groups`, `GET /groups/{id}/members`, `POST /groups/{id}/members`, `DELETE /groups/{id}/members/{user_id}` | ⛔ Pending |
| 18 | `src/hooks/useBusinessSpotlight.tsx` | `business_cards_public` | `GET /business-cards/public` | ⛔ Pending |
| 19 | `src/hooks/useTranslations.tsx` | `translations` | `GET /translations?language_code` | ⛔ Pending |
| 20 | `src/components/business/BusinessOnboarding.tsx` | `business_cards` (select/upsert) | `GET /business-cards/me?user_id`, `POST /business-cards` | ⛔ Pending |
| 21 | `src/components/business/BusinessAccountScreen.tsx` | `business_cards` (select) | `GET /business-cards/me?user_id` | ⛔ Pending |
| 22 | `src/components/business/BusinessHomeScreen.tsx` | `business_cards` (select) | `GET /business-cards/me?user_id` | ⛔ Pending |

---

## 2. Profile Update Audit — every call to `POST /profile/update`

The Render `profiles` model must accept **partial updates** on these fields. Always keyed by `user_id`.

| File | Payload keys | Purpose |
|---|---|---|
| `src/components/RegisterForm.tsx` (L92) | `user_id`, `account_type` | Mark new account as `business` on signup |
| `src/components/KnowledgeBase.tsx` (L278) | `user_id`, `total_points` | Award points after passing a quiz (≥75%) |
| `src/components/TreePlanting.tsx` (L91) | `user_id`, `total_points` | Deduct cost of requested tree |
| `src/components/screens/CalculatorScreen.tsx` (L132) | `user_id`, `current_footprint`, `total_points`, `calc_bonus_awarded?` | Save footprint + award category/all-six bonus |
| `src/components/WasteCalculator.tsx` (L425) | `user_id`, `total_points` | Award points when a pledge is added |
| `src/components/WasteCalculator.tsx` (L570) | `user_id`, `total_points` | Award points on sprint completion |
| `src/hooks/usePoints.tsx` (existing wrapper) | `user_id`, `wool_points?`, `tree_points?`, `total_points?` | Generic point award/spend helper |

Minimum writable column set required server-side: `total_points`, `wool_points`, `tree_points`, `current_footprint`, `calc_bonus_awarded`, `account_type`, `display_name`, `username`, `avatar_level`.

---

## 3. Full Endpoint Usage Matrix

All requests are JSON. `user_id` is a UUID string from Supabase Auth (`auth.uid()`).

### Auth / Profile

| Endpoint | Method | Files | Request | Response |
|---|---|---|---|---|
| `/create-user` | POST | `useAuth.tsx` | `{ user_id, display_name? }` | `{ ok: true }` |
| `/profile?user_id={uuid}` | GET | `api.ts:fetchMyProfile`, `SimplifiedApp`, `CalculatorScreen`, `AccountScreen`, `WasteCalculator`*, `TreePlanting`*, `KnowledgeBase`*, `RegisterForm`* (*pending) | — | `{ user_id, username, display_name, total_points, wool_points, tree_points, current_footprint, calc_bonus_awarded, avatar_level, account_type, ... }` |
| `/profile/update` | POST | see Profile Update Audit | partial profile fields incl. `user_id` | `{ ok: true, profile }` |
| `/leaderboard` | GET | `api.ts:fetchLeaderboard` → `LeaderboardTreesScreen`, `Leaderboard` | — | `Array<{ user_id, username, display_name, wool_points, tree_points, total_points }>` |
| `/spend-points` | POST | `api.ts:spendPoints` (defined, no live caller) | `{ user_id, woolDelta?, treeDelta?, source, reference_id? }` | `{ ok: true, profile }` |

### Calculator

| Endpoint | Method | Files | Request | Response |
|---|---|---|---|---|
| `/responses?user_id={uuid}` | GET | `WasteCalculator`, `CalculatorScreen` | — | `Array<{ category, question_id, answer_value, impact_value }>` |
| `/responses?user_id={uuid}&category={id}` | GET | `CategoryQuestionnaire` | — | `Array<{ question_id, answer_value, impact_value }>` |
| `/responses/save` | POST | `CategoryQuestionnaire` | `{ user_id, category, responses: [{ user_id, category, question_id, answer_value, impact_value }] }` (replaces all rows for that category) | `{ ok: true }` |
| `/calculator/categories?user_id={uuid}` | GET | `WasteCalculator` (pending) | — | `{ completed: string[] }` |
| `/calculator/categories` | POST | `WasteCalculator` (pending) | `{ user_id, completed: string[] }` | `{ ok: true }` |

### Stories

| Endpoint | Method | Files | Request | Response |
|---|---|---|---|---|
| `/stories` | GET | `CommunityStories`, `AddStoryDialog` | — | `Array<{ id, user_id, display_name, title, content, run_type, points_earned, image_url, kudos_count, user_has_kudos, created_at }>` |
| `/stories` | POST | `AddStoryDialog` | `{ user_id, title, content, run_type, points_earned, image_url }` | `{ ok: true, id }` |
| `/stories/{id}/kudos` | POST | `CommunityStories` | `{ user_id, remove: boolean }` | `{ ok: true, kudos_count }` |

### Pledges

| Endpoint | Method | Files | Request | Response |
|---|---|---|---|---|
| `/pledges?user_id={uuid}` | GET | `WasteCalculator` (pending), `useSavings` | — | `Array<{ id, category, action, points_earned, created_at }>` |
| `/pledges` | POST | `useSavings`, `WasteCalculator` (pending) | `{ user_id, category, action, points_earned }` | `{ ok: true, id }` |
| `/pledges-catalogue?user_group={resident\|business}` | GET | `PledgesScreen` (pending) | — | `Array<{ id, key, title, description, co2_saved, money_saved, water_saved, wool_points, tag, category }>` |

### Sprints

| Endpoint | Method | Files | Request | Response |
|---|---|---|---|---|
| `/sprints?user_id={uuid}` | GET | `api.ts:fetchUserSprintData` → SprintsScreen, BusinessSprintsScreen, SprintChallenges, WasteCalculator | — | `Array<{ sprint_key, data }>` |
| `/sprints/save` | POST | `api.ts:saveUserSprintData`, `WasteCalculator` | `{ user_id, sprint_key, data: string\|object }` | `{ ok: true }` |

### Wallet

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/wallet?user_id={uuid}` | GET | `useWallet` | — | `Array<{ business_id, data: WalletItem }>` |
| `/wallet` | POST | `useWallet` | `{ user_id, business_id, data: WalletItem }` | `{ ok: true }` |
| `/wallet?user_id={uuid}&business_id={id}` | DELETE | `useWallet` | — | `{ ok: true }` |

### Preferences

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/preferences?user_id={uuid}` | GET | `useUserPreferences` | — | `{ sheep_head: 'nelson'\|'barb', learning_preferences: any }` |
| `/preferences` | POST | `useUserPreferences` | `{ user_id, sheep_head, learning_preferences }` | `{ ok: true }` |

### Bin Day

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/bin-day?user_id={uuid}` | GET | `useBinDay` | — | `{ data: BinDayConfig\|{}, dismissed: boolean }` |
| `/bin-day` | POST | `useBinDay` | `{ user_id, data: BinDayConfig\|{}, dismissed: boolean }` | `{ ok: true }` |

### Business Stamps

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/business-stamps?user_id={uuid}` | GET | `useBusinessStamps` | — | `Array<{ business_card_id, stamps, redeemed_at }>` |
| `/business-stamps` | POST | `useBusinessStamps` | `{ user_id, business_card_id, stamps }` | `{ ok: true }` |

### Walk Stamps

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/walk-stamps?user_id={uuid}` | GET | `WalkMyWarmUpScreen` | — | `{ stamps: number }` |
| `/walk-stamps` | POST | `WalkMyWarmUpScreen` | `{ user_id, stamps }` | `{ ok: true }` |

### Renewables

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/renewables?user_id={uuid}` | GET | `WasteCalculator` | — | `Array<{ id, technology_type, points_cost, position_x, position_y }>` |
| `/renewables` | POST | `WasteCalculator` | `{ user_id, technology_type, points_cost }` | `{ ok: true, id, ...row }` |
| `/renewables/{id}` | PATCH | `WasteCalculator` | `{ user_id, position_x, position_y }` | `{ ok: true }` |

### Tree Requests

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/tree-requests?user_id={uuid}` | GET | `TreePlanting` | — | `Array<{ id, status, tree_species, points_used, planting_date, what3words_location, created_at }>` |
| `/tree-requests` | POST | `TreePlanting` | `{ user_id, points_used, status: 'pending', tree_species }` | `{ ok: true, id }` |
| `/tree-requests/{id}` | PATCH | `TreePlanting` | `{ status, planting_date?, what3words_location? }` | `{ ok: true }` |

### Groups

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/users/{user_id}/group` | GET | `useGroups` | — | `{ group: Group, members: Array<{ user_id, display_name, total_points }> } \| null` |
| `/groups/by-code/{code}` | GET | `useGroups` | — | `{ id, name, code, created_by } \| null` |
| `/groups` | POST | `useGroups` | `{ name, created_by }` | `{ id, name, code, created_by }` |
| `/groups/{id}/members` | GET | `useGroups` | — | `Array<{ user_id, display_name, total_points }>` |
| `/groups/{id}/members` | POST | `useGroups` | `{ user_id }` | `{ ok: true }` |
| `/groups/{id}/members/{user_id}` | DELETE | `useGroups` | — | `{ ok: true }` |

### Business Cards

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/business-cards/me?user_id={uuid}` | GET | `BusinessOnboarding`, `BusinessAccountScreen`, `BusinessHomeScreen` | — | `BusinessCard \| null` |
| `/business-cards` | POST | `BusinessOnboarding` | full `BusinessCard` payload incl. `user_id` (upsert by `user_id`) | `{ ok: true }` |
| `/business-cards/public` | GET | `useBusinessSpotlight`, `ShopLocalScreen` | — | `Array<PublicBusinessCard>` (no PII) |

### Map Locations

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/map-locations` | GET | `ShopLocalScreen` | — | `Array<{ id, title, latitude, longitude, category, carbon_action }>` |

### Translations

| Endpoint | Method | Files (pending) | Request | Response |
|---|---|---|---|---|
| `/translations?language_code={en\|cy}` | GET | `useTranslations` | — | `Array<{ english_version, translation }>` |

### User State

| Endpoint | Method | Files (planned) | Request | Response |
|---|---|---|---|---|
| `/state?user_id={uuid}` | GET | — (not yet wired in frontend) | — | `{ data: any }` |
| `/state` | POST | — | `{ user_id, data: any }` | `{ ok: true }` |

---

## Endpoints defined but unused

- `POST /spend-points` — defined in `api.ts`, no live caller.
- `PATCH` wrapper — defined in `api.ts`, no live caller yet (will be used by Renewables / Tree Requests after migration).

## Frontend-only state (no API yet)

- `useSavings.tsx` — money/CO2 totals (still localStorage, intentional — not in brief).
- `useFavouriteQuotes.tsx` — favourite quotes (localStorage).
- Inventory / accessory ownership — localStorage.
- Force-password-reset flag — localStorage (`ForcePasswordResetGate`).
