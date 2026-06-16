import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessCardRow {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  sector: string | null;
  website: string | null;
  logo_url: string | null;
  pen_portrait: string | null;
  climate_goals: string | null;
  offer_to_residents: string | null;
  offer_to_businesses: string | null;
}

export const useBusinessSpotlight = () => {
  const [cards, setCards] = useState<BusinessCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from('business_cards_public')
        .select('id,user_id,business_name,tagline,sector,website,logo_url,pen_portrait,climate_goals,offer_to_residents,offer_to_businesses')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!active) return;
      setCards((data ?? []) as BusinessCardRow[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);
  return { cards, loading };
};
