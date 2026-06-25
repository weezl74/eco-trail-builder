
import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { api, fetchMyProfile } from '@/lib/api';

export type RenewableType = 'solar' | 'wind' | 'mine_water';

export type Renewable = {
  id: string;
  type: RenewableType;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
};

type State = {
  accessories: string[];
  renewables: Renewable[];
  cardColor: string;
  woolColor: string;
};

const DEFAULT: State = {
  accessories: [],
  renewables: [],
  cardColor: 'midnight',
  woolColor: '#e8d9b8',
};

export const RENEWABLE_COSTS: Record<RenewableType, number> = {
  solar: 50,
  wind: 80,
  mine_water: 120,
};

export const useSavings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<State>(DEFAULT);
  const [points, setPoints] = useState<{ wool: number; tree: number }>({
    wool: 0,
    tree: 0,
  });

  const latest = useRef(state);
  latest.current = state;

  // ✅ ALWAYS FETCH REAL POINTS FROM API
  const refreshPoints = useCallback(async () => {
    if (!userId) return;

    try {
      const p = await fetchMyProfile(userId);

      setPoints({
        wool: p?.wool_points ?? 0,
        tree: p?.tree_points ?? 0,
      });
    } catch (e) {
      console.error('[useSavings] refreshPoints failed', e);
    }
  }, [userId]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints]);

  // ✅ LOAD ACCESSORIES + RENEWABLES FROM SUPABASE ONLY
  useEffect(() => {
    if (!userId) {
      setState(DEFAULT);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('user_state')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.data) {
        setState({ ...DEFAULT, ...(data.data as Partial<State>) });
      }
    })();
  }, [userId]);

  const persist = useCallback(
    async (next: State) => {
      setState(next);

      if (!userId) return;

      await supabase
        .from('user_state')
        .upsert({ user_id: userId, data: next as any }, { onConflict: 'user_id' });
    },
    [userId],
  );

  // ✅ ACCESSORY PURCHASE
  const buyAccessory = useCallback(
    async (id: string, cost: number) => {
      if (!userId) return false;

      const s = latest.current;

      if (s.accessories.includes(id)) return true;
      if (points.wool < cost) return false;

      try {
        await api.post('/update-points', {
          user_id: userId,
          woolDelta: cost,
          source: 'accessory_purchase',
          reference_id: id,
        });

        await persist({
          ...s,
          accessories: [...s.accessories, id],
        });

        await refreshPoints();

        return true;
      } catch (e) {
        console.error('buyAccessory failed', e);
        return false;
      }
    },
    [userId, persist, refreshPoints, points],
  );

  // ✅ ACCESSORY REFUND
  const refundAccessory = useCallback(
    async (id: string, cost: number) => {
      if (!userId) return false;

      const s = latest.current;

      if (!s.accessories.includes(id)) return false;

      try {
        await api.post('/update-points', {
          user_id: userId,
          woolDelta: cost,
          source: 'accessory_refund',
          reference_id: id,
        });

        await persist({
          ...s,
          accessories: s.accessories.filter((a) => a !== id),
        });

        await refreshPoints();

        return true;
      } catch (e) {
        console.error('refundAccessory failed', e);
        return false;
      }
    },
    [userId, persist, refreshPoints],
  );

  // ✅ RENEWABLE PURCHASE
  const buyRenewable = useCallback(
    async (type: RenewableType, x: number, y: number, lat?: number, lng?: number) => {
      if (!userId) return false;

      const s = latest.current;
      const cost = RENEWABLE_COSTS[type];

      if (points.wool < cost) return false;

      try {
        await api.post('/update-points', {
          user_id: userId,
          woolDelta: cost,
          source: 'renewable_purchase',
          reference_id: type,
        });
