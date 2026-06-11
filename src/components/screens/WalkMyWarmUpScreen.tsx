import React, { useState } from 'react';
import { ArrowLeft, Footprints, Bike, Bus, Car } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import WalkMyWarmUpJourney from '../WalkMyWarmUpJourney';
import { useAuth } from '@/hooks/useAuth';

const storageKey = (uid: string) => `nurture.warmup.${uid}`;

const WalkMyWarmUpScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [stamps, setStamps] = useState<number>(() => {
    if (!user) return 0;
    try { return Number(localStorage.getItem(storageKey(user.id)) ?? 0); } catch { return 0; }
  });

  const earn = () => {
    setStamps((n) => {
      const next = Math.min(10, n + 1);
      if (user) localStorage.setItem(storageKey(user.id), String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-6 font-roboto">
      <button onClick={onBack} className="flex items-center gap-2 text-white font-bold mb-4">
        <ArrowLeft className="h-5 w-5" /> {t('Back')}
      </button>

      <h1 className="text-white text-3xl font-bold mb-1">#WalkMyWarmUp</h1>
      <p className="text-white/90 text-sm mb-5">
        {t('93% of gym users drive ≤1 mile, then warm up the same on a machine. Walk, cycle or bus to the leisure centre — earn a stamp each visit. 10 stamps = a free family swim.')}
      </p>

      <div className="bg-white rounded-2xl p-4 mb-5 shadow-md">
        <p className="text-xs text-[#1f1f1f]/70 mb-2">{t('Stamps')}</p>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => {
            const done = i < stamps;
            const reward = i === 9;
            return (
              <div
                key={i}
                className={`aspect-square rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                  done
                    ? 'bg-[#F4971D] border-[#F4971D] text-white'
                    : reward
                    ? 'border-dashed border-[#F4971D] text-[#F4971D]'
                    : 'border-[#1f1f1f]/20 text-[#1f1f1f]/40'
                }`}
              >
                {done ? '✓' : reward ? '🏊' : i + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { Icon: Footprints, label: 'Walk' },
          { Icon: Bike, label: 'Cycle' },
          { Icon: Bus, label: 'Bus' },
          { Icon: Car, label: 'Car', muted: true },
        ].map(({ Icon, label, muted }) => (
          <div
            key={label}
            className={`rounded-2xl p-3 text-center ${muted ? 'bg-white/40 text-white/60' : 'bg-white text-[#1f1f1f]'}`}
          >
            <Icon className="h-6 w-6 mx-auto" />
            <p className="text-[10px] font-bold mt-1">{t(label)}</p>
            <p className="text-[9px] opacity-70">{muted ? t('No stamp') : t('Earns stamp')}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="w-full bg-[#1f1f1f] text-white rounded-2xl py-4 font-bold shadow-lg active:scale-[0.99] transition"
      >
        {t('Join & log a journey')}
      </button>

      <WalkMyWarmUpJourney open={open} onOpenChange={setOpen} onEarned={earn} />
    </div>
  );
};

export default WalkMyWarmUpScreen;
