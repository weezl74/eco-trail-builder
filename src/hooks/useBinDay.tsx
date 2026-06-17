import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type BinDayConfig = {
  postcode: string;
  collectionDay: number; // 0=Sun .. 6=Sat
  generalAnchor: string; // ISO date of a known general/black-bag collection
  nudge: boolean;
};

const CACHE_BASE = 'cloudrow:user_bin_day';
const LEGACY_KEY = 'bin_day_config_v1';
const LEGACY_DISMISS = 'bin_day_dismissed_v1';
const EVT = 'bin_day_update';

type Cache = { config: BinDayConfig | null; dismissed: boolean };

const cacheKey = (uid: string) => `${CACHE_BASE}:${uid}`;

const readCache = (uid: string | null): Cache => {
  if (!uid) return { config: null, dismissed: false };
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    return raw ? (JSON.parse(raw) as Cache) : { config: null, dismissed: false };
  } catch {
    return { config: null, dismissed: false };
  }
};

const writeCache = (uid: string | null, c: Cache) => {
  if (!uid) return;
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(c)); } catch {}
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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [cache, setCache] = useState<Cache>(() => readCache(userId));
  const latest = useRef(cache);
  latest.current = cache;

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setCache({ config: null, dismissed: false });
      return;
    }
    setCache(readCache(userId));
    (async () => {
      const { data } = await supabase
        .from('user_bin_day')
        .select('data, dismissed')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const next: Cache = {
          config: data.data && Object.keys(data.data as any).length ? (data.data as any as BinDayConfig) : null,
          dismissed: !!data.dismissed,
        };
        setCache(next);
        writeCache(userId, next);
      } else {
        // legacy migration
        try {
          const raw = localStorage.getItem(LEGACY_KEY);
          const dismissed = localStorage.getItem(LEGACY_DISMISS) === '1';
          if (raw || dismissed) {
            const config = raw ? (JSON.parse(raw) as BinDayConfig) : null;
            const next: Cache = { config, dismissed };
            await supabase.from('user_bin_day').upsert(
              { user_id: userId, data: (config ?? {}) as any, dismissed },
              { onConflict: 'user_id' },
            );
            setCache(next);
            writeCache(userId, next);
            try { localStorage.removeItem(LEGACY_KEY); localStorage.removeItem(LEGACY_DISMISS); } catch {}
          }
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const sync = () => setCache(readCache(userId));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const persist = useCallback(
    async (next: Cache) => {
      setCache(next);
      writeCache(userId, next);
      if (!userId) return;
      await supabase.from('user_bin_day').upsert(
        { user_id: userId, data: (next.config ?? {}) as any, dismissed: next.dismissed },
        { onConflict: 'user_id' },
      );
    },
    [userId],
  );

  const save = useCallback(
    (c: BinDayConfig) => persist({ config: c, dismissed: false }),
    [persist],
  );
  const clear = useCallback(
    () => persist({ config: null, dismissed: latest.current.dismissed }),
    [persist],
  );
  const dismiss = useCallback(
    () => persist({ config: null, dismissed: true }),
    [persist],
  );
  const restore = useCallback(
    () => persist({ config: latest.current.config, dismissed: false }),
    [persist],
  );

  return {
    config: cache.config,
    dismissed: cache.dismissed,
    save,
    clear,
    dismiss,
    restore,
  };
};
