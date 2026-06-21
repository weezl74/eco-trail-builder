import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Wind, Sun, Thermometer, Droplet, Factory, Home, X, MapPin } from 'lucide-react';
import TechRewardDialog from './TechRewardDialog';
import NelsonJourneyScreen from './screens/NelsonJourneyScreen';
import actLocal from '@/assets/svg/act-local.svg.asset.json';

export interface UserRenewable {
  id: string;
  technology_type: string;
  points_cost: number;
  position_x?: number | null;
  position_y?: number | null;
}

interface CaerphillyMapProps {
  userRenewables: UserRenewable[];
  totalPoints: number;
  currentFootprint: number;
  groupBoost?: number;
  /** Persist a placement: returns once saved. */
  onPlaceRenewable?: (renewableId: string, x: number, y: number) => Promise<void> | void;
}

const TECH_META: Record<
  string,
  { name: string; icon: React.ReactNode; explanation: string; stars: number; colour: string }
> = {
  solar: {
    name: 'Solar Panels',
    icon: <Sun className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Solar panels convert sunlight straight into electricity, displacing fossil-fuel power and cutting carbon at the source.',
    stars: 2,
    colour: '#fbbf24',
  },
  solar_battery: {
    name: 'Solar + Battery',
    icon: <Sun className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Pairing solar with storage means clean power day and night — pushing fossil fuels off the grid even after sunset.',
    stars: 3,
    colour: '#f59e0b',
  },
  heat_pump: {
    name: 'Heat Pump',
    icon: <Thermometer className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Heat pumps move heat with electricity instead of burning gas, slashing home heating emissions by up to 70%.',
    stars: 2,
    colour: '#60a5fa',
  },
  wind_turbine: {
    name: 'Small Wind Turbine',
    icon: <Wind className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'A small turbine harvests Caerphilly’s hillside winds, producing zero-carbon electricity for your home.',
    stars: 2,
    colour: '#22d3ee',
  },
  wind_municipal: {
    name: 'Community Wind',
    icon: <Wind className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'A shared community turbine powers many homes at once — multiplying climate impact and keeping value local.',
    stars: 3,
    colour: '#0ea5e9',
  },
  green_hydrogen: {
    name: 'Green Hydrogen',
    icon: <Droplet className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Hydrogen made with renewable electricity can decarbonise transport and heavy industry where batteries fall short.',
    stars: 3,
    colour: '#34d399',
  },
  mine_water: {
    name: 'Mine Water Heat',
    icon: <Factory className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Warm water sitting in old coal mines is pumped up to heat homes — turning the borough’s mining heritage into a climate solution.',
    stars: 3,
    colour: '#a78bfa',
  },
  sles: {
    name: 'Smart Local Energy',
    icon: <Home className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'A smart local energy system matches generation and demand street-by-street, squeezing more carbon out of every kWh.',
    stars: 2,
    colour: '#f472b6',
  },
  ccus: {
    name: 'Carbon Capture',
    icon: <Factory className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Carbon capture pulls CO₂ from flue gas or even the air and stores or reuses it, undoing emissions we can’t yet avoid.',
    stars: 3,
    colour: '#94a3b8',
  },
  tree_planting: {
    name: 'Tree Planting',
    icon: <Wind className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'Trees lock carbon into wood and soil, cool the air, and bring shade to overheated streets.',
    stars: 2,
    colour: '#16a34a',
  },
  green_roof: {
    name: 'Green Roof',
    icon: <Home className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation:
      'A planted roof insulates buildings, reduces flooding and lowers the urban heat-island effect.',
    stars: 1,
    colour: '#65a30d',
  },
};

const getMeta = (t: string) =>
  TECH_META[t] || {
    name: t,
    icon: <Zap className="w-5 h-5 text-white" strokeWidth={1.5} />,
    explanation: 'Renewable technology helps combat climate change by cutting carbon emissions.',
    stars: 1,
    colour: '#F4971D',
  };

const CaerphillyMap: React.FC<CaerphillyMapProps> = ({
  userRenewables,
  totalPoints,
  currentFootprint,
  groupBoost = 0,
  onPlaceRenewable,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showJourney, setShowJourney] = useState(false);
  const [reward, setReward] = useState<{ name: string; explanation: string; stars: number } | null>(null);

  // First unplaced renewable (no x/y) is awaiting placement
  const pending = userRenewables.find((r) => r.position_x == null || r.position_y == null);
  const placed = userRenewables.filter((r) => r.position_x != null && r.position_y != null);

  const renewableCount = userRenewables.length;
  const warmingReduction = Math.min(renewableCount * 10, 80);

  const boroughAreas = [
    { name: 'Caerphilly Town', x: 45, y: 35, size: 'large' as const },
    { name: 'Blackwood', x: 25, y: 65, size: 'medium' as const },
    { name: 'Risca', x: 15, y: 45, size: 'medium' as const },
    { name: 'Bargoed', x: 60, y: 25, size: 'medium' as const },
    { name: 'Ystrad Mynach', x: 35, y: 50, size: 'medium' as const },
    { name: 'Nelson', x: 50, y: 60, size: 'small' as const },
    { name: 'Llanbradach', x: 40, y: 40, size: 'small' as const },
    { name: 'Bedwas', x: 35, y: 35, size: 'small' as const },
    { name: 'Rhymney', x: 70, y: 15, size: 'small' as const },
    { name: 'New Tredegar', x: 75, y: 35, size: 'small' as const },
    { name: 'Abertridwr', x: 30, y: 30, size: 'small' as const },
    { name: 'Senghenydd', x: 40, y: 25, size: 'small' as const },
  ];

  const getAreaColor = (baseWarmth: number) => {
    const c = Math.max(0, baseWarmth - warmingReduction);
    if (c > 70) return 'bg-red-500';
    if (c > 50) return 'bg-orange-500';
    if (c > 30) return 'bg-yellow-500';
    if (c > 15) return 'bg-green-300';
    return 'bg-green-500';
  };

  // Local cooling: each placed renewable cools its surroundings (radius in %).
  const COOL_RADIUS = 22;
  const COOL_STRENGTH = 28;
  const localCooling = (ax: number, ay: number) => {
    let cool = 0;
    placed.forEach((r) => {
      const dx = (r.position_x as number) - ax;
      const dy = (r.position_y as number) - ay;
      const dist = Math.hypot(dx, dy);
      if (dist < COOL_RADIUS) {
        cool += COOL_STRENGTH * (1 - dist / COOL_RADIUS);
      }
    });
    return cool;
  };

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pending || !onPlaceRenewable || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    await onPlaceRenewable(pending.id, x, y);
    const meta = getMeta(pending.technology_type);
    setReward({ name: meta.name, explanation: meta.explanation, stars: meta.stars });
  };

  if (showJourney) {
    return (
      <NelsonJourneyScreen
        totalPoints={totalPoints}
        groupBoost={groupBoost}
        onBack={() => setShowJourney(false)}
      />
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Cool the Borough</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {[
              ['Hot', 'bg-red-500'],
              ['Warm', 'bg-orange-500'],
              ['Mild', 'bg-yellow-500'],
              ['Cool', 'bg-green-300'],
              ['Cold', 'bg-green-500'],
            ].map(([label, cls]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${cls} rounded`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {pending && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#F4971D]/15 border border-[#F4971D]/40 text-[#F4971D] text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tap the map to place your new <strong className="mx-1">{getMeta(pending.technology_type).name}</strong>
          </div>
        )}

        {/* Interactive Map */}
        <div
          ref={mapRef}
          onClick={handleMapClick}
          className={`relative w-full h-96 bg-slate-900 rounded-lg border border-slate-600 overflow-hidden ${
            pending ? 'cursor-crosshair ring-2 ring-[#F4971D]' : ''
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 opacity-30" />

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M22,8 L28,6 L35,7 L42,9 L48,11 L55,13 L62,15 L68,17 L74,20 L79,24 L83,29 L86,35 L87,42 L86,49 L84,56 L81,62 L77,67 L72,71 L66,74 L59,76 L52,77 L45,76 L38,74 L32,71 L27,67 L23,62 L20,56 L18,49 L18,42 L19,35 L21,28 L22,21 L22,15 Z"
              fill="none"
              stroke="rgb(156 163 175 / 0.5)"
              strokeWidth="0.8"
            />
          </svg>

          {/* Borough areas */}
          {boroughAreas.map((area) => {
            const baseWarmth = 80 - totalPoints / 20;
            const areaWarmth = Math.max(10, baseWarmth - localCooling(area.x, area.y));
            return (
              <div
                key={area.name}
                className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ${getAreaColor(areaWarmth)} ${
                  area.size === 'large' ? 'w-8 h-8' : area.size === 'medium' ? 'w-6 h-6' : 'w-4 h-4'
                }`}
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  boxShadow: `0 0 ${area.size === 'large' ? '12px' : area.size === 'medium' ? '8px' : '4px'} rgba(255,255,255,0.2)`,
                  opacity: 0.55,
                }}
                title={area.name}
              />
            );
          })}

          {/* Placed renewables — high-contrast, labelled, clickable for info */}
          {placed.map((r) => {
            const meta = getMeta(r.technology_type);
            return (
              <button
                key={r.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReward({ name: meta.name, explanation: meta.explanation, stars: meta.stars });
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                style={{ left: `${r.position_x}%`, top: `${r.position_y}%` }}
                aria-label={`${meta.name} info`}
              >
                <div
                  className="rounded-full p-2 border-2 border-white shadow-lg"
                  style={{ backgroundColor: meta.colour }}
                  title={meta.name}
                >
                  {meta.icon}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-white bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {meta.name}
                </div>
              </button>
            );
          })}

          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-20 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex justify-between items-center text-sm text-white mb-2">
                <span>Borough Cooling Progress</span>
                <span>{warmingReduction}% Cooled</span>
              </div>
              <div className="w-full bg-red-900 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${warmingReduction}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nelson "bring him home" button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowJourney(true);
            }}
            className="absolute bottom-3 right-3 z-30 w-14 h-14 rounded-full bg-[#F4971D] shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-transform"
            title="Bring Nelson home"
            aria-label="Bring Nelson home"
          >
            <img src={actLocal.url} alt="" className="w-10 h-10" />
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{userRenewables.length}</div>
            <div className="text-xs text-slate-400">Renewables Installed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalPoints}</div>
            <div className="text-xs text-slate-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{Math.round(warmingReduction)}%</div>
            <div className="text-xs text-slate-400">Cooling Impact</div>
          </div>
        </div>

        <TechRewardDialog
          open={!!reward}
          onClose={() => setReward(null)}
          techName={reward?.name || ''}
          explanation={reward?.explanation || ''}
          stars={reward?.stars || 1}
        />
      </CardContent>
    </Card>
  );
};

export default CaerphillyMap;
