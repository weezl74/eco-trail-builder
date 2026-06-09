import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';
import sheepAsset from '@/assets/sheep-avatar.jpg.asset.json';

type AccessoryId = 'sunglasses' | 'tophat' | 'bowtie';
const ACCESSORIES: { id: AccessoryId; label: string; cost: number }[] = [
  { id: 'sunglasses', label: 'Sunglasses', cost: 40 },
  { id: 'tophat', label: 'Top Hat', cost: 60 },
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
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
          {/* Sunglasses overlay — sits across the eyes (face is small, top-centre) */}
          {has('sunglasses') && (
            <div
              className="absolute pointer-events-none flex items-center gap-[2%]"
              style={{ left: '40%', top: '15%', width: '20%' }}
            >
              <div className="flex-1 aspect-[2/1] rounded-sm bg-black" />
              <div className="flex-1 aspect-[2/1] rounded-sm bg-black" />
            </div>
          )}
          {/* Top hat overlay — sits above the head */}
          {has('tophat') && (
            <div
              className="absolute pointer-events-none"
              style={{ left: '42%', top: '2%', width: '16%' }}
            >
              <div className="h-6 bg-[#1f1f1f]">
                <div className="h-1 bg-[#8b0000] mt-2" />
              </div>
              <div className="h-1.5 bg-[#1f1f1f] -mx-2" />
            </div>
          )}
          {/* Bow tie overlay — sits under the chin */}
          {has('bowtie') && (
            <div
              className="absolute pointer-events-none"
              style={{ left: '44%', top: '24%', width: '12%' }}
            >
              <svg viewBox="0 0 40 20" className="w-full">
                <polygon points="0,2 20,10 0,18" fill="#dc2626" />
                <polygon points="40,2 20,10 40,18" fill="#dc2626" />
                <circle cx="20" cy="10" r="3" fill="#7a0d0d" />
              </svg>
            </div>
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
