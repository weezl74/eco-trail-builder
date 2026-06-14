import { useCallback, useEffect, useState } from 'react';

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

const KEY = 'wallet_items_v2';
const LEGACY_KEY = 'wallet_businesses_v1';
const EVT = 'wallet_update';

const read = (): WalletItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as WalletItem[];
    // migrate legacy businesses
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const list = JSON.parse(legacy) as Omit<WalletBusiness, 'kind'>[];
      const migrated: WalletItem[] = list.map((b) => ({ ...b, kind: 'business' }));
      localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
};

const write = (list: WalletItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
};

export const useWallet = () => {
  const [items, setItems] = useState<WalletItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addBusiness = useCallback((b: Omit<WalletBusiness, 'addedAt' | 'kind'>) => {
    const list = read();
    if (list.some((x) => x.kind === 'business' && x.id === b.id)) return false;
    write([{ ...b, kind: 'business', addedAt: Date.now() } as WalletBusiness, ...list]);
    return true;
  }, []);

  const addPhoto = useCallback((image: string, caption?: string) => {
    const photo: WalletPhoto = {
      kind: 'photo',
      id: `photo-${Date.now()}`,
      image,
      caption,
      addedAt: Date.now(),
    };
    write([photo, ...read()]);
  }, []);

  const removeItem = useCallback((id: string) => {
    write(read().filter((x) => x.id !== id));
  }, []);

  return { items, addBusiness, addPhoto, removeItem };
};

// Backward-compat helper for existing callers that destructure businesses/removeBusiness
export const useWalletBusinesses = () => {
  const { items, addBusiness, removeItem } = useWallet();
  const businesses = items.filter((x): x is WalletBusiness => x.kind === 'business');
  return { businesses, addBusiness, removeBusiness: removeItem };
};
