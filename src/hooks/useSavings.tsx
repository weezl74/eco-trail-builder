import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { api, fetchMyProfile } from "@/lib/api";

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [points, setPoints] = useState({ wool: 0, tree: 0 });

  // ✅ REFRESH POINTS
  const refreshPoints = useCallback(async () => {
    if (!userId) return;

    try {
      const p = await fetchMyProfile(userId);

      setPoints({
        wool: p?.total_points ?? 0,
        tree: 0,
      });
    } catch (e) {
      console.error("refreshPoints failed", e);
    }
  }, [userId]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints]);

  // ✅ PLEDGES ONLY (MINIMAL SAFE VERSION)
  const [pledged, setPledged] = useState<string[]>([]);

  const addPledge = useCallback(
    async (id: string, delta: { money: number; co2: number; water: number; wool?: number }) => {
      if (!userId) return false;
      if (pledged.includes(id)) return false;

      setPledged((prev) => [...prev, id]);

      try {
        await api.post("/pledges", {
          user_id: userId,
          category: "general",
          action: id,
          points_earned: delta.wool ?? 0,
        });

        await refreshPoints();
        return true;
      } catch (e) {
        console.error("addPledge failed", e);
        return false;
      }
    },
    [userId, pledged, refreshPoints],
  );

  return {
    pledged,
    woolPoints: points.wool,
    refreshPoints,
    addPledge,
  };
};
