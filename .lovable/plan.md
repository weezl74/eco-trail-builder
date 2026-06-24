# Nelson Avatar – Render Fix, Points Ledger Fix, Asset & API Brief

No code is written until you approve. Pixel positions of SVGs are NOT changed — only the whole stack shifts left.

---

## 1. Bug: NelsonAvatar.tsx is not rendering most layers

Right now the file contains literal text instead of `<img>` tags:

```
/body-base.svg
/body-limbs.svg
/glasses-basic.svg
...
```

These render as visible text and the layers don't show. Only the wool-colour mask and the head `<img>` actually work. Also, `SheepAvatarScreen` passes `className="w-64 h-64"` and `head` to `NelsonAvatar`, but the component's `Props` doesn't accept either, so the size class is ignored.

### Fix (no positions changed)
- Convert every layer to a real absolutely-positioned `<img>` with `inset:0; width:100%; height:100%; pointer-events:none`.
- Accept `className` and `head` props.
- Wrap everything in a fixed-ratio `aspect-square` container so the inner `inset:0` layers always align pixel-perfect.
- Apply the global left-shift here (one place only): wrap the stack in an inner `<div>` with `transform: translateX(-X%)` (default `X = 6`, easily tweaked). Because every layer is `inset:0` inside this wrapper, alignment is preserved.
- Keep current z-order: body-base → wool mask → body-limbs → head (with variant) → glasses → hats.

No SVG file is edited. No layer is repositioned relative to another.

---

## 2. Points ledger is double-booked

`useSavings.buyAccessory` / `refundAccessory` / `buyRenewable` / `plantTree` mutate `woolPoints` / `treePoints` **locally** AND call `spendPoints` on the API. The screen shows `woolPoints` from local state, while `usePoints` shows the API value. They drift apart, and on a fresh device the local cache wins until cloud sync overwrites it — which looks like "points aren't working".

Two more issues:
- Pledges award 25 wool + 2 tree **locally only** (`addPledge`) — no `/update-points` call. So the API never sees them.
- The leaderboard component reads from the API; the avatar screen reads from local state. Same user, two different totals.

### Fix
- Make the API the single source of truth for both wool and tree balances inside `useSavings` (mirror what `usePoints` already does).
- On every earn/spend: call the API first, then refresh `woolPoints`/`treePoints` from `fetchMyProfile`. Keep `accessories`, `renewables`, `cardColor`, `woolColor`, `pledged`, `savings`, `treesPlanted` in the existing `user_state` blob (those are not points).
- `addPledge` must call `/update-points` with `woolDelta: 25, treeDelta: 2`.
- `refundAccessory` already sends `woolDelta: -cost` — keep, but rely on the API response for the new balance.
- Dispatch `points:updated` after every call so the leaderboard and header refresh.

---

## 3. Azure / API changes you need

Backend stays as described in `docs/POINTS_SYSTEM.md`. The only things the frontend will call:

| Endpoint | Method | Body | Notes |
|---|---|---|---|
| `/update-points` | POST | `{ user_id, woolDelta, treeDelta, source, reference_id }` | Already used by `usePoints.award`. Must accept positive integers and update `wool_points`, `tree_points`, `total_points`. |
| `/spend-points` | POST | `{ user_id, woolDelta, treeDelta, reason, reference_id }` | Already exists. Must accept **negative** `woolDelta` for refunds (or add a sibling `/refund-points`). Confirm one of these. |
| `/profile` | GET | — | Must return `wool_points`, `tree_points`, `total_points` per user. |

Profile / ledger schema (Azure SQL or Cosmos — same shape):

```
profiles( user_id PK, display_name, wool_points int, tree_points int, total_points int, account_type )
user_points_ledger( id, user_id, points int (signed), points_type 'wool'|'tree', source, reference_id, created_at )
```

Required behaviour:
- Every `/update-points` and `/spend-points` call writes one ledger row (signed `points`).
- `total_points = wool_points + tree_points` maintained on write (transactional).
- Refunds: easiest is to allow negative deltas on `/spend-points`. **Please confirm** which option you want — I'll wire whichever you pick.

No other API changes are needed for this avatar work.

---

## 4. Assets — what exists vs. what's missing

### Already in place (do not re-supply)
```
public/body-base.svg
public/body-mask.svg
public/body-limbs.svg
public/profile/body-base-nohead.svg          (unused after fix – safe to keep)
public/profile/head-nelson-base.svg
public/profile/head-nelson-bowtie.svg
public/profile/head-nelson-stubble.svg
public/profile/head-nelson-longbeard.svg
public/profile/head-nelson-mohawk.svg
```

### Missing — please create as 500×500 SVGs aligned to the same Nelson frame as the heads (transparent background, content positioned exactly where it should sit on Nelson's head/face)

Save all of these in `public/profile/` with these exact filenames:

| Filename | What it is |
|---|---|
| `public/profile/acc-glasses.svg` | Plain glasses, aligned to Nelson's eyes |
| `public/profile/acc-star-glasses.svg` | Star-shaped glasses, same eye position |
| `public/profile/acc-cap.svg` | Baseball cap, sitting on top of Nelson's head |
| `public/profile/acc-pirate-hat.svg` | Pirate hat, same crown position |
| `public/profile/acc-sun-hat.svg` | Sun hat, same crown position |
| `public/profile/head-barb-base.svg` | Barb head, same 500×500 frame as Nelson heads (only needed if the Barb toggle should actually swap the head — otherwise the toggle is cosmetic) |

Optional (only if you want these as separate layers instead of baked-in head variants — currently they're baked into the head SVGs, which is fine):
- `public/profile/acc-bowtie.svg`, `acc-stubble.svg`, `acc-long-beard.svg`, `acc-mohawk.svg`

If any of the above should be skipped, tell me and I'll just not reference it.

The existing `public/glasses-basic.svg`, `glasses-star.svg`, `hat-cap.svg`, `hat-pirate.svg`, `hat-sun.svg` will still be used as the **picker thumbnails** (they don't need to be frame-aligned).

---

## 5. Global left-shift

A single `translateX(-6%)` on the avatar stack wrapper (tunable constant at top of `NelsonAvatar.tsx`) moves the whole composition left without touching any SVG. If 6% is wrong, change one number.

---

## 6. Out of scope / explicitly not touched

- No SVG file edits.
- No change to relative positions between layers.
- No change to the accessories list, costs, or carbon notes.
- No Supabase schema work (Azure-only, per your instruction — `user_state` blob continues to use whatever Lovable Cloud table you currently have; only points move to the API).

---

## Approve to proceed and I will:
1. Rewrite `src/components/NelsonAvatar.tsx` (real `<img>` layers, `className`/`head` props, left-shift constant).
2. Patch `src/hooks/useSavings.tsx` so points always go via the API and `woolPoints`/`treePoints` always come back from `/profile`.
3. Add the `/update-points` call inside `addPledge`.

Tell me:
- (a) Which refund mechanism on the API — negative `/spend-points` or new `/refund-points`?
- (b) Confirm the missing-asset filenames above before I reference them.
