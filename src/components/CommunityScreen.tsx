import React, { useState } from 'react';
import CommunityStories from './CommunityStories';
import LeaderboardTreesScreen from './screens/LeaderboardTreesScreen';
import { useTranslations } from '@/hooks/useTranslations';
import communityPledgeIcon from '@/assets/svg/community-pledge.svg.asset.json';

interface CommunityScreenProps {
  userPoints?: number;
  isBusiness?: boolean;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ isBusiness = false }) => {
  const [view, setView] = useState<'main' | 'leaderboard'>('main');
  const { t } = useTranslations();

  if (view === 'leaderboard') return <LeaderboardTreesScreen onBack={() => setView('main')} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif font-bold text-black leading-tight">{t('Community Stories')}</h1>
        </div>
        <img
          src={communityPledgeIcon.url}
          alt=""
          aria-hidden
          className="w-24 h-24 object-contain shrink-0 drop-shadow-md"
          draggable={false}
        />
      </div>

      <div className="bg-transparent">
        <CommunityStories />
      </div>

      <button
        onClick={() => setView('leaderboard')}
        className="w-full mt-6 bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
      >
        {t('Leaderboard & Trees')}
      </button>
    </div>
  );
};

export default CommunityScreen;
