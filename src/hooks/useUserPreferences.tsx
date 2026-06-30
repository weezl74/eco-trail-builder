import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export type SheepHead = 'nelson' | 'barb';

type Prefs = {
  sheepHead: SheepHead;
  learningPreferences: any | null;
};

const DEFAULT: Prefs = { sheepHead: 'nelson', learningPreferences: null };
const CACHE_BASE = 'cloudrow:user_preferences';
const EVT = 'user_prefs_update';

const cacheKey = (uid: string) => `${CACHE_BASE}:${uid}`;

const readCache = (uid: string | null): Prefs => {
  if (!uid) return DEFAULT;
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
};

const writeCache = (uid: string | null, p: Prefs) => {
  if (!uid) return;
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(p)); } catch {}
  window.dispatchEvent(new Event(EVT));
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [prefs, setPrefs] = useState<Prefs>(() => readCache(userId));
  const latest = useRef(prefs);
  latest.current = prefs;

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setPrefs(DEFAULT); return; }
    setPrefs(readCache(userId));
    (async () => {
      try {
        const data = await api.get(`/preferences?user_id=${encodeURIComponent(userId)}`);
        if (cancelled) return;
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          const next: Prefs = {
            sheepHead: (row.sheep_head as SheepHead) || 'nelson',
            learningPreferences: row.learning_preferences ?? null,
          };
          setPrefs(next);
          writeCache(userId, next);
        }
      } catch (e) {
        console.error('[useUserPreferences] fetch failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    const sync = () => setPrefs(readCache(userId));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const persist = useCallback(
    (next: Prefs) => {
      setPrefs(next);
      writeCache(userId, next);
      if (!userId) return;
      void api.post('/preferences', {
        user_id: userId,
        sheep_head: next.sheepHead,
        learning_preferences: next.learningPreferences,
      }).catch(() => {});
    },
    [userId],
  );

  const setSheepHead = useCallback(
    async (h: SheepHead) => persist({ ...latest.current, sheepHead: h }),
    [persist],
  );

  const setLearningPreferences = useCallback(
    async (value: any) => persist({ ...latest.current, learningPreferences: value }),
    [persist],
  );

  return {
    sheepHead: prefs.sheepHead,
    learningPreferences: prefs.learningPreferences,
    setSheepHead,
    setLearningPreferences,
  };
};
