import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const MAX_FAVOURITES = 5;
const BASE = 'cloudrow:favourite_quotes';
const EVT = 'favourite_quotes_update';

const key = (uid: string | null) => `${BASE}:${uid ?? 'anon'}`;

const read = (uid: string | null): string[] => {
  try {
    const raw = localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const write = (uid: string | null, ids: string[]) => {
  try {
    localStorage.setItem(key(uid), JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new Event(EVT));
};

export const useFavouriteQuotes = () => {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [ids, setIds] = useState<string[]>(() => read(uid));

  useEffect(() => {
    setIds(read(uid));
    const sync = () => setIds(read(uid));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [uid]);

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string): { ok: boolean; reason?: 'full' } => {
      const current = read(uid);
      if (current.includes(id)) {
        const next = current.filter((x) => x !== id);
        write(uid, next);
        setIds(next);
        return { ok: true };
      }
      if (current.length >= MAX_FAVOURITES) return { ok: false, reason: 'full' };
      const next = [...current, id];
      write(uid, next);
      setIds(next);
      return { ok: true };
    },
    [uid],
  );

  return { favourites: ids, isFavourite, toggle, max: MAX_FAVOURITES };
};
