import React, { useEffect, useState } from 'react';
import { ArrowLeft, Filter, Sun, Wind, Droplet, Thermometer } from 'lucide-react';
import { useSavings, RenewableType, RENEWABLE_COSTS } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Category = 'libraries' | 'allotments' | 'leisure' | 'ev' | 'eco';
type Saving = { money: number; co2: number; water: number };

const CATEGORY_INFO: Record<
  Category,
  { label: string; color: string; message: string; delta: Saving }
> = {
  libraries: {
    label: 'Libraries',
    color: '#2563eb',
    message: 'Use your library and spare the carbon of buying new books!',
    delta: { money: 25, co2: 18, water: 40 },
  },
  allotments: {
    label: 'Allotments',
    color: '#16a34a',
    message: 'Grow your own veg here — cut food miles and packaging waste.',
    delta: { money: 35, co2: 22, water: 120 },
  },
  leisure: {
    label: 'Leisure Centres',
    color: '#9333ea',
    message: 'Walk your warm-up to our local leisure centres rather than go by car.',
    delta: { money: 12, co2: 9, water: 0 },
  },
  ev: {
    label: 'EV Chargepoints',
    color: '#0ea5e9',
    message: 'Charge your EV locally with low-carbon power and skip the petrol pump.',
    delta: { money: 20, co2: 28, water: 0 },
  },
  eco: {
    label: 'Eco-friendly Businesses',
    color: '#f59e0b',
    message: 'Invest your pound locally to keep supply-chain travel emissions low.',
    delta: { money: 18, co2: 14, water: 25 },
  },
};

const CATEGORIES = (Object.keys(CATEGORY_INFO) as Category[]).map((id) => ({
  id,
  ...CATEGORY_INFO[id],
}));

// Map DB `category` strings to our internal Category groups
const DB_CATEGORY_MAP: Record<string, Category> = {
  'Library': 'libraries',
  'Allotment': 'allotments',
  'Leisure Centre': 'leisure',
  'EV Charger': 'ev',
  'Refill Shop': 'eco',
  'Reuse Shop': 'eco',
  'Uniform Recycling': 'eco',
};

// Tightened to actual Caerphilly borough range from the seeded data
const BBOX = { minLng: -3.30, minLat: 51.55, maxLng: -3.05, maxLat: 51.72 };

type POI = {
  id: number;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  carbonAction: string | null;
};

const project = (lat: number, lng: number) => {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * 100;
  return { x, y };
};

const pinId = (p: { id: number; category: Category }) => `${p.category}:${p.id}`;

type Mode = 'local' | 'cool';

const RENEWABLE_META: Record<RenewableType, { label: string; color: string; icon: typeof Sun }> = {
  solar: { label: 'Solar Farm', color: '#fbbf24', icon: Sun },
  wind: { label: 'Wind Turbine', color: '#38bdf8', icon: Wind },
  mine_water: { label: 'Mine Water', color: '#a78bfa', icon: Droplet },
};

const ShopLocalScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('local');
  const [active, setActive] = useState<Set<Category>>(
    new Set(CATEGORIES.map((c) => c.id))
  );
  const [showFilter, setShowFilter] = useState(false);
  const [placing, setPlacing] = useState<RenewableType | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const { pledged, addPledge, renewables, woolPoints, buyRenewable } = useSavings();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('map_locations')
        .select('id, title, latitude, longitude, category, carbon_action');
      if (!mounted) return;
      if (error) {
        console.error('Failed to load map locations', error);
        return;
      }
      const mapped: POI[] = (data ?? [])
        .map((r) => {
          const cat = DB_CATEGORY_MAP[r.category ?? ''];
          if (!cat || r.latitude == null || r.longitude == null) return null;
          return {
            id: r.id,
            name: r.title,
            category: cat,
            lat: Number(r.latitude),
            lng: Number(r.longitude),
            carbonAction: r.carbon_action,
          } as POI;
        })
        .filter((p): p is POI => p !== null);
      setPois(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = (id: Category) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const visible = pois.filter((p) => active.has(p.category));

  const handlePledge = (p: POI) => {
    const info = CATEGORY_INFO[p.category];
    const id = pinId(p);
    const ok = addPledge(id, info.delta);
    if (ok) {
      toast({
        title: `Pledged: ${p.name}`,
        description: `${p.carbonAction ?? info.message} +£${info.delta.money} · ${info.delta.co2}kg CO₂e · ${info.delta.water}L · +25 wool`,
      });
    } else {
      toast({ title: 'Already pledged', description: p.name });
    }
  };


  // Cooling % from renewables placed
  const cooling = Math.min(95, renewables.length * 6);
  // Hue from red (0) -> blue (210), saturation eases as cooling rises
  const hue = (cooling / 100) * 210;
  const overlayColor = `hsla(${hue}, 75%, 50%, ${0.18 + (cooling / 100) * 0.22})`;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'cool' || !placing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const ok = buyRenewable(placing, x, y);
    if (ok) {
      toast({
        title: `${RENEWABLE_META[placing].label} placed`,
        description: `-${RENEWABLE_COSTS[placing]} wool · borough cooled by another 6%`,
      });
      setPlacing(null);
    } else {
      toast({
        title: 'Not enough wool',
        description: `${RENEWABLE_META[placing].label} costs ${RENEWABLE_COSTS[placing]} wool points.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-3 left-3 z-30 bg-white rounded-full p-2 shadow"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
      )}

      {/* Mode toggle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white rounded-full shadow flex p-1 font-serif font-bold text-sm">
        {(['local', 'cool'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setPlacing(null);
            }}
            className={`px-3 py-1.5 rounded-full transition ${
              mode === m ? 'bg-[#f5a623] text-black' : 'text-black/60'
            }`}
          >
            {m === 'local' ? 'Local Map' : 'Cool the Borough'}
          </button>
        ))}
      </div>

      {mode === 'local' && (
        <button
          onClick={() => setShowFilter((s) => !s)}
          className="absolute top-3 right-3 z-30 bg-white rounded-2xl px-4 py-2 shadow font-serif font-bold flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter ({active.size})
        </button>
      )}

      {mode === 'local' && showFilter && (
        <div className="absolute top-16 right-3 z-30 bg-white rounded-2xl shadow-lg p-3 w-64">
          {CATEGORIES.map((c) => (
            <label key={c.id} className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active.has(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span
                className="w-4 h-4 rounded-full border border-black/20"
                style={{ background: c.color }}
              />
              <span className="font-serif text-sm">{c.label}</span>
            </label>
          ))}
        </div>
      )}

      {mode === 'local' && (
        <div className="absolute bottom-28 left-3 z-20 bg-white/95 rounded-2xl shadow p-2 flex flex-wrap gap-2 max-w-[90%]">
          {CATEGORIES.filter((c) => active.has(c.id)).map((c) => (
            <div key={c.id} className="flex items-center gap-1 text-xs font-serif">
              <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
              {c.label}
            </div>
          ))}
        </div>
      )}

      {/* Cool mode HUD */}
      {mode === 'cool' && (
        <>
          {/* Thermometer */}
          <div className="absolute top-20 right-3 z-30 bg-white/95 rounded-2xl shadow p-3 flex flex-col items-center w-16">
            <Thermometer className="h-5 w-5 text-black mb-1" />
            <div className="relative w-3 h-40 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{
                  height: `${100 - cooling}%`,
                  background: `linear-gradient(to top, hsl(${210 - (100 - cooling) * 2.1}, 75%, 50%), hsl(0, 75%, 55%))`,
                }}
              />
            </div>
            <p className="text-[10px] font-serif font-bold mt-1 text-center leading-tight">
              {cooling}%<br/>cooler
            </p>
          </div>

          {/* Wool + buy bar */}
          <div className="absolute bottom-28 left-3 right-3 z-30 bg-white/95 rounded-2xl shadow p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-serif font-bold text-sm">Wool: {woolPoints}</p>
              <p className="font-serif text-xs opacity-70">
                {placing ? 'Tap the map to place' : 'Pick a renewable'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RENEWABLE_META) as RenewableType[]).map((t) => {
                const meta = RENEWABLE_META[t];
                const Icon = meta.icon;
                const cost = RENEWABLE_COSTS[t];
                const selected = placing === t;
                const afford = woolPoints >= cost;
                return (
                  <button
                    key={t}
                    onClick={() => setPlacing(selected ? null : t)}
                    disabled={!afford}
                    className={`rounded-xl p-2 font-serif text-xs flex flex-col items-center gap-1 border-2 transition ${
                      selected ? 'border-black bg-[#f5a623]' : 'border-transparent bg-gray-100'
                    } ${!afford ? 'opacity-40' : ''}`}
                  >
                    <Icon className="h-5 w-5" style={{ color: meta.color }} />
                    <span className="font-bold leading-tight text-center">{meta.label}</span>
                    <span>{cost} wool</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="relative w-full h-screen" onClick={handleMapClick}>
        <iframe
          title="Caerphilly area map"
          className="absolute inset-0 w-full h-full border-0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat}&layer=mapnik`}
          style={mode === 'cool' ? { pointerEvents: 'none' } : undefined}
        />

        {/* Warm→cool hue overlay (only in cool mode) */}
        {mode === 'cool' && (
          <div
            className="absolute inset-0 transition-colors duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 55%, ${overlayColor}, hsla(0, 70%, 50%, 0.25))`,
              mixBlendMode: 'multiply',
            }}
          />
        )}

        {/* Local pins */}
        {mode === 'local' && (
          <div className="absolute inset-0 pointer-events-none">
            {visible.map((p) => {
              const { x, y } = project(p.lat, p.lng);
              const info = CATEGORY_INFO[p.category];
              const id = pinId(p);
              const isPledged = pledged.includes(id);
              return (
                <div
                  key={id}
                  className="absolute -translate-x-1/2 -translate-y-full group pointer-events-auto"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <button
                    onClick={() => handlePledge(p)}
                    aria-label={`Pledge: ${p.name}`}
                    className="block"
                  >
                    <svg width="24" height="32" viewBox="0 0 22 30">
                      <path
                        d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z"
                        fill={info.color}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      {isPledged ? (
                        <g transform="translate(6,6)">
                          <circle cx="5" cy="5" r="5" fill="white" />
                          <path
                            d="M2.5 5.2 L4.3 7 L7.7 3.6"
                            stroke={info.color}
                            strokeWidth="1.6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      ) : (
                        <circle cx="11" cy="11" r="4" fill="white" />
                      )}
                    </svg>
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full w-56 bg-black/90 text-white text-[11px] font-serif px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-30">
                    <div className="font-bold mb-1">{p.name}</div>
                    <div>{info.message}</div>
                    <div className="mt-1 opacity-80">
                      {isPledged ? '✓ Pledged' : 'Tap to pledge'} · +£{info.delta.money} · {info.delta.co2}kg CO₂e · {info.delta.water}L
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Placed renewables (cool mode) */}
        {mode === 'cool' && (
          <div className="absolute inset-0 pointer-events-none">
            {renewables.map((r) => {
              const meta = RENEWABLE_META[r.type];
              const Icon = meta.icon;
              return (
                <div
                  key={r.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  title={meta.label}
                >
                  <div
                    className="rounded-full p-1.5 shadow-lg border-2 border-white"
                    style={{ background: meta.color }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopLocalScreen;
