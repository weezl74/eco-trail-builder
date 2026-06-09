import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';
import sheepAsset from '@/assets/sheep-avatar.jpg.asset.json';

type AccessoryId = 'sunglasses' | 'tophat' | 'uniform' | 'bowtie';
const ACCESSORIES: { id: AccessoryId; label: string; cost: number }[] = [
  { id: 'sunglasses', label: 'Sunglasses', cost: 40 },
  { id: 'tophat', label: 'Top Hat', cost: 60 },
  { id: 'uniform', label: 'Hi-Vis Uniform', cost: 80 },
  { id: 'bowtie', label: 'Bow Tie', cost: 30 },
];

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [customising, setCustomising] = useState(false);
  const { woolPoints, accessories, buyAccessory } = useSavings();

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
        <div className="relative w-72 h-72">
          <img
            src={sheepAsset.url}
            alt="Your sheep avatar"
            className={`w-full h-full object-contain select-none ${has('uniform') ? 'hue-rotate-[30deg] saturate-150' : ''}`}
            draggable={false}
          />
          {/* Sunglasses overlay (over the face) */}
          {has('sunglasses') && (
            <svg viewBox="0 0 200 240" className="absolute inset-0 w-full h-full pointer-events-none">
              <rect x="78" y="46" width="20" height="10" rx="2" fill="#000" />
              <rect x="102" y="46" width="20" height="10" rx="2" fill="#000" />
              <line x1="98" y1="51" x2="102" y2="51" stroke="#000" strokeWidth="2" />
            </svg>
          )}
          {/* Top hat overlay (above the head) */}
          {has('tophat') && (
            <svg viewBox="0 0 200 240" className="absolute inset-0 w-full h-full pointer-events-none">
              <rect x="80" y="0" width="40" height="20" fill="#1f1f1f" />
              <rect x="70" y="18" width="60" height="5" fill="#1f1f1f" />
              <rect x="80" y="6" width="40" height="3" fill="#8b0000" />
            </svg>
          )}
          {/* Bow tie overlay (under the chin) */}
          {has('bowtie') && (
            <svg viewBox="0 0 200 240" className="absolute inset-0 w-full h-full pointer-events-none">
              <g transform="translate(100,82)">
                <polygon points="-14,-6 0,0 -14,6" fill="#dc2626" />
                <polygon points="14,-6 0,0 14,6" fill="#dc2626" />
                <circle cx="0" cy="0" r="3" fill="#7a0d0d" />
              </g>
            </svg>
          )}
        </div>
      </div>

      {customising ? (
        <div className="bg-[#3a3a3a] rounded-2xl p-4">
          <p className="text-white font-serif font-bold text-sm mb-2">
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
