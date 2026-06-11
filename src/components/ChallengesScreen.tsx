import React, { useState } from 'react';
import QuizzesScreen from './screens/QuizzesScreen';
import PledgesScreen from './screens/PledgesScreen';
import ShopLocalScreen from './screens/ShopLocalScreen';
import SprintsScreen from './screens/SprintsScreen';
import MegaPledgesScreen from './screens/MegaPledgesScreen';
import CommunityPledgesScreen from './screens/CommunityPledgesScreen';
import WalkMyWarmUpScreen from './screens/WalkMyWarmUpScreen';
import { useTranslations } from '@/hooks/useTranslations';
import quizIcon from '@/assets/svg/quiz-icon.svg.asset.json';
import pledgeIcon from '@/assets/svg/pledge.svg.asset.json';
import quickWinsIcon from '@/assets/svg/quick-wins.svg.asset.json';
import communityIcon from '@/assets/svg/community-pledge.svg.asset.json';
import megaIcon from '@/assets/svg/mega-pledge.svg.asset.json';
import walkWarmupIcon from '@/assets/svg/walk-warmup.png';

const ChallengesScreen: React.FC<{ onSelect?: (id: string) => void; initialView?: string | null }> = ({ initialView = null }) => {
  const [view, setView] = useState<string | null>(initialView);
  const { t } = useTranslations();
  const tiles = [
    { id: 'quizzes', label: t('Quizzes'), icon: quizIcon.url },
    { id: 'pledges', label: t('Pledges'), icon: pledgeIcon.url },
    { id: 'sprints', label: t('Sprints'), icon: quickWinsIcon.url },
    { id: 'shop-local', label: t('Shop Local'), icon: null },
    { id: 'community-pledges', label: t('Community\nPledges'), icon: communityIcon.url },
    { id: 'mega-pledges', label: t('Mega Pledges'), icon: megaIcon.url },
  ];

  if (view === 'quizzes') return <QuizzesScreen onBack={() => setView(null)} />;
  if (view === 'pledges') return <PledgesScreen onBack={() => setView(null)} />;
  if (view === 'shop-local') return <ShopLocalScreen onBack={() => setView(null)} />;
  if (view === 'sprints') return <SprintsScreen onBack={() => setView(null)} />;
  if (view === 'mega-pledges') return <MegaPledgesScreen onBack={() => setView(null)} />;
  if (view === 'community-pledges') return <CommunityPledgesScreen onBack={() => setView(null)} />;
  if (view === 'walk-warmup') return <WalkMyWarmUpScreen onBack={() => setView(null)} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-8">
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="bg-[#1f1f1f] rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 p-4 shadow-lg active:scale-95 transition"
          >
            {t.icon && (
              <img src={t.icon} alt="" className="h-16 w-16 object-contain" draggable={false} />
            )}
            <span className="text-white font-serif font-bold text-xl text-center whitespace-pre-line leading-tight">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChallengesScreen;
