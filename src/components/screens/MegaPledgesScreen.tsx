import React, { useState } from 'react';
import { ArrowLeft, Users, Zap } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

type Mega = {
  id: string;
  title: string;
  description: string;
  goal: number;
  joined: number;
  points: number;
  carbon: string;
  tag: string;
};

const MEGAS: Mega[] = [
  {
    id: 'meat-free-may',
    title: 'Meat Free May',
    description: 'Join thousands of Caerphilly residents going meat-free for the whole month of May.',
    goal: 2000,
    joined: 1247,
    points: 500,
    carbon: '12,400 kg CO₂',
    tag: 'food',
  },
  {
    id: 'lights-out',
    title: 'Lights Out Caerphilly',
    description: 'A county-wide hour of darkness — every household switches off for 1 hour on the longest day.',
    goal: 5000,
    joined: 3120,
    points: 250,
    carbon: '4,800 kg CO₂',
    tag: 'electricity',
  },
  {
    id: 'school-run',
    title: 'Park & Stride School Run',
    description: 'Park 5 minutes from the school gate and walk the rest, for every school day this term.',
    goal: 1500,
    joined: 612,
    points: 400,
    carbon: '8,900 kg CO₂',
    tag: 'transport',
  },
  {
    id: 'no-fly-summer',
    title: 'No-Fly Summer',
    description: 'Pledge to holiday in Wales or the UK instead of flying abroad this summer.',
    goal: 1000,
    joined: 248,
    points: 1000,
    carbon: '320,000 kg CO₂',
    tag: 'travel',
  },
];

const MegaPledgesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="mb-3 text-black flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}

      <h1 className="font-serif font-bold text-3xl text-black text-center mb-1">{t('Mega Pledges')}</h1>
      <p className="font-serif text-center text-black/80 mb-4 text-sm">{t('County-wide collective actions for big impact.')}</p>

      <div className="space-y-4">
        {MEGAS.map((m) => {
          const pct = Math.min(100, Math.round(((m.joined + (joined[m.id] ? 1 : 0)) / m.goal) * 100));
          return (
            <div key={m.id} className="bg-[#1f1f1f] rounded-2xl p-5 text-white">
              <h3 className="font-serif font-bold text-2xl text-center">{t(m.title)}</h3>
              <p className="text-center mt-1 font-serif text-sm opacity-90">{t(m.description)}</p>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-serif mb-1">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(m.joined + (joined[m.id] ? 1 : 0)).toLocaleString()} {t('joined')}</span>
                  <span>{t('Goal')} {m.goal.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f5a623] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setJoined((s) => ({ ...s, [m.id]: !s[m.id] }))}
                  className={`px-6 py-2 rounded-lg font-serif font-bold ${joined[m.id] ? 'bg-[#555]' : 'bg-[#f5a623] text-black'}`}
                >
                  {joined[m.id] ? t('Joined') : t('Join the Movement')}
                </button>
              </div>

              <div className="border border-white/40 rounded-xl mt-4 p-3 flex justify-between text-sm font-serif">
                <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-yellow-400" /> {m.points} pts</span>
                <span className="opacity-80">{m.carbon} {t('saved if goal hit')}</span>
              </div>

              <span className="inline-block mt-3 bg-blue-500 text-white text-xs font-serif rounded-md px-3 py-1">
                {t(m.tag)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MegaPledgesScreen;
