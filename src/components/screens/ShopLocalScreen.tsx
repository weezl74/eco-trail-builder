import React, { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';

type Category = 'libraries' | 'allotments' | 'leisure' | 'ev' | 'eco';

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'libraries', label: 'Libraries', color: '#2563eb' },
  { id: 'allotments', label: 'Allotments', color: '#16a34a' },
  { id: 'leisure', label: 'Leisure Centres', color: '#9333ea' },
  { id: 'ev', label: 'EV Chargepoints', color: '#0ea5e9' },
  { id: 'eco', label: 'Eco-friendly Businesses', color: '#f59e0b' },
];

// Map bbox used by the OSM iframe
const BBOX = { minLng: -3.45, minLat: 51.50, maxLng: -2.90, maxLat: 51.90 };

// Sample POIs across Caerphilly County Borough
const POIS: { name: string; category: Category; lat: number; lng: number }[] = [
  // Libraries
  { name: 'Caerphilly Library', category: 'libraries', lat: 51.5778, lng: -3.2186 },
  { name: 'Bargoed Library', category: 'libraries', lat: 51.6936, lng: -3.2419 },
  { name: 'Blackwood Library', category: 'libraries', lat: 51.6700, lng: -3.1950 },
  { name: 'Risca Library', category: 'libraries', lat: 51.6100, lng: -3.0950 },
  { name: 'Ystrad Mynach Library', category: 'libraries', lat: 51.6450, lng: -3.2350 },
  // Allotments
  { name: 'Virginia Park Allotments', category: 'allotments', lat: 51.5820, lng: -3.2250 },
  { name: 'Trecenydd Allotments', category: 'allotments', lat: 51.5860, lng: -3.2400 },
  { name: 'Pontllanfraith Allotments', category: 'allotments', lat: 51.6650, lng: -3.1700 },
  { name: 'Bedwas Allotments', category: 'allotments', lat: 51.5900, lng: -3.1900 },
  // Leisure
  { name: 'Caerphilly Leisure Centre', category: 'leisure', lat: 51.5760, lng: -3.2150 },
  { name: 'Newbridge Leisure Centre', category: 'leisure', lat: 51.6700, lng: -3.1450 },
  { name: 'Heolddu Leisure Centre', category: 'leisure', lat: 51.6950, lng: -3.2480 },
  { name: 'Risca Leisure Centre', category: 'leisure', lat: 51.6080, lng: -3.0980 },
  // EV
  { name: 'Crossways Car Park EV', category: 'ev', lat: 51.5790, lng: -3.2200 },
  { name: 'Blackwood EV Hub', category: 'ev', lat: 51.6720, lng: -3.1930 },
  { name: 'Bargoed EV Point', category: 'ev', lat: 51.6940, lng: -3.2400 },
  { name: 'Penallta House EV', category: 'ev', lat: 51.6480, lng: -3.2300 },
  { name: 'Risca EV Point', category: 'ev', lat: 51.6110, lng: -3.0960 },
  // Eco businesses
  { name: 'The Green Grocer', category: 'eco', lat: 51.5800, lng: -3.2170 },
  { name: 'Refill Caerphilly', category: 'eco', lat: 51.5775, lng: -3.2195 },
  { name: 'Eco Café Blackwood', category: 'eco', lat: 51.6705, lng: -3.1960 },
  { name: 'Zero Waste Bargoed', category: 'eco', lat: 51.6930, lng: -3.2410 },
];

const project = (lat: number, lng: number) => {
  const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
  const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * 100;
  return { x, y };
};

const ShopLocalScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [active, setActive] = useState<Set<Category>>(
    new Set(CATEGORIES.map((c) => c.id))
  );
  const [showFilter, setShowFilter] = useState(false);

  const toggle = (id: Category) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const visible = POIS.filter((p) => active.has(p.category));

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-3 left-3 z-20 bg-white rounded-full p-2 shadow"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
      )}

      <button
        onClick={() => setShowFilter((s) => !s)}
        className="absolute top-3 right-3 z-20 bg-white rounded-2xl px-4 py-2 shadow font-serif font-bold flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filter ({active.size})
      </button>

      {showFilter && (
        <div className="absolute top-16 right-3 z-20 bg-white rounded-2xl shadow-lg p-3 w-64">
          {CATEGORIES.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
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

      {/* Legend */}
      <div className="absolute bottom-28 left-3 z-20 bg-white/95 rounded-2xl shadow p-2 flex flex-wrap gap-2 max-w-[90%]">
        {CATEGORIES.filter((c) => active.has(c.id)).map((c) => (
          <div key={c.id} className="flex items-center gap-1 text-xs font-serif">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: c.color }}
            />
            {c.label}
          </div>
        ))}
      </div>

      <div className="relative w-full h-screen">
        <iframe
          title="Caerphilly area map"
          className="absolute inset-0 w-full h-full border-0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX.minLng},${BBOX.minLat},${BBOX.maxLng},${BBOX.maxLat}&layer=mapnik`}
        />
        {/* Pin overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {visible.map((p) => {
            const { x, y } = project(p.lat, p.lng);
            const color = CATEGORIES.find((c) => c.id === p.category)!.color;
            return (
              <div
                key={`${p.name}-${p.category}`}
                className="absolute -translate-x-1/2 -translate-y-full group pointer-events-auto"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={p.name}
              >
                <svg width="22" height="30" viewBox="0 0 22 30">
                  <path
                    d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="11" cy="11" r="4" fill="white" />
                </svg>
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopLocalScreen;
