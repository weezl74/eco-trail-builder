import { useEffect, useState, useCallback } from 'react';

export type Saving = { money: number; co2: number; water: number };

const KEY_SAVINGS = 'eco_savings_v1';
const KEY_PLEDGES = 'eco_pledges_v1';

const DEFAULT: Saving = { money: 515, co2: 1417, water: 0 };

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const EVT = 'eco_savings_update';

export const useSavings = () => {
  const [savings, setSavings] = useState<Saving>(() => read(KEY_SAVINGS, DEFAULT));
  const [pledged, setPledged] = useState<string[]>(() => read(KEY_PLEDGES, []));

  useEffect(() => {
    const sync = () => {
      setSavings(read(KEY_SAVINGS, DEFAULT));
      setPledged(read(KEY_PLEDGES, []));
    };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addPledge = useCallback(
    (id: string, delta: Saving) => {
      const currentPledges = read<string[]>(KEY_PLEDGES, []);
      if (currentPledges.includes(id)) return false;
      const current = read<Saving>(KEY_SAVINGS, DEFAULT);
      const next: Saving = {
        money: current.money + delta.money,
        co2: current.co2 + delta.co2,
        water: current.water + delta.water,
      };
      localStorage.setItem(KEY_SAVINGS, JSON.stringify(next));
      localStorage.setItem(KEY_PLEDGES, JSON.stringify([...currentPledges, id]));
      window.dispatchEvent(new Event(EVT));
      return true;
    },
    []
  );

  return { savings, pledged, addPledge };
};
