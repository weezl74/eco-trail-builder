import React from 'react';
import CommunityStories from './CommunityStories';

interface CommunityScreenProps {
  onLeaderboard?: () => void;
  onTrees?: () => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ onLeaderboard, onTrees }) => {
  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-serif font-bold text-black">Community Stories</h1>
        <button className="bg-[#1f1f1f] text-white font-serif font-bold rounded-2xl px-4 py-3 shadow-lg">
          Add Story
        </button>
      </div>

      <div className="bg-transparent">
        <CommunityStories />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={onLeaderboard}
          className="bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
        >
          Leaderboard
        </button>
        <button
          onClick={onTrees}
          className="bg-[#1f1f1f] text-white font-serif font-bold text-xl rounded-2xl py-5 shadow-lg active:scale-95 transition"
        >
          Trees
        </button>
      </div>
    </div>
  );
};

export default CommunityScreen;
