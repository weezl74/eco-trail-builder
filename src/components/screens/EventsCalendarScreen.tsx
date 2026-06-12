import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useSavings } from '@/hooks/useSavings';

interface Props { onBack: () => void }

type Event = { date: string; title: string; place: string; tag: 'workshop' | 'cleanup' | 'market' | 'walk' };

const EVENTS: Event[] = [
  { date: '2026-06-14', title: '#WalkMyWarmUp Group Walk', place: 'Heolddu Leisure Centre', tag: 'walk' },
  { date: '2026-06-18', title: 'Caerphilly Repair Café', place: 'Twyn Community Centre', tag: 'workshop' },
  { date: '2026-06-21', title: 'Solstice Tree Planting', place: 'Penallta Parc', tag: 'workshop' },
  { date: '2026-06-27', title: 'Bargoed Farmers Market', place: 'Bargoed Town Square', tag: 'market' },
  { date: '2026-07-05', title: 'Risca River Clean', place: 'Risca Riverside', tag: 'cleanup' },
  { date: '2026-07-11', title: 'Sirhowy Valley Litter Pick', place: 'Sirhowy Country Park', tag: 'cleanup' },
  { date: '2026-07-19', title: 'Ystrad Mynach Green Fair', place: 'Ystrad Mynach Park', tag: 'market' },
];

// Demo achievement stripes by date
const ACHIEVEMENTS: Record<string, string[]> = {
  '2026-06-02': ['#22c55e'],
  '2026-06-03': ['#22c55e', '#f4971d'],
  '2026-06-05': ['#3b82f6'],
  '2026-06-07': ['#22c55e', '#f4971d', '#a855f7'],
  '2026-06-09': ['#f4971d'],
  '2026-06-10': ['#22c55e', '#3b82f6'],
};

const TAG_COLOR: Record<Event['tag'], string> = {
  workshop: 'bg-purple-500',
  cleanup: 'bg-blue-500',
  market: 'bg-amber-500',
  walk: 'bg-green-500',
};

const EventsCalendarScreen: React.FC<Props> = ({ onBack }) => {
  const { t } = useTranslations();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7; // Mon=0
    const total = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const monthName = today.toLocaleString('en', { month: 'long' });

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-6 text-white">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-[#f5a623] font-serif font-bold">
        <ArrowLeft className="h-5 w-5" /> {t('Back')}
      </button>
      <h1 className="font-serif font-bold text-2xl mb-1">{t('Events & Achievements')}</h1>
      <p className="text-white/60 text-sm mb-4">{t('Borough-wide climate events plus your daily wins.')}</p>

      <div className="bg-[#1f1f1f] rounded-2xl p-4 mb-5">
        <p className="font-serif font-bold text-center mb-3">{monthName} {year}</p>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-white/50 mb-1">
          {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = fmt(d);
            const stripes = ACHIEVEMENTS[key] || [];
            const hasEvent = EVENTS.some(e => e.date === key);
            const isToday = d === today.getDate();
            return (
              <div key={i} className={`aspect-square rounded-md p-1 flex flex-col justify-between text-[11px] ${isToday ? 'bg-[#f4971d]/20 ring-1 ring-[#f4971d]' : 'bg-black/40'}`}>
                <span className={isToday ? 'text-[#f4971d] font-bold' : 'text-white/80'}>{d}</span>
                <div className="flex gap-0.5 h-1">
                  {stripes.map((c, idx) => <div key={idx} className="flex-1 rounded-sm" style={{ background: c }} />)}
                </div>
                {hasEvent && <div className="w-1 h-1 rounded-full bg-blue-400 self-end" />}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-white/60">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#22c55e]" /> {t('Pledge')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#f4971d]" /> {t('Stamp')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3b82f6]" /> {t('Quiz')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#a855f7]" /> {t('Badge')}</span>
        </div>
      </div>

      <h2 className="font-serif font-bold text-lg mb-2">{t('Upcoming events')}</h2>
      <div className="space-y-2">
        {EVENTS.map((e, i) => {
          const d = new Date(e.date);
          return (
            <div key={i} className="bg-[#1f1f1f] rounded-2xl p-3 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${TAG_COLOR[e.tag]} flex flex-col items-center justify-center text-white font-serif font-bold`}>
                <span className="text-[10px] uppercase">{d.toLocaleString('en',{month:'short'})}</span>
                <span className="text-lg leading-none">{d.getDate()}</span>
              </div>
              <div className="flex-1">
                <p className="font-serif font-bold">{e.title}</p>
                <p className="text-xs text-white/60">{e.place}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsCalendarScreen;
