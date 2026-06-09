import React, { useState } from 'react';
import { ArrowLeft, Lock, Leaf } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';
import sheepAsset from '@/assets/sheep-avatar.jpg.asset.json';
import { CARD_PALETTES, getPalette } from '@/lib/cardPalettes';

type AccessoryId = 'tophat' | 'bowtie';
const ACCESSORIES: { id: AccessoryId; label: string; cost: number }[] = [
  { id: 'tophat', label: 'Top Hat', cost: 60 },
  { id: 'bowtie', label: 'Bow Tie', cost: 30 },
];

type Tab = 'avatar' | 'card';

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('avatar');
  const { woolPoints, accessories, buyAccessory, cardColor, setCardColor } = useSavings();
  const palette = getPalette(cardColor);

  const handleBuy = (a: typeof ACCESSORIES[number]) => {
    if (accessories.includes(a.id)) return;
    const ok = buyAccessory(a.id, a.cost);
    toast({
      title: ok ? `${a.label} unlocked` : 'Not enough wool',
      description: ok ? `-${a.cost} wool points` : `${a.label} costs ${a.cost} wool.`,
    });
  };

  const has = (id: AccessoryId) => accessories.includes(id);

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-4 flex flex-col">
      {onBack && (
        <button onClick={onBack} className="text-black flex items-center gap-1 font-serif font-bold mb-2">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}

      <div className="text-center font-serif font-bold text-black mb-3">
        Wool Points: {woolPoints}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1f1f1f] rounded-full p-1 mb-4">
        <button
          onClick={() => setTab('avatar')}
          className={`flex-1 py-2 rounded-full text-sm font-serif font-bold ${
            tab === 'avatar' ? 'bg-white text-black' : 'text-white'
          }`}
        >
          Avatar
        </button>
        <button
          onClick={() => setTab('card')}
          className={`flex-1 py-2 rounded-full text-sm font-serif font-bold ${
            tab === 'card' ? 'bg-white text-black' : 'text-white'
          }`}
        >
          Card Colour
        </button>
      </div>

      {tab === 'avatar' && (
        <>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72">
              <img
                src={sheepAsset.url}
                alt="Your sheep avatar"
                className="w-full h-full object-contain select-none"
                draggable={false}
              />
              {has('tophat') && (
                <div className="absolute pointer-events-none" style={{ left: '42%', top: '2%', width: '16%' }}>
                  <div className="h-6 bg-[#1f1f1f]">
                    <div className="h-1 bg-[#8b0000] mt-2" />
                  </div>
                  <div className="h-1.5 bg-[#1f1f1f] -mx-2" />
                </div>
              )}
              {has('bowtie') && (
                <div className="absolute pointer-events-none" style={{ left: '44%', top: '24%', width: '12%' }}>
                  <svg viewBox="0 0 40 20" className="w-full">
                    <polygon points="0,2 20,10 0,18" fill="#dc2626" />
                    <polygon points="40,2 20,10 40,18" fill="#dc2626" />
                    <circle cx="20" cy="10" r="3" fill="#7a0d0d" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#3a3a3a] rounded-2xl p-4">
            <p className="text-white font-serif font-bold text-sm mb-2">Accessories</p>
            <div className="grid grid-cols-2 gap-2">
              {ACCESSORIES.map((a) => {
                const owned = has(a.id);
                const afford = woolPoints >= a.cost;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleBuy(a)}
                    disabled={owned || !afford}
                    className={`rounded-xl p-2 text-xs font-serif font-bold text-left flex items-center justify-between ${
                      owned ? 'bg-[#F4971D] text-black' : afford ? 'bg-white text-black' : 'bg-white/30 text-white'
                    }`}
                  >
                    <span>{a.label}</span>
                    <span className="flex items-center gap-1">
                      {!owned && !afford && <Lock className="h-3 w-3" />}
                      {owned ? '✓' : `${a.cost}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {tab === 'card' && (
        <>
          {/* Live preview */}
          <div className="mb-4" style={{ aspectRatio: '1.586 / 1' }}>
            <div
              className="w-full h-full rounded-2xl p-5 shadow-xl text-white relative overflow-hidden"
              style={{ background: palette.front }}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
              <p className="text-xs opacity-80 font-roboto">GREEN MEMBER CARD</p>
              <p className="text-lg font-bold mt-1">Preview</p>
            </div>
          </div>

          {/* Palette picker */}
          <div className="bg-[#1f1f1f] rounded-2xl p-4 space-y-3">
            <p className="text-white font-serif font-bold text-sm">Choose a colour</p>
            <div className="grid grid-cols-2 gap-2">
              {CARD_PALETTES.map((p) => {
                const selected = p.id === cardColor;
                return (
                  <button
                    key={p.id}
                    onClick={() => setCardColor(p.id)}
                    className={`rounded-xl p-2 text-left border-2 transition ${
                      selected ? 'border-[#F4971D] bg-white/10' : 'border-transparent bg-white/5'
                    }`}
                  >
                    <div
                      className="h-10 w-full rounded-md mb-2"
                      style={{ background: p.front }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-serif font-bold">{p.label}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4].map((i) => (
                          <Leaf
                            key={i}
                            className={`h-3 w-3 ${
                              i <= 5 - p.carbonScore ? 'text-green-400' : 'text-white/20'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Carbon reason for selected */}
            <div className="rounded-xl bg-green-900/40 border border-green-400/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-green-300" />
                <span className="text-green-100 text-xs font-serif font-bold uppercase tracking-wide">
                  Carbon impact
                </span>
              </div>
              <p className="text-white/90 text-xs leading-snug">{palette.carbonNote}</p>
            </div>
          </div>
        </>
      )}

      <button
        onClick={onBack}
        className="w-full mt-4 bg-[#5a3d1c] text-white font-serif font-bold py-4 rounded-xl"
      >
        CONFIRM
      </button>
    </div>
  );
};

export default SheepAvatarScreen;
