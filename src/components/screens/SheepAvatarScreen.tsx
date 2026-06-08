import React, { useState } from 'react';
import { ArrowLeft, PaintBucket } from 'lucide-react';

const swatches = [
  '#f8efd9', '#ffd8a8', '#ffb3b3', '#b8e0d2',
  '#a8d5ff', '#c5b3ff', '#ffc1e0', '#dcdcdc',
];

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [customising, setCustomising] = useState(false);
  const [color, setColor] = useState('#f8efd9');

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4 flex flex-col">
      {onBack && (
        <button onClick={onBack} className="text-black flex items-center gap-1 font-serif font-bold mb-2">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}

      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 200 220" className="w-72 h-72">
          {/* legs */}
          <rect x="60" y="170" width="22" height="40" rx="10" fill="#d6b48c" />
          <rect x="118" y="170" width="22" height="40" rx="10" fill="#d6b48c" />
          {/* body wool */}
          <circle cx="100" cy="120" r="78" fill={color} stroke="#7a4a25" strokeWidth="4" />
          {/* head */}
          <circle cx="100" cy="55" r="35" fill={color} stroke="#7a4a25" strokeWidth="4" />
          {/* horns */}
          <path d="M70 45 q-15 0 -10 20 q15 -2 18 -15z" fill="#c9a173" stroke="#7a4a25" strokeWidth="3" />
          <path d="M130 45 q15 0 10 20 q-15 -2 -18 -15z" fill="#c9a173" stroke="#7a4a25" strokeWidth="3" />
          {/* eyes */}
          <circle cx="90" cy="55" r="3" fill="#000" />
          <circle cx="110" cy="55" r="3" fill="#000" />
          {/* smile */}
          <path d="M90 70 q10 10 20 0" stroke="#000" strokeWidth="2" fill="none" />
          {/* belly markings */}
          <rect x="80" y="115" width="14" height="40" rx="7" fill="#d6b48c" opacity="0.6" />
          <rect x="106" y="115" width="14" height="40" rx="7" fill="#d6b48c" opacity="0.6" />
        </svg>
      </div>

      {customising ? (
        <div className="bg-[#3a3a3a] rounded-2xl p-4 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3a3a3a] rounded-t-lg px-3 py-1">
            <PaintBucket className="h-5 w-5 text-white" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {swatches.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-full aspect-square rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
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
