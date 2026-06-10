import React, { useEffect, useState } from 'react';
import { ArrowLeft, TreePine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';

type Mode = 'wool' | 'tree';
interface Row { name: string; points: number }

const woolFallback: Row[] = [
  { name: 'Louise Woolley', points: 3000 },
  { name: 'Alicia', points: 2250 },
  { name: 'JoshGE', points: 1000 },
  { name: 'Huw', points: 500 },
  { name: 'Portia', points: 450 },
  { name: 'Rozanna', points: 400 },
  { name: 'Katy', points: 375 },
];

const treeFallback: Row[] = [
  { name: 'Rowan Adams', points: 500 },
  { name: 'Cwm Bakery', points: 179 },
  { name: 'Daniel Cooke', points: 162 },
  { name: 'Crafty Legs Events', points: 117 },
  { name: 'Josh', points: 100 },
];

const LeaderboardTreesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('wool');
  const [rows, setRows] = useState<Row[]>(woolFallback);
  const { toast } = useToast();
  const { treesPlanted, treePoints, woolPoints, plantTree } = useSavings();
  const { t } = useTranslations();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('get_leaderboard', { _limit: 20 });
      const real: Row[] = (data || []).map((d: any) => ({
        name: d.display_name || d.username || 'User',
        points: d.total_points ?? 0,
      }));
      const fallback = mode === 'wool' ? woolFallback : treeFallback;
      const merged = [...real, ...fallback].reduce<Row[]>((acc, r) => {
        if (!acc.find((x) => x.name.toLowerCase() === r.name.toLowerCase())) acc.push(r);
        return acc;
      }, []);
      merged.sort((a, b) => b.points - a.points);
      setRows(merged);
    })();
  }, [mode]);

  const board = rows;
  const heading = mode === 'wool' ? t('WOOL POINTS') : t('TREE POINTS');
  const myPoints = mode === 'wool' ? woolPoints : treePoints;

  const join = () => {
    if (plantTree(100)) {
      toast({ title: t('Joined the Tree Queue!'), description: t('A tree will be planted on your behalf.') });
    } else {
      toast({ title: t('Not enough Tree Points'), description: t('100 Tree Points required.') });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="text-black mb-2 flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}

      <div className="text-center text-black font-serif font-bold">
        <p className="text-2xl">{t('Estimated Offset')}</p>
        <p className="text-2xl">25,500 CO₂e</p>
        <p className="text-2xl">KG</p>
      </div>

      <div className="bg-[#1f1f1f] rounded-full mt-4 p-1 grid grid-cols-2 text-center font-serif font-bold">
        {(['wool', 'tree'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-2 transition ${
              mode === m ? 'bg-[#f5a623] text-black' : 'text-white'
            }`}
          >
            {m === 'wool' ? t('Wool Points') : t('Tree Points')}
          </button>
        ))}
      </div>

      <p className="text-center text-black font-serif font-bold mt-3">
        {t('You have')} <span className="text-[#1f1f1f]">{myPoints}</span> {mode === 'wool' ? t('wool') : t('Tree').toLowerCase()} {t('points')}
      </p>

      <div className="bg-[#1f1f1f] rounded-2xl mt-3 overflow-hidden">
        <div className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 border-b border-white/20">
          <span>{t('POSITION')}</span>
          <span>{t('USER')}</span>
          <span>{heading}</span>
        </div>
        {board.map((r, i) => (
          <div
            key={`${mode}-${i}`}
            className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 text-lg border-b border-white/10 last:border-0"
          >
            <span>#{i + 1}</span>
            <span>{r.name}</span>
            <span>{r.points}</span>
          </div>
        ))}
      </div>

      {mode === 'tree' && (
        <>
          <div className="flex justify-center my-6">
            <TreePine className="h-28 w-28 text-green-700" strokeWidth={1.5} />
          </div>
          <div className="bg-[#1f1f1f] rounded-2xl py-4 text-center text-white font-serif font-bold text-2xl mb-4">
            {t('Trees you have planted')}: {treesPlanted}
          </div>
          <button
            onClick={join}
            className="w-full bg-[#1f1f1f] rounded-2xl py-5 text-white font-serif font-bold text-2xl active:scale-[0.99] transition"
          >
            {t('Join the Tree Queue')}
            <p className="text-base font-normal mt-1">{t('100 Tree Points Required')}</p>
          </button>
        </>
      )}

      {mode === 'wool' && (
        <div className="mt-6 bg-[#1f1f1f] rounded-2xl p-4 text-white font-serif">
          <p className="font-bold text-lg mb-1">{t('Spend your wool')}</p>
          <p className="text-sm opacity-80">
            {t('Use wool points to customise your sheep on the Account tab, or cool the borough by placing solar farms and wind turbines on the Shop Local map.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTreesScreen;
