import React, { useState } from 'react';
import QuizzesScreen from './screens/QuizzesScreen';
import PledgesScreen from './screens/PledgesScreen';
import ShopLocalScreen from './screens/ShopLocalScreen';
import tileQuizzes from '@/assets/tile-quizzes.png.asset.json';
import tilePledges from '@/assets/tile-pledges.png.asset.json';
import tileSprints from '@/assets/tile-sprints.png.asset.json';
import tileShopLocal from '@/assets/tile-shoplocal.png.asset.json';
import tileCommunity from '@/assets/tile-community.png.asset.json';
import tileMega from '@/assets/tile-mega.png.asset.json';

const tiles = [
  { id: 'quizzes', label: 'Quizzes', img: tileQuizzes.url },
  { id: 'pledges', label: 'Pledges', img: tilePledges.url },
  { id: 'sprints', label: 'Sprints', img: tileSprints.url },
  { id: 'shop-local', label: 'Shop Local', img: tileShopLocal.url },
  { id: 'community-pledges', label: 'Community\nPledges', img: tileCommunity.url },
  { id: 'mega-pledges', label: 'Mega Pledges', img: tileMega.url },
];

const ChallengesScreen: React.FC<{ onSelect?: (id: string) => void }> = () => {
  const [view, setView] = useState<string | null>(null);

  if (view === 'quizzes') return <QuizzesScreen onBack={() => setView(null)} />;
  if (view === 'pledges') return <PledgesScreen onBack={() => setView(null)} />;
  if (view === 'shop-local') return <ShopLocalScreen onBack={() => setView(null)} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-8">
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="bg-[#1f1f1f] rounded-2xl aspect-square flex flex-col items-center justify-between p-4 shadow-lg active:scale-95 transition"
          >
            <div className="flex-1 flex items-center justify-center w-full">
              <img
                src={t.img}
                alt={t.label.replace('\n', ' ')}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-white font-serif font-bold text-lg text-center whitespace-pre-line leading-tight mt-2">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChallengesScreen;
