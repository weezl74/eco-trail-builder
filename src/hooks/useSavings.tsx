import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  api,
  createRenewable,
  createTreeRequest,
  fetchMyProfile,
  fetchRenewables,
  fetchTreeRequests,
} from "@/lib/api";

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
  technology_type?: string;
  points_cost?: number;
  position_x?: number | null;
  position_y?: number | null;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
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
  // Renewables (placed on the map) — backend source of truth
  // -------------------------------------------------------------------------
  const [renewables, setRenewables] = useState<PlacedRenewable[]>([]);

  const refreshRenewables = useCallback(async () => {
    if (!userId) {
      setRenewables([]);
      return;
    }

    try {
      const rows = await fetchRenewables(userId);
      setRenewables(
        rows.map((r) => ({
          id: r.id,
          type: (r.technology_type as RenewableType) || "solar",
          technology_type: r.technology_type,
          points_cost: r.points_cost,
          position_x: r.position_x ?? null,
          position_y: r.position_y ?? null,
          lat: r.latitude ?? r.lat ?? null,
          lng: r.longitude ?? r.lng ?? null,
          latitude: r.latitude ?? r.lat ?? null,
          longitude: r.longitude ?? r.lng ?? null,
        })),
      );
    } catch (err) {
      console.error("refreshRenewables error", err);
      setRenewables([]);
    }
  }, [userId]);

  useEffect(() => {
    refreshRenewables();
  }, [refreshRenewables]);

  const buyRenewable = useCallback(
    async (type: RenewableType, x?: number, y?: number, lat?: number, lng?: number) => {
      if (!userId) return false;
      const cost = RENEWABLE_COSTS[type];
      if (woolPoints < cost) return false;

      try {
        const saved = await createRenewable({
          user_id: userId,
          technology_type: type,
          points_cost: cost,
          position_x: x ?? null,
          position_y: y ?? null,
          latitude: lat ?? null,
          longitude: lng ?? null,
        });
        const row = saved?.data ?? saved?.row ?? saved;
        if (row?.id) {
          setRenewables((prev) => [
            ...prev,
            {
              id: row.id,
              type,
              technology_type: row.technology_type ?? type,
              points_cost: row.points_cost ?? cost,
              position_x: row.position_x ?? x ?? null,
              position_y: row.position_y ?? y ?? null,
              lat: row.latitude ?? row.lat ?? lat ?? null,
              lng: row.longitude ?? row.lng ?? lng ?? null,
              latitude: row.latitude ?? row.lat ?? lat ?? null,
              longitude: row.longitude ?? row.lng ?? lng ?? null,
            },
          ]);
        } else {
          await refreshRenewables();
        }
        await refreshPoints();
        return true;
      } catch (err) {
        console.error("buyRenewable error", err);
        return false;
      }
    },
    [userId, woolPoints, refreshRenewables, refreshPoints],
  );

  // -------------------------------------------------------------------------
  // Trees (verified tree-planting actions) — backend source of truth
  // -------------------------------------------------------------------------
  const [treesPlanted, setTreesPlanted] = useState<number>(0);

  const refreshTreeRequests = useCallback(async () => {
    if (!userId) {
      setTreesPlanted(0);
      return;
    }

    try {
      const rows = await fetchTreeRequests(userId);
      setTreesPlanted(rows.length);
    } catch (err) {
      console.error("refreshTreeRequests error", err);
      setTreesPlanted(0);
    }
  }, [userId]);

  useEffect(() => {
    refreshTreeRequests();
  }, [refreshTreeRequests]);

  const plantTree = useCallback(
    async (cost: number = 0) => {
      if (!userId) return false;
      if (cost > 0 && woolPoints < cost) return false;

      try {
        await createTreeRequest({
          user_id: userId,
          points_used: cost,
          status: "pending",
          tree_species: "Native Oak",
        });
        await refreshTreeRequests();
        await refreshPoints();
        return true;
      } catch (err) {
        console.error("plantTree error", err);
        return false;
      }
    },
    [userId, woolPoints, refreshTreeRequests, refreshPoints],
  );

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
