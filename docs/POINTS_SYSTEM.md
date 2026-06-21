# Points System — Wool & Tree

A two-tier points model that distinguishes **unverified** engagement points from **verified** real-world impact points, while keeping `profiles.total_points` as the single source of truth for the leaderboard.

---

## 1. Overview

| Type | Symbol | Verified? | Purpose | Examples |
|------|--------|-----------|---------|----------|
| **Wool Points** | 🧶 | No | Engagement, gamification, avatar/Nelson customisation, unlockables | Pledges, self-reported behaviours (thermostat down), quiz completion |
| **Tree Points** | 🌳 | Yes | Scarce, meaningful rewards tied to real-world impact (e.g. tree planting) | Accelerometer-validated walks, location-verified visits, validated referrals, onboarding with real data |

**Design intent:**
- Wool = high volume, easy to earn, drives daily engagement.
- Tree = scarce, harder to earn, backed by external/system validation, redeemable for limited real-world rewards.

---

## 2. Source of Truth

**Leaderboard MUST read from `profiles.total_points`. Never recompute totals dynamically.**

```
total_points = wool_points + tree_points   (conceptually)
```

The split into wool/tree is for **display and spending rules**, not for leaderboard ranking.

---

## 3. Backend Model (Minimal Extension)

We do **NOT** redesign the database. The existing `profiles.total_points` column remains authoritative.

### Optional ledger table

Add only if per-action tracking is required (recommended for audit + future recalculation):

```sql
CREATE TABLE user_points_ledger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  points        int  NOT NULL,
  points_type   text NOT NULL CHECK (points_type IN ('wool','tree')),
  source        text NOT NULL,           -- e.g. 'pledge.created', 'walk.verified'
  reference_id  text,                    -- optional FK-like reference
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

The ledger is a **transaction log**, not the scoring source.

---

## 4. Award Flow

Every time points are awarded:

1. Determine type:
   - Verified action → **tree**
   - Unverified action → **wool**
2. (Optional) Insert row into `user_points_ledger`.
3. Increment the authoritative total:
   ```sql
   UPDATE profiles
   SET total_points = total_points + @points
   WHERE user_id = @user_id;
   ```

That's it. No joins, no recomputation, no JSON blobs.

---

## 5. Frontend Requirements

The UI displays three numbers:

- **Wool Points** (🧶)
- **Tree Points** (🌳)
- **Total Points** (= source-of-truth from `profiles.total_points`)

If the split is not yet persisted, wool/tree may be **derived or staged** from the ledger (or computed on the client from action history). `total_points` always wins as the displayed total.

### Spending rules

| Spend on | Currency |
|----------|----------|
| Avatar / Nelson customisation, unlockables, gamification | 🧶 Wool |
| Real-world rewards (tree planting, sustainability redemptions) | 🌳 Tree |

Spending decrements the relevant tracked balance **and** `profiles.total_points`.

---

## 6. Verification Requirements (Tree only)

A Tree point may only be awarded when at least one of:

- **System validation** — e.g. accelerometer-confirmed walk/cycle, GPS-verified location visit.
- **External confirmation** — e.g. referral signup completed by the referred user, validated onboarding data.

Self-reported actions are **always Wool**, never Tree.

---

## 7. Key Rules (do NOT break)

- ❌ Do **not** recompute totals dynamically for the leaderboard.
- ❌ Do **not** move points into JSON columns.
- ❌ Do **not** replace `profiles.total_points`.
- ❌ Do **not** add complex joins for leaderboard queries.
- ✅ Always `UPDATE profiles SET total_points = total_points + @n`.
- ✅ Ledger is for tracking and future recalculation, not for scoring.

---

## 8. Future Flexibility

This design allows, without restructuring:

- Changing earning rules per action.
- Recalculating wool/tree splits from the ledger.
- Introducing new point types (e.g. "community") by adding a value to `points_type`.
- Migrating to a different backend (e.g. Azure) — only `profiles.total_points` + optional ledger need to move.

---

## 9. Final Note

Extend only where necessary. Keep the system simple, stable, and aligned with `profiles.total_points`.
