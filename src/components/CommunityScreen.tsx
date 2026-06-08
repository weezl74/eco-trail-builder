import React, { useState } from 'react';
import CommunityStories from './CommunityStories';
import LeaderboardScreen from './screens/LeaderboardScreen';
import TreesScreen from './screens/TreesScreen';
import AddStoryDialog from './screens/AddStoryDialog';

interface CommunityScreenProps {
  onLeaderboard?: () => void;
  onTrees?: () => void;
  userPoints?: number;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ userPoints = 0 }) => {
  const [view, setView] = useState<'main' | 'leaderboard' | 'trees'>('main');
  const [addOpen, setAddOpen] = useState(false);

  if (view === 'leaderboard') return <LeaderboardScreen onBack={() => setView('main')} />;
  if (view === 'trees') return <TreesScreen onBack={() => setView('main')} userPoints={userPoints} />;

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

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => setView('leaderboard')}
          className="bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
        >
          Leaderboard
        </button>
        <button
          onClick={() => setView('trees')}
          className="bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
        >
          Trees
        </button>
      </div>

      <AddStoryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default CommunityScreen;
