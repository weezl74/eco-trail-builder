import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, fetchMyProfile } from "@/lib/api";

export type PointsType = "wool" | "tree";

export type PointsBreakdown = {
  wool: number;
  tree: number;
  total: number;
};

/**
 * Two-tier points system — backed by the Caerphilly API.
 *
 * Backend is ALWAYS the source of truth.
 * All updates go through POST /update-points using SIGNED values:
 *  - spend = negative
 *  - refund / award = positive
 */
export const usePoints = () => {
  const { user } = useAuth();
  const [breakdown, setBreakdown] = useState<PointsBreakdown>({
    wool: 0,
    tree: 0,
    total: 0,
  });
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
      console.error("[usePoints] refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Award points (always positive)
   */
  const award = useCallback(
    async (points: number, type: PointsType, source?: string, referenceId?: string) => {
      if (!user || points <= 0) return;

      try {
        await api.post("/update-points", {
          user_id: user.id,
          woolDelta: type === "wool" ? points : 0,
          treeDelta: type === "tree" ? points : 0,
          source: source || "award",
          reference_id: referenceId,
        });
      } catch (e) {
        console.error("[usePoints] award failed", e);
      }

      await refresh();
      window.dispatchEvent(new CustomEvent("points:updated", { detail: { userId: user.id } }));
    },
    [user, refresh],
  );

  /**
   * Spend OR refund points using signed values
   *
   * spend → negative
   * refund → positive
   */
  const spend = useCallback(
    async (points: number, type: PointsType, source?: string, referenceId?: string, isRefund: boolean = false) => {
      if (!user || points <= 0) return;

      const signedPoints = isRefund ? points : -points;

      try {
        await api.post("/update-points", {
          user_id: user.id,
          woolDelta: type === "wool" ? signedPoints : 0,
          treeDelta: type === "tree" ? signedPoints : 0,
          source: source || (isRefund ? "refund" : "spend"),
          reference_id: referenceId,
        });
      } catch (e) {
        console.error("[usePoints] spend/refund failed", e);
      }

      await refresh();
      window.dispatchEvent(new CustomEvent("points:updated", { detail: { userId: user.id } }));
    },
    [user, refresh],
  );

  return {
    ...breakdown,
    loading,
    refresh,
    award,
    spend,
  };
};
