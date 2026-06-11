import React, { useRef, useState } from 'react';
import { Leaf, Trophy, Share2, Footprints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import { useSavings } from '@/hooks/useSavings';
import { getPalette } from '@/lib/cardPalettes';
import { useTranslations } from '@/hooks/useTranslations';
import WalkMyWarmUpJourney from './WalkMyWarmUpJourney';


interface AccountCardProps {
  name: string;
  memberSince?: string;
  totalPoints: number;
  currentFootprint: number;
  badges?: { id: string; label: string; icon?: React.ReactNode }[];
  rewards?: { id: string; label: string; value?: string }[];
}

const AccountCard: React.FC<AccountCardProps> = ({
  name,
  memberSince = '2026',
  totalPoints,
  currentFootprint,
  badges = [],
  rewards = [],
}) => {
  const [flipped, setFlipped] = useState(false);
  const [stampsEarned, setStampsEarned] = useState(2);
  const [scanOpen, setScanOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { cardColor } = useSavings();
  const palette = getPalette(cardColor);
  const { t } = useTranslations();

  const earnStamp = () => setStampsEarned((n) => Math.min(10, n + 1));

  const shareText = `I've earned ${totalPoints} green points and reduced my footprint to ${currentFootprint.toFixed(1)}t CO₂e on the Caerphilly climate app! 🌱`;

  const handleShareCard = async () => {
    setSharing(true);
    const nav = navigator as any;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const sharePayload = {
      title: 'My Green Member Card',
      text: shareText,
      url: shareUrl,
    };

    // 1) Try the native share sheet with just text + URL first.
    //    This is what social apps (WhatsApp, Messenger, X, Instagram DMs, etc.)
    //    actually accept — sharing a file restricts the sheet to image-only apps.
    try {
      if (nav.share && (!nav.canShare || nav.canShare(sharePayload))) {
        await nav.share(sharePayload);
        setSharing(false);
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setSharing(false);
        return;
      }
      // fall through to clipboard fallback
    }

    // 2) Clipboard fallback — copy the message + link so they can paste anywhere.
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
      toast({
        title: t('Copied to clipboard'),
        description: t('Your card message and link are ready to paste into any app.'),
      });
    } catch {
      toast({
        title: t('Could not share'),
        description: t('Sharing is not supported on this device.'),
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };


  return (
    <div className="w-full">
      <div className="perspective-1000 w-full" style={{ aspectRatio: '1.586 / 1' }}>
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-700 cursor-pointer ${flipped ? 'rotate-y-180' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          {/* FRONT */}
          <div ref={frontRef} className="absolute inset-0 backface-hidden rounded-2xl p-5 shadow-xl overflow-hidden"
               style={{ background: palette.front, color: palette.text }}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: 'currentColor', opacity: 0.1 }} />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full" style={{ background: 'currentColor', opacity: 0.05 }} />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleShareCard(); }}
              disabled={sharing}
              aria-label={t('Share card')}
              className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full backdrop-blur flex items-center justify-center active:scale-95 disabled:opacity-60"
              style={{ background: 'color-mix(in srgb, currentColor 20%, transparent)' }}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start pr-10">
                <div>
                  <p className="text-xs opacity-80 font-roboto">{t('GREEN MEMBER CARD')}</p>
                  <p className="text-lg font-bold mt-1">{name}</p>
                </div>
                <Leaf className="h-7 w-7 opacity-90" />
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {badges.slice(0, 6).map((b) => (
                    <div
                      key={b.id}
                      title={b.label}
                      className="h-7 w-7 rounded-full flex items-center justify-center"
                      style={{ background: 'color-mix(in srgb, currentColor 25%, transparent)', border: '1px solid color-mix(in srgb, currentColor 40%, transparent)' }}
                    >
                      {b.icon ?? <Trophy className="h-3.5 w-3.5" />}
                    </div>
                  ))}
                  {badges.length > 6 && (
                    <div
                      className="h-7 px-2 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'color-mix(in srgb, currentColor 25%, transparent)', border: '1px solid color-mix(in srgb, currentColor 40%, transparent)' }}
                    >
                      +{badges.length - 6}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-80">{t('POINTS')}</p>
                  <p className="text-2xl font-bold tracking-wider">{totalPoints.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">{t('FOOTPRINT')}</p>
                  <p className="text-lg font-bold">{currentFootprint.toFixed(1)}t</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">{t('MEMBER')}</p>
                  <p className="text-sm font-bold">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div ref={backRef} className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-xl text-white overflow-hidden"
               style={{ background: palette.back }}>
            <div className="p-2.5 h-full flex flex-col gap-1">
              <div className="text-center">
                <p className="font-roboto font-bold text-[11px] tracking-wider leading-none">#WalkMyWarmUp</p>
                <p className="text-[8px] opacity-80 leading-tight mt-0.5">
                  93% of gym users drive ≤1 mile, then warm up the same on a machine. Walk, cycle or bus instead — earn a stamp each visit.
                </p>
              </div>

              <div className="grid grid-cols-10 gap-1 flex-1 min-h-0 items-center">
                {Array.from({ length: 10 }).map((_, i) => {
                  const stamped = i < stampsEarned;
                  const isReward = i === 9;
                  const isNext = i === stampsEarned && !isReward;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isNext) setScanOpen(true);
                      }}
                      disabled={!isNext}
                      className={`relative rounded-full border-2 flex items-center justify-center aspect-square transition ${
                      stamped
                          ? 'border-[#f4971d] bg-[#f4971d]/30'
                          : isReward
                          ? 'border-dashed border-yellow-300/80 bg-yellow-300/10'
                          : isNext
                          ? 'border-white bg-white/20 animate-pulse cursor-pointer'
                          : 'border-white/40 bg-white/5'
                      }`}
                    >
                      {stamped ? (
                        <span className="text-[7px] font-roboto font-bold leading-none text-center transform -rotate-12">
                          ✓<br />GYM
                        </span>
                      ) : isReward ? (
                        <span className="text-[6px] font-roboto font-bold leading-none text-center text-yellow-200">
                          FREE<br />SWIM
                        </span>
                      ) : isNext ? (
                        <Footprints className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-[8px] opacity-50">{i + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[8px] opacity-70 leading-none">Tap the glowing stamp to log a walk, cycle or bus trip</p>
            </div>
          </div>
        </div>
      </div>

      <WalkMyWarmUpJourney open={scanOpen} onOpenChange={setScanOpen} onEarned={earnStamp} />

      <p className="text-center text-xs text-white/80 mt-2">{t('Tap card to flip')}</p>
    </div>
  );
};

export default AccountCard;
