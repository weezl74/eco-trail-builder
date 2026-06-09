import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Range = '7' | '30' | 'all';

interface Row { name: string; points: number; }

const fallback: Row[] = [
  { name: 'Louise Woolley', points: 3000 },
  { name: 'Alicia', points: 2250 },
  { name: 'JoshGE', points: 1000 },
  { name: 'Huw', points: 500 },
  { name: 'Portia', points: 450 },
  { name: 'Rozanna', points: 400 },
  { name: 'Katy', points: 375 },
  { name: 'CJames07', points: 300 },
  { name: 'ERodgers99', points: 250 },
];

const LeaderboardScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [range, setRange] = useState<Range>('all');
  const [rows, setRows] = useState<Row[]>(fallback);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('get_leaderboard', { _limit: 20 });
      if (data && data.length > 0) {
        setRows(data.map((d: any) => ({ name: d.username || 'User', points: d.total_points ?? 0 })));
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="text-white mb-2 flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}
      <h1 className="text-white text-center font-serif font-bold text-4xl mt-3 mb-4">Leaderboard</h1>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {([
          { id: '7', label: '7 Days' },
          { id: '30', label: '30 Days' },
          { id: 'all', label: 'All-Time' },
        ] as { id: Range; label: string }[]).map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`rounded-lg py-2 font-serif font-bold text-white text-lg ${range === r.id ? 'bg-blue-600' : 'bg-blue-500/80'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className="bg-[#f5a623] rounded-2xl px-5 py-4 flex items-center justify-between"
          >
            <span className="font-serif font-bold text-black text-lg">{r.name}</span>
            <span className="font-serif font-bold text-black text-xl">{r.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
