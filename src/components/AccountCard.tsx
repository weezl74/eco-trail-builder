import React, { useState } from 'react';
import { Award, Leaf, Trophy, Share2, Twitter, Facebook, Link as LinkIcon, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const shareText = `I've earned ${totalPoints} green points and reduced my footprint to ${currentFootprint.toFixed(1)}t CO₂e on the Caerphilly climate app! 🌱`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async (platform: 'twitter' | 'facebook' | 'copy' | 'native') => {
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
    } else if (platform === 'native' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'My Green Card', text: shareText, url: shareUrl });
      } catch {}
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
          <div className="absolute inset-0 backface-hidden rounded-2xl p-5 shadow-xl text-white overflow-hidden"
               style={{ background: 'linear-gradient(135deg, hsl(220 91% 25%), hsl(142 85% 35%))' }}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs opacity-80 font-roboto">GREEN MEMBER CARD</p>
                  <p className="text-lg font-bold mt-1">{name}</p>
                </div>
                <Leaf className="h-7 w-7 opacity-90" />
              </div>
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
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-xl text-white overflow-hidden"
               style={{ background: 'linear-gradient(135deg, hsl(220 91% 15%), hsl(142 85% 25%))' }}>
            <div className="p-2.5 h-full flex flex-col gap-1">
              <div className="text-center">
                <p className="font-roboto font-bold text-[11px] tracking-wider leading-none">#WalkMyWarmUp</p>
                <p className="text-[8px] opacity-80 leading-tight mt-0.5">
                  93% of gym users drive ≤1 mile, then warm up the same on a machine. Walk, cycle or bus instead — earn a stamp each visit.
                </p>
              </div>

              <div className="grid grid-cols-10 gap-1 flex-1 min-h-0 items-center">
                {Array.from({ length: 10 }).map((_, i) => {
                  const stamped = i < 2;
                  const isReward = i === 9;
                  return (
                    <div
                      key={i}
                      className={`relative rounded-full border-2 flex items-center justify-center aspect-square ${
                        stamped
                          ? 'border-[#f4971d] bg-[#f4971d]/30'
                          : isReward
                          ? 'border-dashed border-yellow-300/80 bg-yellow-300/10'
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
                      ) : (
                        <span className="text-[8px] opacity-50">{i + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[8px] opacity-70 leading-none">Stamp 10 = free family swim 🏊</p>
            </div>
          </div>
        </div>
      </div>


      <p className="text-center text-xs text-muted-foreground mt-2">Tap card to flip</p>

      {/* Badges */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-foreground" />
          <h3 className="font-roboto font-bold">Badges</h3>
        </div>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No badges yet — start logging actions to earn your first!</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="bg-secondary rounded-xl p-3 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  {b.icon ?? <Trophy className="h-5 w-5 text-primary" />}
                </div>
                <p className="text-xs font-semibold">{b.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-foreground" />
          <h3 className="font-roboto font-bold">Rewards</h3>
        </div>
        {rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keep earning points to unlock rewards.</p>
        ) : (
          <div className="space-y-2">
            {rewards.map((r) => (
              <div key={r.id} className="bg-secondary rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{r.label}</span>
                {r.value && <span className="text-xs text-muted-foreground">{r.value}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-5 w-5 text-foreground" />
          <h3 className="font-roboto font-bold">Share your card</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => handleShare('twitter')} className="gap-1">
            <Twitter className="h-4 w-4" /> X
          </Button>
          <Button variant="outline" onClick={() => handleShare('facebook')} className="gap-1">
            <Facebook className="h-4 w-4" /> FB
          </Button>
          <Button variant="outline" onClick={() => handleShare('copy')} className="gap-1">
            <LinkIcon className="h-4 w-4" /> Copy
          </Button>
        </div>
        {typeof navigator !== 'undefined' && (navigator as any).share && (
          <Button onClick={() => handleShare('native')} className="w-full mt-2 gap-2">
            <Share2 className="h-4 w-4" /> Share via device
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountCard;
