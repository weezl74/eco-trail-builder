import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export type WalletBusiness = {
  kind: 'business';
  id: string;
  name: string;
  category: string;
  color: string;
  reason: string;
  addedAt: number;
  businessCardId?: string;
  sectorIcon?: string;
  stampsRequired?: number;
  rewardText?: string;
};

export type WalletPhoto = {
  kind: 'photo';
  id: string;
  image: string;
  caption?: string;
  addedAt: number;
};

export type WalletItem = WalletBusiness | WalletPhoto;

const CACHE_BASE = 'cloudrow:user_wallet:items';
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
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(items)); } catch {}
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
      try {
        const data = await api.get(`/wallet?user_id=${encodeURIComponent(userId)}`);
        if (cancelled) return;
        const cloud = rowsToItems(Array.isArray(data) ? data : []);
        setItems(cloud);
        writeCache(userId, cloud);
      } catch (e) {
        console.error('[useWallet] fetch failed', e);
      }
    })();
    return () => { cancelled = true; };
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
        void api.post('/wallet', { user_id: userId, business_id: item.id, data: item }).catch(() => {});
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
        void api.post('/wallet', { user_id: userId, business_id: photo.id, data: photo }).catch(() => {});
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
        void api.delete('/wallet', { user_id: userId, business_id: id }).catch(() => {});
      }
    },
    [userId],
  );

  return { items, addBusiness, addPhoto, removeItem };
};

export const useWalletBusinesses = () => {
  const { items, addBusiness, removeItem } = useWallet();
  const businesses = items.filter((x): x is WalletBusiness => x.kind === 'business');
  return { businesses, addBusiness, removeBusiness: removeItem };
};
