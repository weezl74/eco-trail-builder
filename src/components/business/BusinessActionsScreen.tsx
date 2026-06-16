import React, { useState } from 'react';
import PledgesScreen from '@/components/screens/PledgesScreen';
import BusinessSprintsScreen from './BusinessSprintsScreen';
import { BusinessCommunityPledges } from '@/components/BusinessCommunityPledges';
import { useTranslations } from '@/hooks/useTranslations';
import pledgeIcon from '@/assets/svg/pledge.svg.asset.json';
import quickWinsIcon from '@/assets/svg/quick-wins.svg.asset.json';
import communityIcon from '@/assets/svg/community-pledge.svg.asset.json';

interface Props { initialView?: string | null }

const BusinessActionsScreen: React.FC<Props> = ({ initialView = null }) => {
  const [view, setView] = useState<string | null>(initialView);
  const { t } = useTranslations();

  const tiles = [
    { id: 'pledges', label: t('SME Pledges'), icon: pledgeIcon.url },
    { id: 'sprints', label: t('SME Sprints'), icon: quickWinsIcon.url },
    { id: 'community', label: t('Business\nCommunity'), icon: communityIcon.url },
  ];

  if (view === 'pledges') return <PledgesScreen onBack={() => setView(null)} userGroup="business" />;
  if (view === 'sprints') return <BusinessSprintsScreen onBack={() => setView(null)} />;
  if (view === 'community') return (
    <div className="min-h-screen bg-background pb-24">
      <button onClick={() => setView(null)} className="m-4 text-foreground font-serif font-bold">← {t('Back')}</button>
      <BusinessCommunityPledges />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-8">
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => setView(tile.id)}
            className="bg-[#1f1f1f] rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 p-3 shadow-lg active:scale-95 transition"
          >
            <img src={tile.icon} alt="" className="h-16 w-16 object-contain" draggable={false} />
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
