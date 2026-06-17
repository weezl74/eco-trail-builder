import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type StampRow = {
  business_card_id: string;
  stamps: number;
  redeemed_at: string | null;
};

const EVT = 'business_stamps_update';

export const useBusinessStamps = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [rows, setRows] = useState<StampRow[]>([]);

  const load = useCallback(async () => {
    if (!userId) { setRows([]); return; }
    const { data } = await supabase
      .from('user_business_stamps')
      .select('business_card_id, stamps, redeemed_at')
      .eq('user_id', userId);
    setRows((data || []) as StampRow[]);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const sync = () => { void load(); };
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, [load]);

  const getStamps = useCallback(
    (cardId: string) => rows.find((r) => r.business_card_id === cardId)?.stamps ?? 0,
    [rows],
  );

  const addStamp = useCallback(
    async (cardId: string, max: number) => {
      if (!userId) return 0;
      const current = rows.find((r) => r.business_card_id === cardId)?.stamps ?? 0;
      const next = Math.min(max, current + 1);
      await supabase
        .from('user_business_stamps')
        .upsert(
          { user_id: userId, business_card_id: cardId, stamps: next },
          { onConflict: 'user_id,business_card_id' },
        );
      window.dispatchEvent(new Event(EVT));
      return next;
    },
    [userId, rows],
  );

  return { getStamps, addStamp, reload: load };
};
