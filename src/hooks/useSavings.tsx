import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, fetchMyProfile } from "@/lib/api";

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [points, setPoints] = useState({ wool: 0 });

  // ✅ get points from backend
  const refreshPoints = useCallback(async () => {
    if (!userId) return;

    try {
      const profile = await fetchMyProfile(userId);

      setPoints({
        wool: profile?.total_points ?? 0,
      });
    } catch (err) {
      console.error("refreshPoints error", err);
    }
  }, [userId]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints]);

  // ✅ pledges
  const [pledged, setPledged] = useState<string[]>([]);

  const addPledge = useCallback(
    async (id: string, data: { wool: number; money: number; co2: number; water: number }) => {
      if (!userId) return false;
      if (pledged.includes(id)) return false;

      try {
        await api.post("/pledges", {
          user_id: userId,
          category: "general",
          action: id,
          points_earned: data.wool ?? 0,
        });

        setPledged((prev) => [...prev, id]);

        await refreshPoints();

        return true;
      } catch (err) {
        console.error("addPledge error", err);
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
