import React, { useState } from 'react';
import { ArrowLeft, MapPin, Users } from 'lucide-react';

type CP = {
  id: string;
  title: string;
  group: string;
  area: string;
  description: string;
  members: number;
  points: number;
  tag: string;
};

const PLEDGES: CP[] = [
  {
    id: 'litter-pick',
    title: 'Saturday Litter Pick',
    group: 'Caerphilly Tidy Streets',
    area: 'Caerphilly Town',
    description: 'Meet at the castle car park 10am every Saturday to clean up the high street and riverbanks.',
    members: 84,
    points: 75,
    tag: 'community',
  },
  {
    id: 'verge',
    title: 'Adopt a Verge',
    group: 'Bedwas Bee Friends',
    area: 'Bedwas',
    description: 'Adopt a roadside verge — leave it uncut May–September to support pollinators.',
    members: 32,
    points: 150,
    tag: 'biodiversity',
  },
  {
    id: 'lift-share',
    title: 'Work Lift Share',
    group: 'Ystrad Mynach Commuters',
    area: 'Ystrad Mynach',
    description: 'Share a lift to work with neighbours at least 2 days a week.',
    members: 57,
    points: 200,
    tag: 'transport',
  },
  {
    id: 'fix-it',
    title: 'Risca Fix-It Café',
    group: 'Risca Repair Crew',
    area: 'Risca',
    description: 'Bring broken kettles, toasters and bikes the first Sunday of every month — we fix them for free.',
    members: 41,
    points: 100,
    tag: 'waste',
  },
  {
    id: 'school-garden',
    title: 'School Veg Garden',
    group: 'Trinant Primary PTA',
    area: 'Trinant',
    description: 'Volunteer 1 hour a week to grow vegetables with the kids in the school garden.',
    members: 19,
    points: 120,
    tag: 'food',
  },
];

const CommunityPledgesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [joined, setJoined] = useState<Record<string, boolean>>({ 'litter-pick': true });

  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {onBack && (
        <button onClick={onBack} className="mb-3 text-black flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      )}

      <h1 className="font-serif font-bold text-3xl text-black text-center mb-1">Community Pledges</h1>
      <p className="font-serif text-center text-black/80 mb-4 text-sm">Real things, real neighbours, near you.</p>

      <div className="space-y-4">
        {PLEDGES.map((p) => (
          <div key={p.id} className="bg-[#1f1f1f] rounded-2xl p-5 text-white">
            <h3 className="font-serif font-bold text-2xl">{p.title}</h3>
            <p className="font-serif text-sm opacity-80 mt-1">by {p.group}</p>
            <p className="font-serif text-sm mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {p.area}
            </p>
            <p className="font-serif mt-2 text-sm">{p.description}</p>

            <div className="flex items-center justify-between mt-4">
              <span className="flex items-center gap-1 text-sm font-serif">
                <Users className="h-4 w-4" /> {p.members + (joined[p.id] ? 1 : 0)} members
              </span>
              <button
                onClick={() => setJoined((s) => ({ ...s, [p.id]: !s[p.id] }))}
                className={`px-5 py-2 rounded-lg font-serif font-bold ${joined[p.id] ? 'bg-[#555]' : 'bg-[#f5a623] text-black'}`}
              >
                {joined[p.id] ? 'Joined' : 'Join'}
              </button>
            </div>

            <div className="flex justify-between mt-3">
              <span className="bg-blue-500 text-white text-xs font-serif rounded-md px-3 py-1">{p.tag}</span>
              <span className="text-xs font-serif opacity-80">🟢 {p.points} Wool Points / month</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPledgesScreen;
