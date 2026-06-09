import React, { useState } from 'react';
import { Mail, Gift, Calendar, Shirt } from 'lucide-react';
import SheepAvatarScreen from './screens/SheepAvatarScreen';
import { useSavings } from '@/hooks/useSavings';

const HomeScreen: React.FC = () => {
  const [showAvatar, setShowAvatar] = useState(false);
  const { savings, pledged } = useSavings();

  if (showAvatar) {
    return <SheepAvatarScreen onBack={() => setShowAvatar(false)} />;
  }

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col">
      {/* Pill of icons */}
      <div className="pt-10 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-6 py-3 flex items-center gap-6 shadow-lg">
          <Mail className="h-7 w-7 text-white" strokeWidth={2.5} />
          <Gift className="h-7 w-7 text-white" strokeWidth={2.5} />
          <Calendar className="h-7 w-7 text-white" strokeWidth={2.5} />
          <button onClick={() => setShowAvatar(true)} aria-label="Customise sheep">
            <Shirt className="h-7 w-7 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Estimated savings card */}
      <div className="mx-4 mt-4 bg-[#1f1f1f] rounded-2xl p-5 text-white">
        <h2 className="font-serif font-bold text-xl text-center mb-3">Estimated Savings</h2>
        <div className="space-y-2 font-serif font-bold">
          <p className="flex items-center gap-2"><span className="text-yellow-400 text-xl">£</span> Money: £{savings.money}</p>
          <p className="flex items-center gap-2"><span className="text-red-400 text-sm font-mono">CO₂e</span> CO₂e: {savings.co2} kg</p>
          <p className="flex items-center gap-2"><span className="text-blue-400 text-xl">💧</span> Water: {savings.water}L</p>
          <p className="flex items-center gap-2 text-[#f5a623]"><span className="text-xl">✓</span> Pledges made: {pledged.length}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
