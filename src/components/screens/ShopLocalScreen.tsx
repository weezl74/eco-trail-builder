import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const ShopLocalScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [visited] = useState(0);
  const total = 15;
  const pct = Math.round((visited / total) * 100);

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-3 left-3 z-10 bg-white rounded-full p-2 shadow"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
      )}

      <div className="absolute top-3 left-14 right-3 z-10 bg-[#1f1f1f] text-white rounded-2xl p-4 shadow-lg">
        <p className="font-serif font-bold leading-snug">
          Visit our Carbon-friendly local businesses to make your money work for the planet, and earn Tree Points!
        </p>
        <p className="font-serif text-sm mt-2 opacity-80">{visited} / {total} locations visited</p>
        <div className="w-full h-1.5 bg-white/30 rounded-full mt-2 relative">
          <div className="absolute left-0 top-0 h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-xs opacity-70 mt-1">{pct}%</p>
      </div>

      <div className="absolute top-44 left-3 z-10 bg-white rounded-2xl px-4 py-2 shadow font-serif font-bold">
        Filter (5)
      </div>

      <iframe
        title="Caerphilly area map"
        className="w-full h-screen border-0"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-3.45,51.50,-2.90,51.90&layer=mapnik"
      />
    </div>
  );
};

export default ShopLocalScreen;
