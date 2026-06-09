import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { supabase } from '@/integrations/supabase/client';

type Tab = 'all' | 'activated' | 'progress' | 'groups';

type Pledge = {
  id: number;
  title: string;
  description: string | null;
  co2_saved: number | null;
  money_saved: number | null;
  water_saved: number | null;
  wool_points: number | null;
  tag: string | null;
  key: string;
  category: string | null;
};

const PledgesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('all');
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const { pledged, addPledge } = useSavings();
  const activated = pledged.reduce<Record<string, boolean>>((acc, id) => { acc[id] = true; return acc; }, {});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select('id,title,description,co2_saved,money_saved,water_saved,wool_points,tag,key,category')
        .eq('user_group', 'resident')
        .order('id', { ascending: true });
      if (!mounted) return;
      if (error) console.error('Failed to load pledges', error);
      setPledges((data ?? []) as Pledge[]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const activate = (p: Pledge) => {
    if (activated[p.key]) return;
    addPledge(p.key, {
      money: Number(p.money_saved ?? 0),
      co2: Number(p.co2_saved ?? 0),
      water: Number(p.water_saved ?? 0),
    });
  };

  const visible = pledges.filter((p) => {
    if (tab === 'activated' || tab === 'progress') return activated[p.key];
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-4">
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

      {loading ? (
        <p className="text-center text-black font-serif font-bold py-10">Loading pledges…</p>
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <div key={p.id} className="bg-[#1f1f1f] rounded-2xl p-5 text-white">
              <h3 className="font-serif font-bold text-2xl text-center">{p.title}</h3>
              <p className="text-center mt-1 font-serif">{p.description}</p>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => activate(p)}
                  disabled={!!activated[p.key]}
                  className={`px-6 py-2 rounded-lg font-serif font-bold ${activated[p.key] ? 'bg-[#555]' : 'bg-[#F4971D] text-black'}`}
                >
                  {activated[p.key] ? 'Activated' : 'Activate'}
                </button>
              </div>

              <div className="border border-white/40 rounded-xl mt-4 p-3 grid grid-cols-2 gap-2 text-sm font-serif">
                <div className="border-r border-white/40 pr-2">
                  <p className="text-center font-bold mb-1">App Rewards</p>
                  <p className="flex items-center gap-2">🟢 Wool Points: {p.wool_points ?? 0}</p>
                </div>
                <div className="pl-2">
                  <p className="text-center font-bold mb-1">Global Change</p>
                  <p className="text-center text-xs opacity-80">(Estimated Values)</p>
                  <p className="flex items-center gap-2 mt-1"><span className="text-yellow-400 text-lg">£</span> Savings £{p.money_saved ?? 0}</p>
                  <p className="flex items-center gap-2 mt-1"><span className="text-red-400 text-xs font-mono">CO₂e</span> Carbon Saved {p.co2_saved ?? 0} kg CO₂</p>
                  {Number(p.water_saved ?? 0) > 0 && (
                    <p className="flex items-center gap-2 mt-1"><span className="text-blue-300 text-xs font-mono">H₂O</span> Water Saved {p.water_saved} L</p>
                  )}
                </div>
              </div>

              {p.category && (
                <span className="inline-block mt-3 mr-2 bg-blue-500 text-white text-xs font-serif rounded-md px-3 py-1">
                  {p.category}
                </span>
              )}
              {p.tag && (
                <span className="inline-block mt-3 bg-purple-500 text-white text-xs font-serif rounded-md px-3 py-1">
                  {p.tag}
                </span>
              )}
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-center text-black font-serif font-bold py-10">Nothing here yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PledgesScreen;
