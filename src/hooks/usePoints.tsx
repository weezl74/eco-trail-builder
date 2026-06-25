
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, fetchMyProfile } from '@/lib/api';

export type PointsType = 'wool' | 'tree';

export type PointsBreakdown = {
  wool: number;
  tree: number;
  total: number;
};

export const usePoints = () => {
  const { user } = useAuth();

  const [breakdown, setBreakdown] = useState<PointsBreakdown>({
    wool: 0,
    tree: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  // ✅ REAL REFRESH FROM BACKEND
  const refresh = useCallback(async () => {
    if (!user) return;

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
   * ✅ CENTRAL UPDATE FUNCTION
   */
  const update = useCallback(
    async (
      points: number,
      type: PointsType,
      source: string,
      referenceId?: string,
      isRefund: boolean = false
    ) => {
      if (!user || points <= 0) return;

      // ✅ enforce correct sign BEFORE sending
      const signedPoints = isRefund ? Math.abs(points) : -Math.abs(points);

      try {
        await api.post('/update-points', {
          user_id: user.id,
          woolDelta: type === 'wool' ? signedPoints : 0,
          treeDelta: type === 'tree' ? signedPoints : 0,
          source,
          reference_id: referenceId,
        });

      } catch (e) {
        console.error('[usePoints] update failed', e);
      }

      // ✅ CRITICAL FIX: force refresh AFTER update
      await refresh();
    },
    [user, refresh]
  );

  return {
    ...breakdown,
    loading,
    refresh,
    update,
  };
};
