import { useCallback, useEffect, useState } from 'react';

export type WalletBusiness = {
  id: string;
  name: string;
  category: string;
  color: string;
  reason: string;
  addedAt: number;
};

const KEY = 'wallet_businesses_v1';
const EVT = 'wallet_update';

const read = (): WalletBusiness[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WalletBusiness[]) : [];
  } catch {
    return [];
  }
};

const write = (list: WalletBusiness[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
};

export const useWallet = () => {
  const [items, setItems] = useState<WalletBusiness[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addBusiness = useCallback((b: Omit<WalletBusiness, 'addedAt'>) => {
    const list = read();
    if (list.some((x) => x.id === b.id)) return false;
    write([{ ...b, addedAt: Date.now() }, ...list]);
    return true;
  }, []);

  const removeBusiness = useCallback((id: string) => {
    write(read().filter((x) => x.id !== id));
  }, []);

  return { businesses: items, addBusiness, removeBusiness };
};
