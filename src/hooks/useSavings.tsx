import { useEffect, useState, useCallback } from 'react';

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
};

const KEY = 'eco_state_v2';
const EVT = 'eco_state_update';

const DEFAULT: State = {
  savings: { money: 515, co2: 1417, water: 0 },
  pledged: [],
  woolPoints: 250,
  treePoints: 120,
  treesPlanted: 4,
  renewables: [],
  accessories: [],
};

const RESET_KEY = 'eco_accessories_reset_v1';
const read = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = { ...DEFAULT, ...(JSON.parse(raw) as Partial<State>) };
    // One-time reset of accessories (user requested clean slate)
    if (!localStorage.getItem(RESET_KEY)) {
      parsed.accessories = [];
      localStorage.setItem(KEY, JSON.stringify(parsed));
      localStorage.setItem(RESET_KEY, '1');
    }
    return parsed;
  } catch {
    return DEFAULT;
  }
};

const write = (s: State) => {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
};

export const RENEWABLE_COSTS: Record<RenewableType, number> = {
  solar: 50,
  wind: 80,
  mine_water: 120,
};

export const useSavings = () => {
  const [state, setState] = useState<State>(() => read());

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

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

  return {
    ...state,
    addPledge,
    buyRenewable,
    buyAccessory,
    plantTree,
  };
};
