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
            <div className="h-8 bg-black/60 mt-4" />
            <div className="p-4 space-y-3">
              <div className="bg-white/15 rounded-lg p-2 text-xs flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Tap to flip back
              </div>
              <div className="flex justify-between text-xs">
                <span>ID: {(name || 'USER').slice(0, 4).toUpperCase()}-{totalPoints}</span>
                <span>Caerphilly Green</span>
              </div>
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
