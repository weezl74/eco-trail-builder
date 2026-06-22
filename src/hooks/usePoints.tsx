import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, fetchMyProfile, spendPoints } from '@/lib/api';

export type PointsType = 'wool' | 'tree';

export type PointsBreakdown = {
  wool: number;
  tree: number;
  total: number;
};

/**
 * Two-tier points system — backed by the Caerphilly API.
 *
 * Points are NEVER calculated or stored in frontend state alone.
 * Every action calls POST /update-points with { user_id, woolDelta, treeDelta }
 * and then refreshes from the API.
 *
 * See docs/POINTS_SYSTEM.md for the full specification.
 */
export const usePoints = () => {
  const { user } = useAuth();
  const [breakdown, setBreakdown] = useState<PointsBreakdown>({ wool: 0, tree: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setBreakdown({ wool: 0, tree: 0, total: 0 });
      return;
    }
    setLoading(true);
    try {
      const profile = await fetchMyProfile(user.id);
      const wool = profile?.wool_points ?? 0;
      const tree = profile?.tree_points ?? 0;
      const total = profile?.total_points ?? wool + tree;
      setBreakdown({ wool, tree, total });
    } catch (e) {
      console.error('[usePoints] refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Award points via the backend API. Always call this — never mutate state directly.
   *
   * Use `tree` only for verified actions (accelerometer, location, validated referrals).
   * Use `wool` for self-reported / unverified actions.
   */
  const award = useCallback(
    async (points: number, type: PointsType, source?: string, referenceId?: string) => {
      if (!user || points <= 0) return;
      try {
        await api.post('/update-points', {
          user_id: user.id,
          woolDelta: type === 'wool' ? points : 0,
          treeDelta: type === 'tree' ? points : 0,
          source,
          reference_id: referenceId,
        });
      } catch (e) {
        console.error('[usePoints] award failed', e);
      }
      // Always refresh from the API — it is the source of truth.
      await refresh();
      // Notify other components (e.g. leaderboard) to refresh too.
      window.dispatchEvent(new CustomEvent('points:updated', { detail: { userId: user.id } }));
    },
    [user, refresh]
  );

  return { ...breakdown, loading, refresh, award };
};
