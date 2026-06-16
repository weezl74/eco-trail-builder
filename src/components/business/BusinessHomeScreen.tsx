import React from 'react';
import { Building2, Leaf, TrendingDown } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BusinessHomeScreen: React.FC<{ onGoToActions: () => void }> = ({ onGoToActions }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('business_cards')
        .select('business_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.business_name) setBusinessName(data.business_name);
    })();
  }, [user]);

  return (
    <div className="h-[calc(100dvh-4.5rem)] max-h-[calc(100dvh-4.5rem)] overflow-hidden bg-black pb-3 px-4 pt-6 flex flex-col">
      <div className="bg-[#f5a623] rounded-2xl p-4 shadow-lg flex items-center gap-3 mb-4">
        <Building2 className="h-7 w-7 text-black" />
        <div>
          <p className="text-xs text-black/70 font-serif">{t('Welcome back')}</p>
          <h1 className="font-serif font-bold text-xl text-black leading-tight">
            {businessName || t('Your Business')}
          </h1>
        </div>
      </div>

      <div className="bg-[#1f1f1f] rounded-2xl p-4 text-white mb-4">
        <h2 className="font-serif font-bold text-lg mb-2 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-[#f5a623]" /> {t('Your SME journey')}
        </h2>
        <p className="font-serif text-sm leading-snug opacity-90">
          {t('Measure, pledge, sprint and tell your story. Every action helps Caerphilly hit net zero and trims your bills.')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1f1f1f] rounded-2xl p-4 text-white">
          <TrendingDown className="h-5 w-5 text-green-400 mb-1" />
          <p className="text-[10px] uppercase tracking-wide opacity-70">{t('Footprint')}</p>
          <p className="font-serif font-bold text-2xl">—</p>
          <p className="text-[10px] opacity-70">{t('Run the calculator')}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-2xl p-4 text-white">
          <Leaf className="h-5 w-5 text-[#f5a623] mb-1" />
          <p className="text-[10px] uppercase tracking-wide opacity-70">{t('Active pledges')}</p>
          <p className="font-serif font-bold text-2xl">0</p>
          <p className="text-[10px] opacity-70">{t('Pick one today')}</p>
        </div>
      </div>

      <button
        onClick={onGoToActions}
        className="w-full bg-[#f5a623] text-black font-serif font-bold text-lg rounded-2xl py-3 shadow-lg active:scale-95 transition"
      >
        {t('Take an action')}
      </button>
    </div>
  );
};

export default BusinessHomeScreen;
