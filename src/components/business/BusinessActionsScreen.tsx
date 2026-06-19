import React, { useState } from 'react';
import { Bike, Users } from 'lucide-react';
import PledgesScreen from '@/components/screens/PledgesScreen';
import BusinessSprintsScreen from './BusinessSprintsScreen';
import { BusinessCommunityPledges } from '@/components/BusinessCommunityPledges';
import { useTranslations } from '@/hooks/useTranslations';
import pledgeIcon from '@/assets/svg/pledge.svg.asset.json';
import quickWinsIcon from '@/assets/svg/quick-wins.svg.asset.json';
import communityIcon from '@/assets/svg/community-pledge.svg.asset.json';

interface Props { initialView?: string | null }

const ComingSoon: React.FC<{ title: string; subtitle: string; onBack: () => void }> = ({ title, subtitle, onBack }) => {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-6">
      <button onClick={onBack} className="text-white font-serif font-bold mb-4">← {t('Back')}</button>
      <div className="rounded-2xl bg-[#F4971D] p-6 text-center">
        <h1 className="font-serif font-bold text-2xl text-black">{title}</h1>
        <p className="font-serif text-black/80 mt-2">{subtitle}</p>
        <p className="font-serif text-black/60 text-sm mt-6">{t('Coming soon')}</p>
      </div>
    </div>
  );
};

const BusinessActionsScreen: React.FC<Props> = ({ initialView = null }) => {
  const [view, setView] = useState<string | null>(initialView);
  const { t } = useTranslations();

  const tiles: { id: string; label: string; icon?: string; LucideIcon?: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pledges', label: t('SME Pledges'), icon: pledgeIcon.url },
    { id: 'sprints', label: t('SME Sprints'), icon: quickWinsIcon.url },
    { id: 'community', label: t('Business\nCommunity'), icon: communityIcon.url },
    { id: 'carless', label: '#CarlessCommuting', LucideIcon: Bike },
    { id: 'employee', label: t('Employee\nChallenge'), LucideIcon: Users },
  ];

  if (view === 'pledges') return <PledgesScreen onBack={() => setView(null)} userGroup="business" />;
  if (view === 'sprints') return <BusinessSprintsScreen onBack={() => setView(null)} />;
  if (view === 'community') return (
    <div className="min-h-screen bg-background pb-24">
      <button onClick={() => setView(null)} className="m-4 text-foreground font-serif font-bold">← {t('Back')}</button>
      <BusinessCommunityPledges />
    </div>
  );
  if (view === 'carless') return <ComingSoon title="#CarlessCommuting" subtitle={t('Log car-free commute days with your team.')} onBack={() => setView(null)} />;
  if (view === 'employee') return <ComingSoon title={t('Employee Challenge')} subtitle={t('Run sustainability challenges across your workforce.')} onBack={() => setView(null)} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-8">
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => setView(tile.id)}
            className="bg-[#1f1f1f] rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 p-3 shadow-lg active:scale-95 transition"
          >
            {tile.icon
              ? <img src={tile.icon} alt="" className="h-16 w-16 object-contain" draggable={false} />
              : tile.LucideIcon && <tile.LucideIcon className="h-16 w-16 text-[#F4971D]" />}
            <span className="text-white font-serif font-bold text-lg text-center whitespace-pre-line leading-tight px-1">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessActionsScreen;
