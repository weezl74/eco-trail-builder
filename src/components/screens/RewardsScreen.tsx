import React from 'react';
import { ArrowLeft, Award, TreePine, Waves } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSavings } from '@/hooks/useSavings';

interface Props { onBack: () => void }

const RewardsScreen: React.FC<Props> = ({ onBack }) => {
  const { t } = useTranslations();
  const { treesPlanted } = useSavings();

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-6 text-white">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-[#f5a623] font-serif font-bold">
        <ArrowLeft className="h-5 w-5" /> {t('Back')}
      </button>
      <h1 className="font-serif font-bold text-2xl mb-4">{t('Your Rewards')}</h1>

      {/* Free swim certificate */}
      <div className="rounded-2xl p-5 mb-4 bg-gradient-to-br from-[#0ea5e9] to-[#0369a1] text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Waves className="h-6 w-6" />
          <p className="text-xs uppercase tracking-widest opacity-80">{t('Certificate')}</p>
        </div>
        <h2 className="font-serif font-bold text-2xl leading-tight">{t('Free Swim')}</h2>
        <p className="text-sm opacity-90 mt-1">{t('Earned via #WalkMyWarmUp')}</p>
        <div className="mt-4 bg-white/15 rounded-xl p-3 backdrop-blur">
          <p className="text-xs opacity-80">{t('Code')}</p>
          <p className="font-mono font-bold text-lg tracking-widest">SWIM-2026-AC8842</p>
        </div>
        <p className="text-[11px] opacity-75 mt-2">{t('Show at any Caerphilly CBC leisure centre reception.')}</p>
      </div>

      {/* Tree earned */}
      <div className="rounded-2xl p-5 mb-4 bg-gradient-to-br from-[#166534] to-[#052e16] text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TreePine className="h-6 w-6" />
          <p className="text-xs uppercase tracking-widest opacity-80">{t('Tree Planted')}</p>
        </div>
        <h2 className="font-serif font-bold text-2xl">{t('You earned a tree!')}</h2>
        <p className="text-sm opacity-90 mt-1">{t('Planted in Penallta Parc')}</p>
        <div className="mt-4 bg-white/15 rounded-xl p-3 backdrop-blur">
          <p className="text-xs opacity-80">what3words</p>
          <p className="font-mono font-bold text-lg">///filled.count.soap</p>
        </div>
        <p className="text-[11px] opacity-75 mt-2">{t('Visit your tree using the what3words address above.')}</p>
        <p className="text-xs mt-3 opacity-90">{t('Total trees')}: <span className="font-bold">{treesPlanted}</span></p>
      </div>

      {/* Badges placeholder */}
      <div className="bg-[#1f1f1f] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-[#f4971d]" />
          <p className="font-serif font-bold">{t('Badges')}</p>
        </div>
        <p className="text-sm text-white/60">{t('Keep pledging and joining events to unlock more rewards.')}</p>
      </div>
    </div>
  );
};

export default RewardsScreen;
