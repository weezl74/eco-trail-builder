import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessCardRow {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  sector: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
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
      const { data } = await supabase
        .from('business_cards')
        .select('*')
        .eq('status', 'approved')
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
