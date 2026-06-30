import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
      try {
        const data = await api.get('/business-cards/public');
        if (!active) return;
        const list = (Array.isArray(data) ? data : []).slice(0, 20) as BusinessCardRow[];
        setCards(list);
      } catch (e) {
        console.error('[useBusinessSpotlight] failed', e);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);
  return { cards, loading };
};
