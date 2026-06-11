import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import nelsonHead from '@/assets/sheep/NelsonHead.svg.asset.json';

interface Props { onBack: () => void }

type Msg = { id: string; title: string; body: string; date: string; unread?: boolean };

const MESSAGES: Msg[] = [
  { id: '1', title: 'New: #WalkMyWarmUp', body: "Baaa! You can now earn a free swim by walking or cycling to your leisure centre. Tap Challenges to start your journey.", date: '2026-06-10', unread: true },
  { id: '2', title: 'Quizzes are live', body: 'Test your green knowledge — a fresh quiz drops every week. Find them under Challenges → Quizzes.', date: '2026-06-08', unread: true },
  { id: '3', title: 'Allotment map updated', body: 'I have spread the allotment pins across the borough so you can find your nearest plot more easily.', date: '2026-06-05' },
  { id: '4', title: 'Welcome to Nurture', body: 'Glad to have you in the flock. Make your first pledge to start saving £, CO₂e and water.', date: '2026-06-01' },
];

const NelsonMessagesScreen: React.FC<Props> = ({ onBack }) => {
  const { t } = useTranslations();
  const [open, setOpen] = useState<Msg | null>(null);

  if (open) {
    return (
      <div className="min-h-screen bg-black pb-24 px-4 pt-6 text-white">
        <button onClick={() => setOpen(null)} className="flex items-center gap-2 mb-4 text-[#f5a623] font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Inbox')}
        </button>
        <div className="flex items-center gap-3 mb-3">
          <img src={nelsonHead.url} alt="Nelson" className="w-14 h-14 rounded-full bg-[#1f1f1f] p-1" />
          <div>
            <p className="font-serif font-bold">Nelson</p>
            <p className="text-xs text-white/60">{open.date}</p>
          </div>
        </div>
        <h1 className="font-serif font-bold text-2xl mb-2">{open.title}</h1>
        <p className="text-white/80 leading-relaxed">{open.body}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-6 text-white">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-[#f5a623] font-serif font-bold">
        <ArrowLeft className="h-5 w-5" /> {t('Back')}
      </button>
      <div className="flex items-center gap-3 mb-5">
        <img src={nelsonHead.url} alt="Nelson" className="w-16 h-16 rounded-full bg-[#1f1f1f] p-1" />
        <div>
          <h1 className="font-serif font-bold text-2xl">{t('Messages from Nelson')}</h1>
          <p className="text-xs text-white/60">{t('In-app news, features and nudges')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {MESSAGES.map(m => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="w-full text-left bg-[#1f1f1f] rounded-2xl p-4 flex gap-3 items-start"
          >
            {m.unread && <span className="w-2 h-2 mt-2 rounded-full bg-[#f4971d] flex-shrink-0" />}
            <div className="flex-1">
              <div className="flex justify-between gap-2">
                <p className="font-serif font-bold">{m.title}</p>
                <span className="text-[10px] text-white/50">{m.date}</span>
              </div>
              <p className="text-sm text-white/70 line-clamp-2 mt-1">{m.body}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NelsonMessagesScreen;
