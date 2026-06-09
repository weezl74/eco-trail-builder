import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';

type Tab = 'all' | 'activated' | 'progress' | 'groups';

const pledges = [
  {
    id: 'fryer',
    title: 'Super Fryer!',
    description: 'Use an air fryer instead of an oven for daily single meals',
    points: 100,
    savings: 50,
    carbon: 394,
    tag: 'electricity / gas',
  },
  {
    id: 'one-degree',
    title: 'The Power of One Degree',
    description: 'Turn down the thermostat by 1°C',
    points: 100,
    savings: 90,
    carbon: 310,
    tag: 'electricity / gas',
  },
  {
    id: 'slow-cooker',
    title: 'Cooking Powerhouse',
    description: 'Use a slow cooker instead of an oven for daily single meals',
    points: 100,
    savings: 40,
    carbon: 280,
    tag: 'electricity / gas',
  },
];

const PledgesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('all');
  const { pledged, addPledge } = useSavings();
  const activated = pledged.reduce<Record<string, boolean>>((acc, id) => { acc[id] = true; return acc; }, {});

  const activate = (p: typeof pledges[number]) => {
    if (activated[p.id]) return;
    addPledge(p.id, { money: p.savings, co2: p.carbon, water: 0 });
  };

  const visible = pledges.filter((p) => {
    if (tab === 'activated' || tab === 'progress') return activated[p.id];
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="mb-2 text-black flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}

      {/* Tab pill */}
      <div className="flex justify-center mb-2">
        <div className="bg-[#1f1f1f] rounded-2xl px-3 py-2 flex gap-2">
          {(['all','activated','progress'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-xl font-serif font-bold text-white text-sm ${tab===t ? 'border border-white' : 'opacity-80'}`}
            >
              {t === 'all' ? 'All' : t === 'activated' ? 'Activated' : 'Progress'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setTab('groups')}
          className={`bg-[#1f1f1f] rounded-2xl px-5 py-2 font-serif font-bold text-white text-sm ${tab==='groups' ? 'border border-white' : ''}`}
        >
          Groups
        </button>
      </div>

      <div className="space-y-4">
        {visible.map((p) => (
          <div key={p.id} className="bg-[#1f1f1f] rounded-2xl p-5 text-white">
            <h3 className="font-serif font-bold text-2xl text-center">{p.title}</h3>
            <p className="text-center mt-1 font-serif">{p.description}</p>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => activate(p)}
                disabled={!!activated[p.id]}
                className={`px-6 py-2 rounded-lg font-serif font-bold ${activated[p.id] ? 'bg-[#555]' : 'bg-[#f5a623] text-black'}`}
              >
                {activated[p.id] ? 'Activated' : 'Activate'}
              </button>
            </div>

            <div className="border border-white/40 rounded-xl mt-4 p-3 grid grid-cols-2 gap-2 text-sm font-serif">
              <div className="border-r border-white/40 pr-2">
                <p className="text-center font-bold mb-1">App Rewards</p>
                <p className="flex items-center gap-2">🟢 Wool Points: {p.points}</p>
              </div>
              <div className="pl-2">
                <p className="text-center font-bold mb-1">Global Change</p>
                <p className="text-center text-xs opacity-80">(Estimated Values)</p>
                <p className="flex items-center gap-2 mt-1"><span className="text-yellow-400 text-lg">£</span> Savings £{p.savings}</p>
                <p className="flex items-center gap-2 mt-1"><span className="text-red-400 text-xs font-mono">CO₂e</span> Carbon Saved {p.carbon} kg CO₂</p>
              </div>
            </div>

            <span className="inline-block mt-3 bg-blue-500 text-white text-xs font-serif rounded-md px-3 py-1">
              {p.tag}
            </span>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-center text-black font-serif font-bold py-10">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
};

export default PledgesScreen;
