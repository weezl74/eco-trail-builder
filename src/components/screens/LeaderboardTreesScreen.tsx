
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import nelsonHead from '@/assets/sheep/NelsonHead.svg.asset.json';

import { useToast } from '@/hooks/use-toast';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';

type Mode = 'wool' | 'tree';

interface Row {
  name: string;
  points: number;
}

// ✅ Icons unchanged
const OakTreeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <g fill="#3f8a3a">
      <circle cx="32" cy="20" r="14" />
      <circle cx="18" cy="26" r="11" />
      <circle cx="46" cy="26" r="11" />
      <circle cx="24" cy="34" r="10" />
      <circle cx="40" cy="34" r="10" />
      <circle cx="32" cy="32" r="12" />
    </g>
    <rect x="29" y="38" width="6" height="18" rx="1.5" fill="#6b4226" />
    <ellipse cx="32" cy="58" rx="14" ry="2.5" fill="#3a2a1a" opacity="0.35" />
  </svg>
);

const WoolBallIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <circle cx="32" cy="32" r="26" fill={color} stroke="#1f1f1f" strokeWidth="2" />
    <g fill="none" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
      <path d="M10 28 C 22 18, 42 18, 54 28" />
      <path d="M8 36 C 22 24, 42 24, 56 36" />
      <path d="M12 44 C 24 36, 40 36, 52 44" />
      <path d="M18 52 C 26 46, 38 46, 46 52" />
      <path d="M20 14 C 28 22, 36 22, 44 14" />
    </g>
  </svg>
);

const LeaderboardTreesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('wool');
  const [rows, setRows] = useState<Row[]>([]);

  const { toast } = useToast();
  const { treesPlanted, treePoints, woolPoints, plantTree, woolColor } = useSavings();
  const { t } = useTranslations();

  // ✅ Clean, real, user-only leaderboard
  useEffect(() => {
    const myRow: Row = {
      name: 'You',
      points: mode === 'wool' ? woolPoints : treePoints,
    };

    setRows([myRow]);
  }, [mode, woolPoints, treePoints]);

  const heading = mode === 'wool' ? t('WOOL POINTS') : t('TREE POINTS');
  const myPoints = mode === 'wool' ? woolPoints : treePoints;

  const join = () => {
    if (plantTree(100)) {
      toast({
        title: t('Joined the Tree Queue!'),
        description: t('A tree will be planted on your behalf.')
      });
    } else {
      toast({
        title: t('Not enough Tree Points'),
        description: t('100 Tree Points required.')
      });
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
