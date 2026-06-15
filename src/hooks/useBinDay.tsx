import { useCallback, useEffect, useState } from 'react';

export type BinDayConfig = {
  postcode: string;
  collectionDay: number; // 0=Sun .. 6=Sat
  generalAnchor: string; // ISO date of a known general/black-bag collection
  nudge: boolean;
};

const KEY = 'bin_day_config_v1';
const DISMISS_KEY = 'bin_day_dismissed_v1';
const EVT = 'bin_day_update';

const read = (): BinDayConfig | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BinDayConfig) : null;
  } catch {
    return null;
  }
};

const readDismissed = () => localStorage.getItem(DISMISS_KEY) === '1';

const write = (c: BinDayConfig | null) => {
  if (c) localStorage.setItem(KEY, JSON.stringify(c));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
};

export const nextCollection = (cfg: BinDayConfig, from: Date = new Date()) => {
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  const diff = (cfg.collectionDay - base.getDay() + 7) % 7;
  const next = new Date(base);
  next.setDate(base.getDate() + (diff === 0 ? 0 : diff));
  // If today is collection day but already past, push to next week
  if (diff === 0 && from.getHours() >= 18) next.setDate(next.getDate() + 7);

  const anchor = new Date(cfg.generalAnchor);
  anchor.setHours(0, 0, 0, 0);
  const days = Math.round((next.getTime() - anchor.getTime()) / 86400000);
  const generalToday = days >= 0 && days % 14 === 0;

  return {
    date: next,
    recycling: true,
    foodGarden: true,
    general: generalToday,
  };
};

export const useBinDay = () => {
  const [config, setConfig] = useState<BinDayConfig | null>(() => read());
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed());

  useEffect(() => {
    const sync = () => { setConfig(read()); setDismissed(readDismissed()); };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const save = useCallback((c: BinDayConfig) => write(c), []);
  const clear = useCallback(() => write(null), []);
  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1');
    write(null);
  }, []);
  const restore = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY);
    window.dispatchEvent(new Event(EVT));
  }, []);

  return { config, dismissed, save, clear, dismiss, restore };
};
