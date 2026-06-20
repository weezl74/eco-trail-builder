import React from 'react';
import { ArrowLeft } from 'lucide-react';
import actLocal from '@/assets/svg/act-local.svg.asset.json';

interface Props {
  totalPoints: number;
  groupBoost?: number;
  onBack: () => void;
}

// Polyline waypoints across a stylised UK silhouette (viewBox 0 0 100 160)
// North Scotland (top) → Nelson, Caerphilly (south Wales)
const stops = [
  { name: 'North Scotland', x: 50, y: 12 },
  { name: 'Edinburgh', x: 52, y: 32 },
  { name: 'Lake District', x: 44, y: 52 },
  { name: 'Manchester', x: 48, y: 72 },
  { name: 'Birmingham', x: 48, y: 92 },
  { name: 'Cardiff', x: 36, y: 118 },
  { name: 'Nelson (home)', x: 36, y: 128 },
];

const MAX_POINTS = 5000;

const NelsonJourneyScreen: React.FC<Props> = ({ totalPoints, groupBoost = 0, onBack }) => {
  const effective = Math.min(MAX_POINTS, totalPoints + groupBoost);
  const t = effective / MAX_POINTS; // 0..1

  // Interpolate along polyline by cumulative arc length
  const segs = stops.slice(1).map((s, i) => {
    const a = stops[i];
    const d = Math.hypot(s.x - a.x, s.y - a.y);
    return { a, b: s, d };
  });
  const total = segs.reduce((s, x) => s + x.d, 0);
  let target = t * total;
  let nx = stops[0].x;
  let ny = stops[0].y;
  for (const seg of segs) {
    if (target <= seg.d) {
      const u = seg.d === 0 ? 0 : target / seg.d;
      nx = seg.a.x + (seg.b.x - seg.a.x) * u;
      ny = seg.a.y + (seg.b.y - seg.a.y) * u;
      break;
    }
    target -= seg.d;
    nx = seg.b.x;
    ny = seg.b.y;
  }

  const milesRemaining = Math.round((1 - t) * 600);
  const pointsToHome = Math.max(0, MAX_POINTS - totalPoints - groupBoost);

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-[#1f1f1f] text-white font-bold mb-4 px-4 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <div className="bg-[#1f1f1f] rounded-3xl p-5 text-white">
        <h1 className="font-serif font-bold text-2xl text-[#F4971D]">Bring Nelson Home</h1>
        <p className="text-sm text-white/80 mt-1">
          Climate change drove Nelson north. Earn points to bring him back to the Borough.
        </p>

        <div className="relative bg-[#2a2a2a] rounded-2xl mt-4 p-3 flex justify-center">
          <svg viewBox="0 0 100 160" className="w-full max-w-[280px] h-auto">
            {/* Stylised UK silhouette */}
            <path
              d="M50 5 C 60 8, 68 18, 64 30 C 70 35, 72 45, 66 55 C 72 65, 60 75, 58 85 C 64 95, 52 105, 50 115 C 55 125, 40 135, 36 138 C 30 138, 28 132, 32 125 C 28 118, 26 108, 34 100 C 28 92, 30 80, 38 72 C 32 62, 34 50, 42 42 C 36 32, 40 18, 50 5 Z"
              fill="#3a3a3a"
              stroke="#555"
              strokeWidth="0.6"
            />
            {/* Route */}
            <polyline
              points={stops.map((s) => `${s.x},${s.y}`).join(' ')}
              fill="none"
              stroke="#F4971D"
              strokeWidth="1.2"
              strokeDasharray="2 1.5"
              opacity="0.7"
            />
            {/* Stops */}
            {stops.map((s, i) => (
              <g key={s.name}>
                <circle cx={s.x} cy={s.y} r="1.6" fill={i === stops.length - 1 ? '#22c55e' : '#fff'} />
                <text x={s.x + 3} y={s.y + 1.2} fontSize="3" fill="#fff" opacity="0.7">
                  {s.name}
                </text>
              </g>
            ))}
            {/* Nelson marker */}
            <g transform={`translate(${nx}, ${ny})`}>
              <circle r="3.2" fill="#F4971D" stroke="#fff" strokeWidth="0.6" />
              <text x="0" y="1.1" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#1f1f1f">
                N
              </text>
            </g>
          </svg>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Journey home</span>
            <span className="font-bold text-[#F4971D]">{Math.round(t * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-[#F4971D] transition-all duration-700" style={{ width: `${t * 100}%` }} />
          </div>
          <div className="text-xs text-white/70 flex justify-between">
            <span>~{milesRemaining} miles to go</span>
            <span>{pointsToHome > 0 ? `${pointsToHome} pts to home` : 'Welcome home!'}</span>
          </div>
        </div>

        {groupBoost > 0 && (
          <div className="mt-4 bg-[#F4971D]/10 border border-[#F4971D]/40 rounded-xl p-3 text-sm">
            Your group is boosting Nelson by{' '}
            <span className="font-bold text-[#F4971D]">+{groupBoost}</span> points.
          </div>
        )}

        <p className="text-xs text-white/60 mt-4">
          Tip: join or create a Group from your Account to bring Nelson home faster.
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <img src={actLocal.url} alt="" className="w-20 h-20 opacity-70" />
      </div>
    </div>
  );
};

export default NelsonJourneyScreen;
