import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SheepHead = 'nelson' | 'barb';

type Prefs = {
  sheepHead: SheepHead;
  learningPreferences: any | null;
};

const DEFAULT: Prefs = { sheepHead: 'nelson', learningPreferences: null };
const CACHE_BASE = 'cloudrow:user_preferences';
const LEGACY_HEAD = 'sheepHead';
const LEGACY_LEARN = 'learningPreferences';
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
    if (!userId) {
      setPrefs(DEFAULT);
      return;
    }
    setPrefs(readCache(userId));
    (async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('sheep_head, learning_preferences')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const next: Prefs = {
          sheepHead: (data.sheep_head as SheepHead) || 'nelson',
          learningPreferences: data.learning_preferences ?? null,
        };
        setPrefs(next);
        writeCache(userId, next);
      } else {
        // legacy migration from device-wide keys
        try {
          const head = localStorage.getItem(LEGACY_HEAD) as SheepHead | null;
          const learn = localStorage.getItem(LEGACY_LEARN);
          if (head || learn) {
            const next: Prefs = {
              sheepHead: head || 'nelson',
              learningPreferences: learn ? JSON.parse(learn) : null,
            };
            await supabase.from('user_preferences').upsert(
              {
                user_id: userId,
                sheep_head: next.sheepHead,
                learning_preferences: next.learningPreferences,
              },
              { onConflict: 'user_id' },
            );
            setPrefs(next);
            writeCache(userId, next);
            try {
              localStorage.removeItem(LEGACY_HEAD);
              localStorage.removeItem(LEGACY_LEARN);
            } catch {}
          }
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const setSheepHead = useCallback(
    async (h: SheepHead) => {
      const next = { ...latest.current, sheepHead: h };
      setPrefs(next);
      writeCache(userId, next);
      if (!userId) return;
      await supabase.from('user_preferences').upsert(
        { user_id: userId, sheep_head: h, learning_preferences: next.learningPreferences },
        { onConflict: 'user_id' },
      );
    },
    [userId],
  );

  const setLearningPreferences = useCallback(
    async (value: any) => {
      const next = { ...latest.current, learningPreferences: value };
      setPrefs(next);
      writeCache(userId, next);
      if (!userId) return;
      await supabase.from('user_preferences').upsert(
        { user_id: userId, sheep_head: next.sheepHead, learning_preferences: value },
        { onConflict: 'user_id' },
      );
    },
    [userId],
  );

  return {
    sheepHead: prefs.sheepHead,
    learningPreferences: prefs.learningPreferences,
    setSheepHead,
    setLearningPreferences,
  };
};
