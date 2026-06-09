import React, { useState } from 'react';
import { ArrowLeft, PaintBucket, Lock } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';

const swatches = [
  '#f8efd9', '#ffd8a8', '#ffb3b3', '#b8e0d2',
  '#a8d5ff', '#c5b3ff', '#ffc1e0', '#dcdcdc',
];

type AccessoryId = 'sunglasses' | 'tophat' | 'uniform' | 'bowtie';
const ACCESSORIES: { id: AccessoryId; label: string; cost: number }[] = [
  { id: 'sunglasses', label: 'Sunglasses', cost: 40 },
  { id: 'tophat', label: 'Top Hat', cost: 60 },
  { id: 'uniform', label: 'Hi-Vis Uniform', cost: 80 },
  { id: 'bowtie', label: 'Bow Tie', cost: 30 },
];

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [customising, setCustomising] = useState(false);
  const [color, setColor] = useState<string>(() => {
    if (typeof window === 'undefined') return '#f8efd9';
    return localStorage.getItem('sheep_avatar_color') || '#f8efd9';
  });
  const { woolPoints, accessories, buyAccessory } = useSavings();

  const saveColor = (c: string) => {
    setColor(c);
    try { localStorage.setItem('sheep_avatar_color', c); } catch {}
  };

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
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4 flex flex-col">
      {onBack && (
        <button onClick={onBack} className="text-black flex items-center gap-1 font-serif font-bold mb-2">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}

      <div className="text-center font-serif font-bold text-black mb-2">
        Wool Points: {woolPoints}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 200 240" className="w-72 h-72">
          {/* legs */}
          <rect x="60" y="170" width="22" height="40" rx="10" fill={has('uniform') ? '#fde047' : '#d6b48c'} />
          <rect x="118" y="170" width="22" height="40" rx="10" fill={has('uniform') ? '#fde047' : '#d6b48c'} />
          {/* body wool */}
          <circle cx="100" cy="120" r="78" fill={has('uniform') ? '#fde047' : color} stroke="#7a4a25" strokeWidth="4" />
          {/* head */}
          <circle cx="100" cy="55" r="35" fill={color} stroke="#7a4a25" strokeWidth="4" />
          {/* horns */}
          <path d="M70 45 q-15 0 -10 20 q15 -2 18 -15z" fill="#c9a173" stroke="#7a4a25" strokeWidth="3" />
          <path d="M130 45 q15 0 10 20 q-15 -2 -18 -15z" fill="#c9a173" stroke="#7a4a25" strokeWidth="3" />
          {/* eyes */}
          {has('sunglasses') ? (
            <g>
              <rect x="80" y="50" width="18" height="10" rx="2" fill="#000" />
              <rect x="102" y="50" width="18" height="10" rx="2" fill="#000" />
              <line x1="98" y1="55" x2="102" y2="55" stroke="#000" strokeWidth="2" />
            </g>
          ) : (
            <>
              <circle cx="90" cy="55" r="3" fill="#000" />
              <circle cx="110" cy="55" r="3" fill="#000" />
            </>
          )}
          {/* smile */}
          <path d="M90 70 q10 10 20 0" stroke="#000" strokeWidth="2" fill="none" />
          {/* top hat */}
          {has('tophat') && (
            <g>
              <rect x="78" y="10" width="44" height="22" fill="#1f1f1f" />
              <rect x="68" y="30" width="64" height="5" fill="#1f1f1f" />
              <rect x="78" y="18" width="44" height="3" fill="#8b0000" />
            </g>
          )}
          {/* bow tie */}
          {has('bowtie') && (
            <g transform="translate(100,90)">
              <polygon points="-14,-6 0,0 -14,6" fill="#dc2626" />
              <polygon points="14,-6 0,0 14,6" fill="#dc2626" />
              <circle cx="0" cy="0" r="3" fill="#7a0d0d" />
            </g>
          )}
          {/* belly markings */}
          <rect x="80" y="115" width="14" height="40" rx="7" fill="#d6b48c" opacity="0.5" />
          <rect x="106" y="115" width="14" height="40" rx="7" fill="#d6b48c" opacity="0.5" />
        </svg>
      </div>

      {customising ? (
        <div className="bg-[#3a3a3a] rounded-2xl p-4 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3a3a3a] rounded-t-lg px-3 py-1">
            <PaintBucket className="h-5 w-5 text-white" />
          </div>
          <p className="text-white font-serif font-bold text-sm mb-2">Wool colour</p>
          <div className="grid grid-cols-4 gap-3">
            {swatches.map((c) => (
              <button
                key={c}
                onClick={() => saveColor(c)}
                className={`w-full aspect-square rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <p className="text-white font-serif font-bold text-sm mt-4 mb-2">
            Accessories ({woolPoints} wool)
          </p>
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
                    owned ? 'bg-[#f5a623] text-black' : afford ? 'bg-white text-black' : 'bg-white/30 text-white'
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

          <button
            onClick={() => setCustomising(false)}
            className="w-full mt-4 bg-[#f5a623] text-white font-serif font-bold py-3 rounded-xl"
          >
            Confirm
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setCustomising(true)}
            className="w-full bg-[#3a3a3a] text-white font-serif font-bold py-4 rounded-xl"
          >
            Customise Sheep
          </button>
          <button
            onClick={onBack}
            className="w-full bg-[#5a3d1c] text-white font-serif font-bold py-4 rounded-xl"
          >
            CONFIRM
          </button>
        </div>
      )}
    </div>
  );
};

export default SheepAvatarScreen;
