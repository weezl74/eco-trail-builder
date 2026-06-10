import React, { useState } from 'react';
import { Mail, Gift, Calendar, Shirt } from 'lucide-react';
import SheepAvatarScreen from './screens/SheepAvatarScreen';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';
import badHomepageAsset from '@/assets/final-bad-homepage.svg.asset.json';


const HomeScreen: React.FC<{ onGoToPledges?: () => void }> = ({ onGoToPledges }) => {
  const [showAvatar, setShowAvatar] = useState(false);
  const { savings, pledged, woolPoints, treePoints } = useSavings();
  const { t } = useTranslations();

  if (showAvatar) {
    return <SheepAvatarScreen onBack={() => setShowAvatar(false)} />;
  }

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col">
      {/* Pill of icons */}
      <div className="pt-10 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-6 py-3 flex items-center gap-6 shadow-lg">
          <Mail className="h-7 w-7 text-white" strokeWidth={2.5} />
          <Gift className="h-7 w-7 text-white" strokeWidth={2.5} />
          <Calendar className="h-7 w-7 text-white" strokeWidth={2.5} />
          <button onClick={() => setShowAvatar(true)} aria-label="Customise sheep">
            <Shirt className="h-7 w-7 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Points balances */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#f5a623] rounded-2xl p-4 text-center text-black font-serif font-bold">
          <div className="text-3xl">{woolPoints}</div>
          <div className="text-xs uppercase tracking-wide">{t('Wool Points')}</div>
        </div>
        <div className="bg-green-700 rounded-2xl p-4 text-center text-white font-serif font-bold">
          <div className="text-3xl">{treePoints}</div>
          <div className="text-xs uppercase tracking-wide">{t('Tree Points')}</div>
        </div>
      </div>

      {/* Estimated savings card */}
      <div className="mx-4 mt-4 bg-[#1f1f1f] rounded-2xl p-5 text-white">
        <h2 className="font-serif font-bold text-xl text-center mb-3">{t('Estimated Savings')}</h2>
        <div className="space-y-2 font-serif font-bold">
          <p className="flex items-center gap-2"><span className="text-yellow-400 text-xl">£</span> {t('Money')}: £{savings.money}</p>
          <p className="flex items-center gap-2"><span className="text-red-400 text-sm font-mono">CO₂e</span> CO₂e: {savings.co2} kg</p>
          <p className="flex items-center gap-2"><span className="text-blue-400 text-xl">💧</span> {t('Water')}: {savings.water}L</p>
          <p className="flex items-center gap-2 text-[#f5a623]"><span className="text-xl">✓</span> {t('Pledges made')}: {pledged.length}</p>
        </div>
      </div>

      {/* Illustration */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-[#1f1f1f]">
        <img
          src={badHomepageAsset.url}
          alt="A scene showing the impact of pollution and unsustainable choices"
          className="w-full h-auto block"
          loading="lazy"
        />
      </div>

      {/* CTA */}
      <div className="mx-4 mt-6 flex justify-center">
        <button
          onClick={onGoToPledges}
          className="bg-[#f5a623] hover:bg-[#e69517] active:scale-95 transition text-black font-serif font-bold text-lg rounded-2xl px-8 py-4 shadow-lg w-full max-w-sm"
        >
          {t('Save Me More')}
        </button>
      </div>

    </div>
  );
};

export default HomeScreen;
