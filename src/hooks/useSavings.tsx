import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type Saving = { money: number; co2: number; water: number };
export type RenewableType = 'solar' | 'wind' | 'mine_water';
export type Renewable = { id: string; type: RenewableType; x: number; y: number };

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

const BASE_KEY = 'eco_state_v2';
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

const keyFor = (userId?: string | null) => (userId ? `${BASE_KEY}:${userId}` : BASE_KEY);

const read = (userId?: string | null): State => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    return DEFAULT;
  }
};

const write = (s: State, userId?: string | null) => {
  localStorage.setItem(keyFor(userId), JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
};

export const RENEWABLE_COSTS: Record<RenewableType, number> = {
  solar: 50,
  wind: 80,
  mine_water: 120,
};

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<State>(() => read(userId));

  useEffect(() => {
    setState(read(userId));
    const sync = () => setState(read(userId));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const addPledge = useCallback((id: string, delta: Saving) => {
    const s = read();
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
      treePoints: s.treePoints + 10,
    };
    write(next);
    return true;
  }, []);

  const buyRenewable = useCallback((type: RenewableType, x: number, y: number) => {
    const s = read();
    const cost = RENEWABLE_COSTS[type];
    if (s.woolPoints < cost) return false;
    const next: State = {
      ...s,
      woolPoints: s.woolPoints - cost,
      renewables: [
        ...s.renewables,
        { id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, x, y },
      ],
    };
    write(next);
    return true;
  }, []);

  const buyAccessory = useCallback((id: string, cost: number) => {
    const s = read();
    if (s.accessories.includes(id)) return true;
    if (s.woolPoints < cost) return false;
    write({ ...s, woolPoints: s.woolPoints - cost, accessories: [...s.accessories, id] });
    return true;
  }, []);

  const plantTree = useCallback((cost = 100) => {
    const s = read();
    if (s.treePoints < cost) return false;
    write({ ...s, treePoints: s.treePoints - cost, treesPlanted: s.treesPlanted + 1 });
    return true;
  }, []);

  const setCardColor = useCallback((color: string) => {
    const s = read();
    write({ ...s, cardColor: color });
  }, []);

  const setWoolColor = useCallback((color: string) => {
    const s = read();
    write({ ...s, woolColor: color });
  }, []);

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
