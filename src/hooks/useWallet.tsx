import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type WalletBusiness = {
  kind: 'business';
  id: string;
  name: string;
  category: string;
  color: string;
  reason: string;
  addedAt: number;
};

export type WalletPhoto = {
  kind: 'photo';
  id: string;
  image: string; // base64 data URL, already cropped to 1.586:1
  caption?: string;
  addedAt: number;
};

export type WalletItem = WalletBusiness | WalletPhoto;

const CACHE_BASE = 'cloudrow:user_wallet:items';
const LEGACY_KEY = 'wallet_items_v2';
const LEGACY_KEY_V1 = 'wallet_businesses_v1';
const EVT = 'wallet_update';

const cacheKey = (uid: string) => `${CACHE_BASE}:${uid}`;

const readCache = (uid: string | null): WalletItem[] => {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    return raw ? (JSON.parse(raw) as WalletItem[]) : [];
  } catch {
    return [];
  }
};

const writeCache = (uid: string | null, items: WalletItem[]) => {
  if (!uid) return;
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVT));
};

const rowsToItems = (rows: Array<{ business_id: string; data: any }>): WalletItem[] =>
  rows
    .map((r) => r.data as WalletItem)
    .filter(Boolean)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

export const useWallet = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<WalletItem[]>(() => readCache(userId));
  const latest = useRef(items);
  latest.current = items;

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setItems([]);
      return;
    }
    setItems(readCache(userId));
    (async () => {
      const { data } = await supabase
        .from('user_wallet')
        .select('business_id, data')
        .eq('user_id', userId);
      if (cancelled) return;
      const cloud = rowsToItems((data || []) as any);
      if (cloud.length > 0) {
        setItems(cloud);
        writeCache(userId, cloud);
        return;
      }
      // One-off migration of legacy device-local wallet → cloud.
      let legacy: WalletItem[] = [];
      try {
        const raw = localStorage.getItem(LEGACY_KEY);
        if (raw) legacy = JSON.parse(raw) as WalletItem[];
        else {
          const v1 = localStorage.getItem(LEGACY_KEY_V1);
          if (v1) {
            const list = JSON.parse(v1) as Omit<WalletBusiness, 'kind'>[];
            legacy = list.map((b) => ({ ...b, kind: 'business' }) as WalletBusiness);
          }
        }
      } catch {}
      if (legacy.length > 0) {
        const rows = legacy.map((it) => ({
          user_id: userId,
          business_id: it.id,
          data: it as any,
        }));
        await supabase.from('user_wallet').upsert(rows, { onConflict: 'user_id,business_id' });
        setItems(legacy);
        writeCache(userId, legacy);
        try { localStorage.removeItem(LEGACY_KEY); localStorage.removeItem(LEGACY_KEY_V1); } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const sync = () => setItems(readCache(userId));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const addBusiness = useCallback(
    (b: Omit<WalletBusiness, 'addedAt' | 'kind'>) => {
      const list = latest.current;
      if (list.some((x) => x.kind === 'business' && x.id === b.id)) return false;
      const item: WalletBusiness = { ...b, kind: 'business', addedAt: Date.now() };
      const next = [item, ...list];
      setItems(next);
      writeCache(userId, next);
      if (userId) {
        void supabase
          .from('user_wallet')
          .upsert(
            { user_id: userId, business_id: item.id, data: item as any },
            { onConflict: 'user_id,business_id' },
          );
      }
      return true;
    },
    [userId],
  );

  const addPhoto = useCallback(
    (image: string, caption?: string) => {
      const photo: WalletPhoto = {
        kind: 'photo',
        id: `photo-${Date.now()}`,
        image,
        caption,
        addedAt: Date.now(),
      };
      const next = [photo, ...latest.current];
      setItems(next);
      writeCache(userId, next);
      if (userId) {
        void supabase
          .from('user_wallet')
          .upsert(
            { user_id: userId, business_id: photo.id, data: photo as any },
            { onConflict: 'user_id,business_id' },
          );
      }
    },
    [userId],
  );

  const removeItem = useCallback(
    (id: string) => {
      const next = latest.current.filter((x) => x.id !== id);
      setItems(next);
      writeCache(userId, next);
      if (userId) {
        void supabase
          .from('user_wallet')
          .delete()
          .eq('user_id', userId)
          .eq('business_id', id);
      }
    },
    [userId],
  );

  return { items, addBusiness, addPhoto, removeItem };
};

// Backward-compat helper for existing callers that destructure businesses/removeBusiness
export const useWalletBusinesses = () => {
  const { items, addBusiness, removeItem } = useWallet();
  const businesses = items.filter((x): x is WalletBusiness => x.kind === 'business');
  return { businesses, addBusiness, removeBusiness: removeItem };
};
