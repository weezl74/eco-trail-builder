import React, { useState } from 'react';
import { HelpCircle, Scroll, Activity, MapPin, Heart, Award } from 'lucide-react';
import QuizzesScreen from './screens/QuizzesScreen';
import PledgesScreen from './screens/PledgesScreen';
import ShopLocalScreen from './screens/ShopLocalScreen';

const tiles = [
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'pledges', label: 'Pledges', icon: Scroll },
  { id: 'sprints', label: 'Sprints', icon: Activity },
  { id: 'shop-local', label: 'Shop Local', icon: MapPin },
  { id: 'community-pledges', label: 'Community\nPledges', icon: Heart },
  { id: 'mega-pledges', label: 'Mega Pledges', icon: Award },
];

const ChallengesScreen: React.FC<{ onSelect?: (id: string) => void }> = () => {
  const [view, setView] = useState<string | null>(null);

  if (view === 'quizzes') return <QuizzesScreen onBack={() => setView(null)} />;
  if (view === 'pledges') return <PledgesScreen onBack={() => setView(null)} />;
  if (view === 'shop-local') return <ShopLocalScreen onBack={() => setView(null)} />;

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-8">
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className="bg-[#1f1f1f] rounded-2xl aspect-square flex flex-col items-center justify-center p-4 shadow-lg active:scale-95 transition"
            >
              <Icon className="h-16 w-16 text-white mb-3" strokeWidth={1.5} />
              <span className="text-white font-serif font-bold text-lg text-center whitespace-pre-line leading-tight">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChallengesScreen;
