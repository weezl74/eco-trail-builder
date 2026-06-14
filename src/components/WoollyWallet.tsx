import React, { useMemo, useState } from 'react';
import { Wallet, ArrowDown, Waves, TreePine, MapPin, X } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';

type Card = {
  id: string;
  title: string;
  subtitle: string;
  body: React.ReactNode;
  gradient: string;
  icon: React.ReactNode;
};

const WoollyWallet: React.FC = () => {
  const { t } = useTranslations();
  const { businesses, removeBusiness } = useWallet();
  const { treesPlanted } = useSavings();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const cards = useMemo<Card[]>(() => {
    const base: Card[] = [
      {
        id: 'free-swim',
        title: t('Free Swim'),
        subtitle: t('Earned via #WalkMyWarmUp'),
        gradient: 'from-[#0ea5e9] to-[#0369a1]',
        icon: <Waves className="h-5 w-5" />,
        body: (
          <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur">
            <p className="text-[10px] opacity-80">{t('Code')}</p>
            <p className="font-mono font-bold text-base tracking-widest">SWIM-2026-AC8842</p>
          </div>
        ),
      },
      {
        id: 'tree',
        title: t('You earned a tree!'),
        subtitle: t('Planted in Penallta Parc'),
        gradient: 'from-[#166534] to-[#052e16]',
        icon: <TreePine className="h-5 w-5" />,
        body: (
          <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur">
            <p className="text-[10px] opacity-80">what3words</p>
            <p className="font-mono font-bold text-base">///filled.count.soap</p>
            <p className="text-[10px] opacity-80 mt-2">{t('Total trees')}: <span className="font-bold">{treesPlanted}</span></p>
          </div>
        ),
      },
    ];
    const biz: Card[] = businesses.map((b) => ({
      id: `biz:${b.id}`,
      title: b.name,
      subtitle: b.category,
      gradient: 'from-[#1f2937] to-[#0b0f19]',
      icon: <MapPin className="h-5 w-5" style={{ color: b.color }} />,
      body: (
        <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur">
          <p className="text-[10px] opacity-80 uppercase tracking-wider">{t('Why I’ll visit')}</p>
          <p className="text-sm leading-snug mt-1">{b.reason}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeBusiness(b.id);
              setIndex(0);
            }}
            className="mt-3 text-[10px] underline opacity-80"
          >
            {t('Remove from wallet')}
          </button>
        </div>
      ),
    }));
    return [...base, ...biz];
  }, [businesses, treesPlanted, t, removeBusiness]);

  const handleOpen = () => {
    setIndex(0);
    setOpen(true);
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % cards.length);
  };

  if (!open) {
    return (
      <div className="flex justify-end mb-3">
        <button
          onClick={handleOpen}
          className="flex flex-col items-center gap-1 bg-white/95 rounded-2xl px-4 py-2 shadow-lg"
          aria-label={t('My Woolly Wallet')}
        >
          <Wallet className="h-6 w-6 text-[#1f1f1f]" />
          <span className="text-[11px] font-serif font-bold text-[#1f1f1f] leading-tight">
            {t('My Woolly Wallet')}
          </span>
        </button>
      </div>
    );
  }

  const current = cards[index];

  return (
    <div className="mb-4 relative">
      {/* Tuck-back button */}
      <button
        onClick={() => setOpen(false)}
        className="absolute -top-2 right-0 z-30 flex flex-col items-center bg-white rounded-full px-2 py-1 shadow-lg"
        aria-label={t('Close wallet')}
      >
        <ArrowDown className="h-3 w-3 text-[#1f1f1f]" />
        <Wallet className="h-4 w-4 text-[#1f1f1f] -mt-0.5" />
      </button>

      {/* Stack slivers on the left */}
      <div className="relative h-44">
        {cards.length > 1 && (
          <>
            <div className="absolute left-0 top-2 bottom-2 w-3 rounded-l-2xl bg-white/40 shadow-inner" />
            <div className="absolute left-1 top-4 bottom-4 w-3 rounded-l-2xl bg-white/60 shadow-inner" />
          </>
        )}

        {current && (
          <button
            onClick={handleNext}
            className={`absolute left-4 right-0 top-0 bottom-0 rounded-2xl p-4 text-left text-white shadow-2xl bg-gradient-to-br ${current.gradient} transition-transform active:scale-[0.98]`}
            style={{ animation: 'wallet-deal 0.35s ease-out' }}
            key={current.id}
          >
            <div className="flex items-center gap-2 mb-1">
              {current.icon}
              <p className="text-[10px] uppercase tracking-widest opacity-80">
                {current.subtitle}
              </p>
            </div>
            <h2 className="font-serif font-bold text-xl leading-tight">{current.title}</h2>
            {current.body}
            <p className="absolute bottom-2 right-3 text-[10px] opacity-70">
              {index + 1} / {cards.length} · {t('tap for next')}
            </p>
          </button>
        )}
      </div>

      <style>{`
        @keyframes wallet-deal {
          from { transform: translateY(-12px) rotate(-2deg); opacity: 0; }
          to { transform: translateY(0) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WoollyWallet;
