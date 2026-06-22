import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { spendPoints } from '@/lib/api';

export type Saving = { money: number; co2: number; water: number };
export type RenewableType = 'solar' | 'wind' | 'mine_water';
export type Renewable = {
  id: string;
  type: RenewableType;
  /** Legacy screen-% position (still written for older clients). */
  x: number;
  y: number;
  /** Geo-anchored position so pins stay where the user tapped. */
  lat?: number;
  lng?: number;
};

type State = {
  savings: Saving;
  pledged: string[];
  woolPoints: number;
  treePoints: number;
  treesPlanted: number;
  renewables: Renewable[];
  accessories: string[];
  cardColor: string;
  woolColor: string;
};

const LEGACY_BASE = 'eco_state_v2';
const CACHE_BASE = 'cloudrow:user_state:data';
const EVT = 'eco_state_update';

// Fresh defaults for newly registered users — no inherited points, no accessories,
// stock cream wool so they see the uncustomised Nelson.
const DEFAULT: State = {
  savings: { money: 0, co2: 0, water: 0 },
  pledged: [],
  woolPoints: 0,
  treePoints: 0,
  treesPlanted: 0,
  renewables: [],
  accessories: [],
  cardColor: 'midnight',
  woolColor: '#e8d9b8',
};

export const RENEWABLE_COSTS: Record<RenewableType, number> = {
  solar: 50,
  wind: 80,
  mine_water: 120,
};

const cacheKey = (uid: string) => `${CACHE_BASE}:${uid}`;
const legacyKey = (uid: string) => `${LEGACY_BASE}:${uid}`;

const readCache = (uid: string | null): State => {
  if (!uid) return DEFAULT;
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<State>) };
    // one-off migration from legacy device-local key
    const legacy = localStorage.getItem(legacyKey(uid));
    if (legacy) return { ...DEFAULT, ...(JSON.parse(legacy) as Partial<State>) };
  } catch {}
  return DEFAULT;
};

const writeCache = (uid: string | null, s: State) => {
  if (!uid) return;
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(s));
  } catch {}
};

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<State>(() => readCache(userId));
  const latest = useRef(state);
  latest.current = state;

  // Load from cloud on user change.
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setState(DEFAULT);
      return;
    }
    setState(readCache(userId));
    (async () => {
      const { data } = await supabase
        .from('user_state')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (data && data.data) {
        const merged = { ...DEFAULT, ...(data.data as Partial<State>) };
        setState(merged);
        writeCache(userId, merged);
      } else {
        // No row yet — if we have a legacy localStorage blob, push it up once.
        try {
          const legacy = localStorage.getItem(legacyKey(userId));
          if (legacy) {
            const merged = { ...DEFAULT, ...(JSON.parse(legacy) as Partial<State>) };
            await supabase
              .from('user_state')
              .upsert({ user_id: userId, data: merged as any }, { onConflict: 'user_id' });
            setState(merged);
            writeCache(userId, merged);
            localStorage.removeItem(legacyKey(userId));
          }
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Cross-tab / cross-component sync.
  useEffect(() => {
    const sync = () => setState(readCache(userId));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const persist = useCallback(
    async (next: State) => {
      setState(next);
      writeCache(userId, next);
      window.dispatchEvent(new Event(EVT));
      if (!userId) return;
      await supabase
        .from('user_state')
        .upsert({ user_id: userId, data: next as any }, { onConflict: 'user_id' });
    },
    [userId],
  );

  const addPledge = useCallback(
    (id: string, delta: Saving) => {
      const s = latest.current;
      if (s.pledged.includes(id)) return false;
      const next: State = {
        ...s,
        pledged: [...s.pledged, id],
        savings: {
          money: s.savings.money + delta.money,
          co2: s.savings.co2 + delta.co2,
          water: s.savings.water + delta.water,
        },
        woolPoints: s.woolPoints + 25,
        treePoints: s.treePoints + 2,
      };
      void persist(next);
      return true;
    },
    [persist],
  );

  const buyRenewable = useCallback(
    (type: RenewableType, x: number, y: number, lat?: number, lng?: number) => {
      const s = latest.current;
      const cost = RENEWABLE_COSTS[type];
      if (s.woolPoints < cost) return false;
      void persist({
        ...s,
        woolPoints: s.woolPoints - cost,
        renewables: [
          ...s.renewables,
          {
            id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            x,
            y,
            lat,
            lng,
          },
        ],
      });
      if (userId) {
        void spendPoints({ user_id: userId, woolDelta: cost, reason: `renewable:${type}` })
          .catch((e) => console.error('[useSavings] spendPoints renewable failed', e))
          .finally(() =>
            window.dispatchEvent(new CustomEvent('points:updated', { detail: { userId } })),
          );
      }
      return true;
    },
    [persist, userId],
  );

  const buyAccessory = useCallback(
    (id: string, cost: number) => {
      const s = latest.current;
      if (s.accessories.includes(id)) return true;
      if (s.woolPoints < cost) return false;
      void persist({ ...s, woolPoints: s.woolPoints - cost, accessories: [...s.accessories, id] });
      if (userId) {
        void spendPoints({ user_id: userId, woolDelta: cost, reason: `accessory:${id}` })
          .catch((e) => console.error('[useSavings] spendPoints accessory failed', e))
          .finally(() =>
            window.dispatchEvent(new CustomEvent('points:updated', { detail: { userId } })),
          );
      }
      return true;
    },
    [persist, userId],
  );

  const plantTree = useCallback(
    (cost = 100) => {
      const s = latest.current;
      if (s.treePoints < cost) return false;
      void persist({ ...s, treePoints: s.treePoints - cost, treesPlanted: s.treesPlanted + 1 });
      if (userId) {
        void spendPoints({ user_id: userId, treeDelta: cost, reason: 'tree:plant' })
          .catch((e) => console.error('[useSavings] spendPoints tree failed', e))
          .finally(() =>
            window.dispatchEvent(new CustomEvent('points:updated', { detail: { userId } })),
          );
      }
      return true;
    },
    [persist, userId],
  );

  const setCardColor = useCallback(
    (color: string) => {
      void persist({ ...latest.current, cardColor: color });
    },
    [persist],
  );

  const setWoolColor = useCallback(
    (color: string) => {
      void persist({ ...latest.current, woolColor: color });
    },
    [persist],
  );

  return {
    ...state,
    addPledge,
    buyRenewable,
    buyAccessory,
    plantTree,
    setCardColor,
    setWoolColor,
  };
};
