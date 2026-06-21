import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PointsType = 'wool' | 'tree';

export type PointsBreakdown = {
  wool: number;
  tree: number;
  total: number;
};

/**
 * Two-tier points system.
 *
 * - `profiles.total_points` is the single source of truth for the leaderboard.
 * - `user_points_ledger` is an append-only log used to derive the
 *   wool / tree split for display only.
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
    const [{ data: profile }, { data: ledger }] = await Promise.all([
      supabase.from('profiles').select('total_points').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('user_points_ledger')
        .select('points, points_type')
        .eq('user_id', user.id),
    ]);

    const total = profile?.total_points ?? 0;
    let wool = 0;
    let tree = 0;
    for (const row of ledger ?? []) {
      if (row.points_type === 'tree') tree += row.points;
      else wool += row.points;
    }
    // If the ledger hasn't been used yet, attribute the existing total to wool
    // so the leaderboard total (source of truth) stays accurate.
    if (wool + tree === 0 && total > 0) wool = total;

    setBreakdown({ wool, tree, total });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Award points: writes a ledger row AND bumps profiles.total_points.
   * Never recompute totals from the ledger — total_points stays authoritative.
   *
   * Use `tree` only for verified actions (accelerometer, location, referral).
   * Use `wool` for self-reported / unverified actions.
   */
  const award = useCallback(
    async (points: number, type: PointsType, source: string, referenceId?: string) => {
      if (!user || points <= 0) return;

      await supabase.from('user_points_ledger').insert({
        user_id: user.id,
        points,
        points_type: type,
        source,
        reference_id: referenceId ?? null,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      const newTotal = (profile?.total_points ?? 0) + points;
      await supabase.from('profiles').update({ total_points: newTotal }).eq('user_id', user.id);

      await refresh();
    },
    [user, refresh]
  );

  return { ...breakdown, loading, refresh, award };
};
