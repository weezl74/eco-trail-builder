import React, { useState } from 'react';
import CommunityStories from './CommunityStories';
import LeaderboardTreesScreen from './screens/LeaderboardTreesScreen';
import AddStoryDialog from './screens/AddStoryDialog';

interface CommunityScreenProps {
  userPoints?: number;
}

const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const [view, setView] = useState<'main' | 'leaderboard'>('main');
  const [addOpen, setAddOpen] = useState(false);

  if (view === 'leaderboard') return <LeaderboardTreesScreen onBack={() => setView('main')} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-serif font-bold text-black">Community Stories</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-[#1f1f1f] text-white font-serif font-bold rounded-2xl px-4 py-3 shadow-lg"
        >
          Add Story
        </button>
      </div>

      <div className="bg-transparent">
        <CommunityStories />
      </div>

      <button
        onClick={() => setView('leaderboard')}
        className="w-full mt-6 bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
      >
        Leaderboard & Trees
      </button>

      <AddStoryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default CommunityScreen;
