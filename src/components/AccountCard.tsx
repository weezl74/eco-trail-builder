import React, { useRef, useState } from 'react';
import { Leaf, Trophy, Share2, QrCode, ScanLine, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import { useSavings } from '@/hooks/useSavings';
import { getPalette } from '@/lib/cardPalettes';

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
  const [scanning, setScanning] = useState(false);
  const [sharing, setSharing] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { cardColor } = useSavings();
  const palette = getPalette(cardColor);

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setStampsEarned((n) => Math.min(10, n + 1));
      setScanOpen(false);
      toast({
        title: 'Visit verified! 🎉',
        description: 'Stamp added to your #WalkMyWarmUp card.',
      });
    }, 1400);
  };

  const shareText = `I've earned ${totalPoints} green points and reduced my footprint to ${currentFootprint.toFixed(1)}t CO₂e on the Caerphilly climate app! 🌱`;

  const handleShareCard = async () => {
    const target = flipped ? backRef.current : frontRef.current;
    if (!target) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(target, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'green-member-card.png', { type: 'image/png' });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'My Green Member Card', text: shareText });
      } else {
        // Fallback: download the image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'green-member-card.png';
        a.click();
        toast({ title: 'Card image saved', description: 'Sharing not supported on this device — image downloaded instead.' });
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast({ title: 'Could not share card', description: err?.message ?? 'Unknown error', variant: 'destructive' });
      }
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
          <div ref={frontRef} className="absolute inset-0 backface-hidden rounded-2xl p-5 shadow-xl text-white overflow-hidden"
               style={{ background: palette.front }}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleShareCard(); }}
              disabled={sharing}
              aria-label="Share card"
              className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-95 disabled:opacity-60"
            >
              <Share2 className="h-4 w-4 text-white" />
            </button>
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start pr-10">
                <div>
                  <p className="text-xs opacity-80 font-roboto">GREEN MEMBER CARD</p>
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
                      className="h-7 w-7 rounded-full bg-white/25 border border-white/40 flex items-center justify-center"
                    >
                      {b.icon ?? <Trophy className="h-3.5 w-3.5 text-white" />}
                    </div>
                  ))}
                  {badges.length > 6 && (
                    <div className="h-7 px-2 rounded-full bg-white/25 border border-white/40 flex items-center justify-center text-[10px] font-bold">
                      +{badges.length - 6}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-80">POINTS</p>
                  <p className="text-2xl font-bold tracking-wider">{totalPoints.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">FOOTPRINT</p>
                  <p className="text-lg font-bold">{currentFootprint.toFixed(1)}t</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">MEMBER</p>
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
                        <QrCode className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-[8px] opacity-50">{i + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[8px] opacity-70 leading-none">Tap the glowing stamp to scan at the leisure centre</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-roboto">
              <ScanLine className="h-5 w-5 text-[#F4971D]" /> Verify your visit
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" /> Scan the QR code at reception
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl bg-[#F4971D]/10 border-2 border-[#F4971D]/30 p-6 flex flex-col items-center">
            <div className="relative w-48 h-48 bg-white rounded-xl p-3 shadow-inner">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                  backgroundSize: '14px 14px',
                  backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
                }}
              />
              {scanning && (
                <div className="absolute inset-3 overflow-hidden rounded">
                  <div className="absolute left-0 right-0 h-1 bg-[#F4971D] shadow-[0_0_12px_2px_#F4971D] animate-[scan_1.4s_ease-in-out]" style={{ top: '50%' }} />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Point your camera at the QR code at your leisure centre to log this visit.
            </p>
          </div>

          <Button
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full bg-[#F4971D] hover:bg-[#F4971D]/90 text-white font-roboto rounded-xl"
          >
            {scanning ? 'Verifying…' : 'Simulate scan (prototype)'}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground -mt-2">For stakeholder demo only</p>
        </DialogContent>
      </Dialog>


      <p className="text-center text-xs text-white/80 mt-2">Tap card to flip</p>
    </div>
  );
};

export default AccountCard;
