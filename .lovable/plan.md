## Status legend
- [x] DONE — already shipped
- [ ] TODO — still required

## 1. Cool the Borough — tech objects

- [x] Expanded tech list to 11 types (Solar, Wind, Mine water, Heat pumps, Tree planting, Green roofs, CCUS, Hydrogen, SLES, etc.)
- [x] Persistence: `position_x`, `position_y` added to `user_renewables` (RLS already in place). **No further migration needed.**
- [x] Tap-to-place flow after purchase
- [x] Coloured/labelled markers, high contrast
- [x] `TechRewardDialog` with 1–3 stars + warming explainer on placement
- [ ] **Red-orange "heat" overlay on the borough map at game start, fading as the borough cools** (driven by points / placed tech count). NEW request — not yet built on `CaerphillyMap` (only the Shop Local screen got a wash). No DB work.

## 2. Nelson's journey home

- [x] `NelsonJourneyScreen.tsx` with stylised UK map + polyline (Scotland → Caerphilly)
- [x] Linear progress from `profiles.total_points` (0 → 5000)
- [x] `groupBoost` prop wired in component
- [x] `act-local` circular button on Shop Local screen opens the journey
- [ ] **Same `act-local` button on the Cool the Borough map screen** (user reports it's missing there). UI only.
- [ ] Decide whether to auto-apply group pooled points to personal Nelson progress (prop exists, not fed yet). UI/logic only.

## 3. Groups v1

- [x] Migration: `groups` + `group_members` tables, RLS, `is_group_member()` security-definer helper. **Done — no further migration needed.**
- [x] `useGroups` hook (create / join / leave / leaderboard, 6-char codes)
- [x] `GroupsScreen.tsx` (create, join, member list, pooled leaderboard)
- [x] Entry point from Account tab
- [x] Entry point added to the orange 4-item menu on Home (now 5 items)
- [ ] Confirm/clean up any remaining stale "Groups" references elsewhere in the app. UI only.

## Migration work still required

**None.** All database changes for these three features are already applied:
- `user_renewables.position_x / position_y` ✓
- `groups`, `group_members`, `is_group_member()` ✓

Everything still open is frontend/presentation work (heat overlay on the borough map, Nelson button on the Cool the Borough screen, optional group-boost wiring, stale-link cleanup).
