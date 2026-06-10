import React, { useState } from 'react';
import { Check, Circle, ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

const topics = [
  { id: 'climate', label: 'Climate Change' },
  { id: 'decarb', label: 'Decarbonisation' },
  { id: 'greenhouse', label: 'Greenhouse Effect' },
  { id: 'fossil', label: 'Fossil Fuels' },
  { id: 'renewables', label: 'Renewables' },
  { id: 'biodiversity', label: 'Biodiversity' },
];

const QuizzesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const { t } = useTranslations();

  const advance = (id: string) => {
    setProgress((p) => {
      const next = Math.min(5, (p[id] ?? 0) + 1);
      if (next === 5) setCompleted((c) => ({ ...c, [id]: true }));
      return { ...p, [id]: next };
    });
  };

  return (
    <div className="min-h-screen bg-black pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="mb-3 text-white flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}
      <div className="space-y-5">
        {topics.map((tp) => {
          const done = completed[tp.id];
          return (
            <button
              key={tp.id}
              onClick={() => advance(tp.id)}
              className="w-full bg-[#f5a623] rounded-2xl p-5 text-left shadow-lg active:scale-[0.99] transition"
            >
              <div className="flex">
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-2xl text-black">{t(tp.label)}</h3>
                  <p className="font-serif font-bold text-black mt-3">
                    {t('Current Question:')} {progress[tp.id] ?? ''}/5
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 w-24">
                  <span className="font-serif text-black">{t('Completed?')}</span>
                  {done ? (
                    <Check className="h-9 w-9 text-black" strokeWidth={3} />
                  ) : (
                    <Circle className="h-8 w-8 text-black" strokeWidth={2} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizzesScreen;
