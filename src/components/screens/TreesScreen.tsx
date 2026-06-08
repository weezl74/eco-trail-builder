import React, { useState } from 'react';
import { ArrowLeft, TreePine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const top = [
  { pos: '#1', user: 'Rowan Adams', pts: 500 },
  { pos: '#2', user: 'Cwm Bakery', pts: 179 },
  { pos: '#3', user: 'Daniel Cooke', pts: 162 },
  { pos: '#4', user: 'Crafty Legs Events', pts: 117 },
  { pos: '#5', user: 'Josh', pts: 100 },
];

const TreesScreen: React.FC<{ onBack?: () => void; userPoints?: number }> = ({ onBack, userPoints = 0 }) => {
  const [planted, setPlanted] = useState(4);
  const { toast } = useToast();

  const join = () => {
    if (userPoints < 100) {
      toast({ title: 'Not enough points', description: '100 Tree Points required to join the queue.' });
      return;
    }
    setPlanted((p) => p + 1);
    toast({ title: 'Joined the Tree Queue!', description: 'A tree will be planted on your behalf.' });
  };

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="text-black mb-2 flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}
      <div className="text-center text-black font-serif font-bold">
        <p className="text-2xl">Estimated Offset</p>
        <p className="text-2xl">25,500 CO2e</p>
        <p className="text-2xl">KG</p>
      </div>

      <div className="bg-[#1f1f1f] rounded-2xl mt-4 overflow-hidden">
        <div className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 border-b border-white/20">
          <span>POSITION</span>
          <span>USER</span>
          <span>TREES POINTS</span>
        </div>
        {top.map((r) => (
          <div key={r.pos} className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 text-lg border-b border-white/10 last:border-0">
            <span>{r.pos}</span>
            <span>{r.user}</span>
            <span>{r.pts}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center my-6">
        <TreePine className="h-28 w-28 text-green-700" strokeWidth={1.5} />
      </div>

      <div className="bg-[#1f1f1f] rounded-2xl py-4 text-center text-white font-serif font-bold text-2xl mb-4">
        Trees you have planted: {planted}
      </div>

      <button
        onClick={join}
        className="w-full bg-[#1f1f1f] rounded-2xl py-5 text-white font-serif font-bold text-2xl active:scale-[0.99] transition"
      >
        Join the Tree Queue
        <p className="text-base font-normal mt-1">100 Points Required</p>
      </button>
    </div>
  );
};

export default TreesScreen;
