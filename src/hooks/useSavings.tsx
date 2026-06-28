import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, fetchMyProfile } from "@/lib/api";

// ---------------------------------------------------------------------------
// Renewable tech catalogue (kept in-app, no backend coupling)
// ---------------------------------------------------------------------------
export type RenewableType = "solar" | "wind" | "mine_water";

export const RENEWABLE_COSTS: Record<RenewableType, number> = {
  solar: 50,
  wind: 75,
  mine_water: 120,
};

export type PlacedRenewable = {
  id: string;
  type: RenewableType;
  lat?: number | null;
  lng?: number | null;
};

// ---------------------------------------------------------------------------
// localStorage helpers — per-user where it matters
// ---------------------------------------------------------------------------
const lsGet = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
};

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const ns = userId ? `savings:${userId}` : "savings:anon";

  // -------------------------------------------------------------------------
  // Points (wool from backend profile, tree mirrored locally)
  // -------------------------------------------------------------------------
  const [woolPoints, setWoolPoints] = useState(0);
  const [treePoints, setTreePoints] = useState(0);

  const refreshPoints = useCallback(async () => {
    if (!userId) return;
    try {
      const profile = await fetchMyProfile(userId);
      setWoolPoints(profile?.wool_points ?? profile?.total_points ?? 0);
      setTreePoints(profile?.tree_points ?? 0);
    } catch (err) {
      console.error("refreshPoints error", err);
    }
  }, [userId]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints]);

  // -------------------------------------------------------------------------
  // Pledges
  // -------------------------------------------------------------------------
  const [pledged, setPledged] = useState<string[]>(() => lsGet(`${ns}:pledged`, [] as string[]));
  useEffect(() => {
    setPledged(lsGet(`${ns}:pledged`, [] as string[]));
  }, [ns]);

  const addPledge = useCallback(
    async (id: string, data: { wool?: number; money: number; co2: number; water: number }) => {
      if (!userId) return false;
      if (pledged.includes(id)) return false;
      try {
        await api.post("/pledges", {
          user_id: userId,
          category: "general",
          action: id,
          points_earned: data.wool ?? 0,
        });
        const next = [...pledged, id];
        setPledged(next);
        lsSet(`${ns}:pledged`, next);

        // local savings mirror
        setSavings((s) => {
          const merged = {
            money: s.money + (data.money || 0),
            co2: s.co2 + (data.co2 || 0),
            water: s.water + (data.water || 0),
          };
          lsSet(`${ns}:savings`, merged);
          return merged;
        });

        await refreshPoints();
        return true;
      } catch (err) {
        console.error("addPledge error", err);
        return false;
      }
    },
    [userId, pledged, ns, refreshPoints],
  );

  // -------------------------------------------------------------------------
  // Aggregated savings (money / co2 / water) — local mirror for display
  // -------------------------------------------------------------------------
  const [savings, setSavings] = useState(() =>
    lsGet(`${ns}:savings`, { money: 0, co2: 0, water: 0 }),
  );
  useEffect(() => {
    setSavings(lsGet(`${ns}:savings`, { money: 0, co2: 0, water: 0 }));
  }, [ns]);

  // -------------------------------------------------------------------------
  // Avatar customisation (colours + accessories)
  // -------------------------------------------------------------------------
  const [woolColor, setWoolColorState] = useState<string>(() => lsGet(`${ns}:woolColor`, "#F5F5DC"));
  const [cardColor, setCardColorState] = useState<string>(() => lsGet(`${ns}:cardColor`, "#F4971D"));
  const [accessories, setAccessories] = useState<string[]>(() => lsGet(`${ns}:accessories`, [] as string[]));

  useEffect(() => {
    setWoolColorState(lsGet(`${ns}:woolColor`, "#F5F5DC"));
    setCardColorState(lsGet(`${ns}:cardColor`, "#F4971D"));
    setAccessories(lsGet(`${ns}:accessories`, [] as string[]));
  }, [ns]);

  const setWoolColor = useCallback(
    (c: string) => {
      setWoolColorState(c);
      lsSet(`${ns}:woolColor`, c);
    },
    [ns],
  );
  const setCardColor = useCallback(
    (c: string) => {
      setCardColorState(c);
      lsSet(`${ns}:cardColor`, c);
    },
    [ns],
  );

  const buyAccessory = useCallback(
    (id: string, cost: number) => {
      if (accessories.includes(id)) return false;
      if (woolPoints < cost) return false;
      const next = [...accessories, id];
      setAccessories(next);
      lsSet(`${ns}:accessories`, next);
      setWoolPoints((p) => p - cost);
      return true;
    },
    [accessories, woolPoints, ns],
  );

  const refundAccessory = useCallback(
    (id: string, cost: number) => {
      if (!accessories.includes(id)) return false;
      const next = accessories.filter((a) => a !== id);
      setAccessories(next);
      lsSet(`${ns}:accessories`, next);
      setWoolPoints((p) => p + cost);
      return true;
    },
    [accessories, ns],
  );

  // -------------------------------------------------------------------------
  // Renewables (placed on the map)
  // -------------------------------------------------------------------------
  const [renewables, setRenewables] = useState<PlacedRenewable[]>(() =>
    lsGet(`${ns}:renewables`, [] as PlacedRenewable[]),
  );
  useEffect(() => {
    setRenewables(lsGet(`${ns}:renewables`, [] as PlacedRenewable[]));
  }, [ns]);

  const buyRenewable = useCallback(
    (type: RenewableType, _x?: number, _y?: number, lat?: number, lng?: number) => {
      const cost = RENEWABLE_COSTS[type];
      if (woolPoints < cost) return false;
      const item: PlacedRenewable = {
        id: `${type}-${Date.now()}`,
        type,
        lat: lat ?? null,
        lng: lng ?? null,
      };
      const next = [...renewables, item];
      setRenewables(next);
      lsSet(`${ns}:renewables`, next);
      setWoolPoints((p) => p - cost);
      return true;
    },
    [renewables, woolPoints, ns],
  );

  // -------------------------------------------------------------------------
  // Trees (verified tree-planting actions)
  // -------------------------------------------------------------------------
  const [treesPlanted, setTreesPlanted] = useState<number>(() => lsGet(`${ns}:treesPlanted`, 0));
  useEffect(() => {
    setTreesPlanted(lsGet(`${ns}:treesPlanted`, 0));
  }, [ns]);

  const plantTree = useCallback(() => {
    setTreesPlanted((n) => {
      const next = n + 1;
      lsSet(`${ns}:treesPlanted`, next);
      return next;
    });
    setTreePoints((p) => p + 1);
  }, [ns]);

  return {
    // points
    woolPoints,
    treePoints,
    refreshPoints,
    // pledges
    pledged,
    addPledge,
    // savings totals
    savings,
    // avatar
    woolColor,
    setWoolColor,
    cardColor,
    setCardColor,
    accessories,
    buyAccessory,
    refundAccessory,
    // renewables
    renewables,
    buyRenewable,
    // trees
    treesPlanted,
    plantTree,
  };
};
