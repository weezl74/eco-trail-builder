import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Generic single-row-per-user cloud state hook.
 *
 * - Loads the row for the current user from `table` (primary key = user_id).
 * - Returns `value` (the chosen column, default 'data') along with helpers
 *   to update it. Updates are optimistic and upserted to the cloud.
 * - Falls back to a per-user localStorage cache so the UI doesn't flash empty
 *   on reload, and so an offline session still works.
 * - Treats "no row yet" as `defaultValue` (new users get zeros).
 *
 * NOTE: only intended for tables we created with this shape:
 *   user_id PK + a single JSONB / scalar column.
 */
export function useCloudRow<T>(
  table:
    | 'user_state'
    | 'user_bin_day'
    | 'user_walk_stamps'
    | 'user_calc_categories'
    | 'user_preferences',
  column: string,
  defaultValue: T,
) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const cacheKey = userId ? `cloudrow:${table}:${column}:${userId}` : null;

  const readCache = useCallback((): T => {
    if (!cacheKey) return defaultValue;
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
    // defaultValue intentionally excluded — caller passes a stable reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const [value, setValue] = useState<T>(() => readCache());
  const [loading, setLoading] = useState<boolean>(!!userId);
  const latest = useRef(value);
  latest.current = value;

  // Load from cloud whenever the user changes.
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setValue(defaultValue);
      setLoading(false);
      return;
    }
    setValue(readCache());
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data && (data as any)[column] != null) {
        const v = (data as any)[column] as T;
        setValue(v);
        if (cacheKey) {
          try { localStorage.setItem(cacheKey, JSON.stringify(v)); } catch {}
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, table, column]);

  const set = useCallback(
    async (next: T | ((prev: T) => T)) => {
      const resolved = (typeof next === 'function'
        ? (next as (prev: T) => T)(latest.current)
        : next) as T;
      setValue(resolved);
      if (cacheKey) {
        try { localStorage.setItem(cacheKey, JSON.stringify(resolved)); } catch {}
      }
      if (!userId) return resolved;
      await supabase
        .from(table)
        .upsert(
          { user_id: userId, [column]: resolved as any },
          { onConflict: 'user_id' },
        );
      return resolved;
    },
    [userId, table, column, cacheKey],
  );

  return { value, set, loading, userId };
}
