import React, { useMemo, useRef, useState } from 'react';
import { Wallet, ArrowDown, Waves, TreePine, MapPin, Plus, Lightbulb, X, Trash2, Recycle, ExternalLink } from 'lucide-react';
import { useWallet, WalletItem } from '@/hooks/useWallet';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';
import { useBinDay, nextCollection } from '@/hooks/useBinDay';
import BinDaySetup from './BinDaySetup';

type DealtCard = {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  icon: React.ReactNode;
  body: React.ReactNode;
  bgImage?: string;
  onRemove?: () => void;
};

const MAX_W = 800;
const RATIO = 1.586; // credit card ratio

const cropAndResize = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image load failed'));
      img.onload = () => {
        const srcRatio = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > RATIO) {
          sw = img.height * RATIO;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / RATIO;
          sy = (img.height - sh) / 2;
        }
        const outW = Math.min(MAX_W, sw);
        const outH = outW / RATIO;
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no ctx'));
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

interface Props {
  children: React.ReactNode; // the carbon card
}

const WoollyWallet: React.FC<Props> = ({ children }) => {
  const { t } = useTranslations();
  const { items, addPhoto, removeItem } = useWallet();
  const { treesPlanted } = useSavings();
  const { toast } = useToast();
  const { config: binCfg, dismissed: binDismissed, save: saveBin, dismiss: dismissBin } = useBinDay();
  const [open, setOpen] = useState(false); // session-only; resets each visit
  const [index, setIndex] = useState(0);
  const [showBinSetup, setShowBinSetup] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const cards = useMemo<DealtCard[]>(() => {
    const base: DealtCard[] = [];

    // #WhatWasteWhen — everyone gets this unless they've "Binned it"
    if (!binDismissed) {
      const upcoming = binCfg ? nextCollection(binCfg) : null;
      const dateStr = upcoming
        ? upcoming.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
        : null;
      base.push({
        id: 'bin-day',
        title: binCfg ? t('Next collection') : t('Set your bin day'),
        subtitle: '#WhatWasteWhen',
        gradient: 'from-[#0f4d2a] to-[#062815]',
        icon: <Recycle className="h-5 w-5" />,
        body: binCfg ? (
          <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur space-y-2">
            <p className="font-bold text-base">{dateStr}</p>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="bg-[#7b3f1d] px-2 py-1 rounded-full">{t('Recycling')}</span>
              <span className="bg-[#166534] px-2 py-1 rounded-full">{t('Food & Garden')}</span>
              {upcoming?.general && (
                <span className="bg-black/60 px-2 py-1 rounded-full">{t('General')}</span>
              )}
            </div>
            <p className="text-[10px] opacity-80">
              {binCfg.nudge ? t('Nelson will nudge you the night before 🌙') : t('Nightly nudge off')}
            </p>
            <a
              href="https://www.caerphilly.gov.uk/Services/Recycling-and-waste/Fly-tipping"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[10px] underline opacity-90"
            >
              {t('Report fly-tipping')} <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); setShowBinSetup(true); }}
              className="block text-[10px] underline opacity-90"
            >
              {t('Edit')}
            </button>
          </div>
        ) : (
          <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur">
            <p className="text-sm leading-snug mb-2">
              {t('Tap to add your address and never miss a bin day.')}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setShowBinSetup(true); }}
              className="text-[11px] font-bold bg-[#f4971d] text-black px-3 py-1.5 rounded-lg"
            >
              {t('Set up')}
            </button>
          </div>
        ),
        onRemove: () => {
          if (confirm(t('Bin it for good? You won’t get bin-day nudges.'))) {
            dismissBin();
            setIndex(0);
          }
        },
      });
    }

    base.push(
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
    );

    const extras: DealtCard[] = items.map((it: WalletItem) => {
      if (it.kind === 'business') {
        return {
          id: it.id,
          title: it.name,
          subtitle: it.category,
          gradient: 'from-[#1f2937] to-[#0b0f19]',
          icon: <MapPin className="h-5 w-5" style={{ color: it.color }} />,
          body: (
            <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur">
              <p className="text-[10px] opacity-80 uppercase tracking-wider">{t('Why I’ll visit')}</p>
              <p className="text-sm leading-snug mt-1">{it.reason}</p>
            </div>
          ),
          onRemove: () => { removeItem(it.id); setIndex(0); },
        };
      }
      return {
        id: it.id,
        title: it.caption || t('Bright Idea'),
        subtitle: new Date(it.addedAt).toLocaleDateString(),
        gradient: 'from-[#f4971d] to-[#b45309]',
        icon: <Lightbulb className="h-5 w-5" />,
        body: null,
        bgImage: it.image,
        onRemove: () => { removeItem(it.id); setIndex(0); },
      };
    });
    return [...base, ...extras];
  }, [items, treesPlanted, t, removeItem]);

  const handleToggle = () => {
    if (open) { setOpen(false); return; }
    setIndex(0);
    setOpen(true);
  };

  const handleNext = () => setIndex((i) => (i + 1) % cards.length);

  const handlePickFile = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await cropAndResize(file);
      setPendingPhoto(dataUrl);
      setCaption('');
    } catch {
      toast({ title: t('Could not load image'), variant: 'destructive' });
    }
  };

  const savePendingPhoto = (withCaption: boolean) => {
    if (!pendingPhoto) return;
    addPhoto(pendingPhoto, withCaption ? caption.trim() || undefined : undefined);
    setPendingPhoto(null);
    setCaption('');
    setOpen(true);
    setIndex(0);
    toast({ title: t('Added to your Woolly Wallet') });
  };

  const current = open ? cards[index] : null;
  const hasStack = cards.length > 1;

  return (
    <div className="mb-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Carbon card area with overlay */}
      <div className="relative">
        {/* Slivers behind, peeking on the left */}
        {hasStack && (
          <>
            <div className="absolute -left-2 top-3 bottom-3 w-3 rounded-l-2xl bg-white/50 shadow-md z-0" />
            <div className="absolute -left-1 top-5 bottom-5 w-3 rounded-l-2xl bg-white/70 shadow-md z-0" />
          </>
        )}

        {/* Carbon card (children) */}
        <div className="relative z-10">{children}</div>

        {/* Dealt card overlay */}
        {current && (
          <button
            key={current.id}
            onClick={handleNext}
            className={`absolute inset-0 z-20 rounded-2xl text-left text-white shadow-2xl overflow-hidden bg-gradient-to-br ${current.gradient}`}
            style={{
              animation: 'wallet-deal 0.35s ease-out',
              transform: 'translate(8px, 10px)',
            }}
          >
            {current.bgImage && (
              <img
                src={current.bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            )}
            {current.bgImage && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            )}

            <div className="relative p-4 h-full flex flex-col">
              <div className="flex items-center gap-2">
                {current.icon}
                <p className="text-[10px] uppercase tracking-widest opacity-90">{current.subtitle}</p>
              </div>
              <h2 className="font-serif font-bold text-xl leading-tight mt-1 drop-shadow">{current.title}</h2>
              {current.body}
              <div className="mt-auto flex items-end justify-between">
                {current.onRemove ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); current.onRemove?.(); }}
                    className="text-[10px] underline opacity-90 inline-flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> {t('Remove')}
                  </span>
                ) : <span />}
                <p className="text-[10px] opacity-80">
                  {index + 1} / {cards.length} · {t('tap for next')}
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Controls row */}
      <div className="flex justify-end items-center gap-2 mt-3">
        <button
          onClick={handlePickFile}
          className="flex flex-col items-center justify-center bg-white/95 rounded-2xl px-3 py-2 shadow-lg h-[68px] w-[68px]"
          aria-label={t('Add Idea')}
        >
          <Plus className="h-5 w-5 text-[#1f1f1f]" />
          <span className="text-[10px] font-serif font-bold text-[#1f1f1f] leading-tight mt-0.5">
            {t('Add Idea')}
          </span>
        </button>

        <button
          onClick={handleToggle}
          className="flex flex-col items-center justify-center bg-white/95 rounded-2xl px-3 py-2 shadow-lg h-[68px] w-[68px]"
          aria-label={open ? t('Close wallet') : t('My Woolly Wallet')}
        >
          {open ? (
            <>
              <ArrowDown className="h-4 w-4 text-[#1f1f1f]" />
              <Wallet className="h-5 w-5 text-[#1f1f1f] -mt-0.5" />
            </>
          ) : (
            <>
              <Wallet className="h-6 w-6 text-[#1f1f1f]" />
              <span className="text-[10px] font-serif font-bold text-[#1f1f1f] leading-tight mt-0.5">
                {t('My Wallet')}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Pending-photo caption sheet */}
      {pendingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl">
            <p className="font-serif font-bold text-lg text-[#1f1f1f] mb-2">{t('Add a caption?')}</p>
            <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '1.586 / 1' }}>
              <img src={pendingPhoto} alt="preview" className="w-full h-full object-cover" />
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('e.g. Solar quote from Dave')}
              maxLength={60}
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setPendingPhoto(null); setCaption(''); }}
                className="flex-1 rounded-lg py-2 text-sm font-bold border border-black/10"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={() => savePendingPhoto(false)}
                className="flex-1 rounded-lg py-2 text-sm font-bold bg-black/10"
              >
                {t('Skip')}
              </button>
              <button
                onClick={() => savePendingPhoto(true)}
                className="flex-1 rounded-lg py-2 text-sm font-bold text-white bg-[#f4971d]"
              >
                {t('Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wallet-deal {
          from { transform: translate(-20px, -30px) rotate(-6deg); opacity: 0; }
          to { transform: translate(8px, 10px) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WoollyWallet;
