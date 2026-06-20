
## 1. Cool the Borough — tech objects

**Tech types (6 total):** Solar, Wind, Mine water, Heat pumps, Tree planting, Green roofs, CCUS, Hydrogen, SLES (Smart Local Energy System).

**Persistence:** new `user_map_tech` table in Lovable Cloud (per-user, RLS):
- `id, user_id, tech_type, lat, lng, label, created_at`
- GRANT to authenticated + service_role; policy `auth.uid() = user_id`.

**Map behaviour:**
- On load, fetch & render the signed-in user's pins as coloured markers (one icon per tech type).
- Add-flow: pick tech type → tap map → save to DB → marker appears immediately.
- On add, show a **rewards popup** (same visual language as sheep customisation): 1–3 stars + a short explainer of how this tech tackles global warming. Award small point bonus (e.g. 25 pts).
- Markers visible across sessions/devices.

## 2. Nelson's journey home (mini-map button)

- Add a circular button in the bottom-right of the Cool the Borough screen, using the `act-local` asset.
- Button opens a `NelsonJourneyScreen` overlay with a small stylised UK map.
- Linear progress by `profiles.total_points`:
  - 0 pts → Nelson icon in N. Scotland
  - threshold (e.g. 5000 pts) → Nelson, Caerphilly (home)
- Nelson icon tweens along a polyline (Scotland → Cumbria → Manchester → Birmingham → Cardiff → Nelson).
- Shows "X points to bring Nelson Y miles closer" and a progress bar.
- Group boost: if user is in a group, `groupTotalPoints` adds to their personal progress on this screen only (caps at 100%).

## 3. Groups v1

New tables:
- `groups`: `id, name, code (unique 6-char), created_by, created_at`
- `group_members`: `group_id, user_id, joined_at` (PK on pair)

RLS:
- `groups`: members can SELECT their group; creator can UPDATE/DELETE; authenticated can INSERT.
- `group_members`: user can SELECT rows where `user_id = auth.uid()` OR same `group_id` as their own membership (via security-definer helper to avoid recursion); user can INSERT/DELETE their own row.

Helper function `public.is_group_member(_group uuid, _user uuid)` SECURITY DEFINER.

**UI — new `GroupsScreen`** (accessible from Account tab where "Groups" is already referenced):
- Create group (name → returns code to share)
- Join via code
- View current group: member list + pooled points leaderboard (sum of `profiles.total_points` across members; per-member rank).
- Leave group.

Wire the existing broken "Groups" entry points to this screen.

## Technical notes

- New file `src/components/screens/NelsonJourneyScreen.tsx` with inline SVG UK silhouette + polyline.
- New file `src/components/screens/GroupsScreen.tsx` + `useGroups` hook.
- New file `src/components/TechRewardDialog.tsx` (reuses sheep reward styling).
- Update `CaerphillyMap.tsx`: persistence, expanded tech list, reward dialog, Nelson-home button.
- Update `BottomNavigation` / Account routing to expose Groups.
- 3 migrations (one combined): `user_map_tech`, `groups`, `group_members` + helper function.
- No changes to point-award caps in `profiles_guard_protected_cols` (25-pt bonus is well under 200).
