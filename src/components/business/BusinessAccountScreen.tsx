import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfile } from '@/components/BusinessProfile';
import { useTranslations } from '@/hooks/useTranslations';
import { Pencil, LogOut } from 'lucide-react';

interface Props {
  onEditCard: () => void;
  onSignOut?: () => void;
}

const BusinessAccountScreen: React.FC<Props> = ({ onEditCard, onSignOut }) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setCard(data);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut?.();
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-black pb-24 px-4 pt-6 text-white">
        <p className="font-serif">{t('Loading…')}</p>
        <button
          onClick={onEditCard}
          className="mt-4 bg-[#f5a623] text-black font-serif font-bold px-4 py-2 rounded-xl"
        >
          {t('Set up business card')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <BusinessProfile
        business={{
          business_name: card.business_name,
          waste_footprint: 0,
          travel_footprint: 0,
          energy_footprint: 0,
          climate_goals: card.climate_goals,
          pen_portrait: card.pen_portrait,
        }}
      />
      <div className="px-4 flex flex-col gap-2 pb-4">
        <button
          onClick={onEditCard}
          className="w-full bg-primary text-primary-foreground font-serif font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <Pencil className="h-4 w-4" /> {t('Edit business card')}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full bg-[#1f1f1f] text-white font-serif font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" /> {t('Sign out')}
        </button>
      </div>
    </div>
  );
};

export default BusinessAccountScreen;
