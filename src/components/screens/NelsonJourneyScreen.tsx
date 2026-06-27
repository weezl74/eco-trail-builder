import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft } from 'lucide-react';
import actLocal from '@/assets/svg/act-local.svg.asset.json';

interface Props {
  totalPoints: number;
  groupBoost?: number;
  onBack: () => void;
}

// Climate refuge → home. Nelson village, Caerphilly.
const START: [number, number] = [58.0, -4.5];   // Far north of Scotland
const HOME: [number, number] = [51.6906, -3.2663]; // Nelson, Caerphilly

const MAX_POINTS = 5000;

const NelsonJourneyScreen: React.FC<Props> = ({ totalPoints, groupBoost = 0, onBack }) => {
  const effective = Math.min(MAX_POINTS, totalPoints + groupBoost);
  const t = effective / MAX_POINTS; // 0..1


  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const traveledLineRef = useRef<L.Polyline | null>(null);
  const remainingLineRef = useRef<L.Polyline | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);

  // Fetch a realistic driving route. Try multiple OSRM mirrors; if all fail,
  // fall back to a hand-curved path that hugs the western UK road corridor
  // (M74 → M6 → M5 → M50 → A465) instead of a straight line.
  useEffect(() => {
    let cancelled = false;
    const mirrors = [
      `https://router.project-osrm.org/route/v1/driving/${START[1]},${START[0]};${HOME[1]},${HOME[0]}?overview=full&geometries=geojson`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${START[1]},${START[0]};${HOME[1]},${HOME[0]}?overview=full&geometries=geojson`,
    ];
    (async () => {
      for (const url of mirrors) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const coords: [number, number][] = json?.routes?.[0]?.geometry?.coordinates?.map(
            (c: [number, number]) => [c[1], c[0]],
          );
          if (!cancelled && coords?.length) {
            setRoute(coords);
            return;
          }
        } catch {
          /* try next mirror */
        }
      }
      // Fallback: approximate UK west-coast motorway corridor.
      if (!cancelled) {
        setRoute([
          START,
          [57.4, -4.2],   // Inverness
          [56.8, -4.0],   // Cairngorms
          [56.1, -3.95],  // Stirling
          [55.86, -4.25], // Glasgow
          [55.0, -3.6],   // Gretna / M74
          [54.32, -2.74], // Tebay (M6)
          [53.48, -2.24], // Manchester
          [52.48, -1.9],  // Birmingham
          [52.0, -2.2],   // Worcester
          [51.83, -2.78], // Ross-on-Wye
          [51.78, -3.2],  // Brecon Beacons
          HOME,
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
    });
    // Focus on Scotland where Nelson started — closer view, not the whole UK.
    map.setView(START, 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Starting point pin (where Nelson fled to)
    const startIcon = L.divIcon({
      className: '',
      html: `<div style="transform:translate(-50%,-100%);">
        <svg width="22" height="30" viewBox="0 0 22 30"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z" fill="#4C1D95" stroke="white" stroke-width="1.5"/><circle cx="11" cy="11" r="4" fill="white"/></svg>
      </div>`,
      iconSize: [22, 30],
      iconAnchor: [11, 30],
    });
    L.marker(START, { icon: startIcon }).addTo(map).bindPopup('Start — Scottish Highlands');

    const homeIcon = L.divIcon({
      className: '',
      html: `<div style="transform:translate(-50%,-100%);">
        <svg width="22" height="30" viewBox="0 0 22 30"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z" fill="#22c55e" stroke="white" stroke-width="1.5"/><circle cx="11" cy="11" r="4" fill="white"/></svg>
      </div>`,
      iconSize: [22, 30],
      iconAnchor: [11, 30],
    });
    L.marker(HOME, { icon: homeIcon }).addTo(map).bindPopup('Nelson, Caerphilly — home');

    mapRef.current = map;

    // Container often has 0 size on first paint inside flex/scroll layouts —
    // force Leaflet to re-measure so tiles actually get requested.
    const sizers = [60, 250, 600, 1200].map((ms) =>
      setTimeout(() => map.invalidateSize(), ms),
    );

    return () => {
      sizers.forEach(clearTimeout);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position Nelson along the real route (or straight-line fallback) by progress t.
  const path: [number, number][] = route ?? [START, HOME];
  const segLengths = path.slice(1).map((p, i) => {
    const a = path[i];
    return Math.hypot(p[0] - a[0], p[1] - a[1]);
  });
  const totalLen = segLengths.reduce((s, n) => s + n, 0) || 1;
  let target = totalLen * t;
  let nelsonLat = path[0][0];
  let nelsonLng = path[0][1];
  let splitIndex = 0; // last full path point already traversed
  for (let i = 0; i < segLengths.length; i++) {
    if (target <= segLengths[i]) {
      const f = segLengths[i] === 0 ? 0 : target / segLengths[i];
      nelsonLat = path[i][0] + (path[i + 1][0] - path[i][0]) * f;
      nelsonLng = path[i][1] + (path[i + 1][1] - path[i][1]) * f;
      splitIndex = i;
      break;
    }
    target -= segLengths[i];
    nelsonLat = path[i + 1][0];
    nelsonLng = path[i + 1][1];
    splitIndex = i + 1;
  }

  // Draw / update the two journey polylines (traveled vs remaining).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    traveledLineRef.current?.remove();
    remainingLineRef.current?.remove();

    const here: [number, number] = [nelsonLat, nelsonLng];
    const traveled: [number, number][] = [...path.slice(0, splitIndex + 1), here];
    const remaining: [number, number][] = [here, ...path.slice(splitIndex + 1)];

    traveledLineRef.current = L.polyline(traveled, {
      color: '#4C1D95', // dark purple — journey to date
      weight: 4,
      dashArray: '6 8',
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    remainingLineRef.current = L.polyline(remaining, {
      color: '#F4971D', // orange — where he's going next
      weight: 4,
      dashArray: '2 8',
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);
  }, [route, nelsonLat, nelsonLng, splitIndex, path]);

  // Update / animate Nelson's pin as points / route change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const nelsonIcon = L.divIcon({
      className: '',
      html: `<div style="transform:translate(-50%,-100%);">
        <svg width="28" height="36" viewBox="0 0 22 30"><path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z" fill="#F4971D" stroke="white" stroke-width="1.6"/><text x="11" y="14" text-anchor="middle" font-size="9" font-weight="700" fill="#1f1f1f" font-family="Georgia, serif">N</text></svg>
      </div>`,
      iconSize: [28, 36],
      iconAnchor: [14, 36],
    });
    if (!markerRef.current) {
      markerRef.current = L.marker([nelsonLat, nelsonLng], { icon: nelsonIcon })
        .addTo(map)
        .bindPopup('Nelson is here');
    } else {
      markerRef.current.setLatLng([nelsonLat, nelsonLng]);
      markerRef.current.setIcon(nelsonIcon);
    }

    // Keep the view focused on Scotland + Nelson's current position so the
    // user can always see both the start pin and where he is now.
    // Keep the initial view zoomed in around Nelson's current location so the
    // user lands on a recognisable place (town/road level), not a UK-wide view.
    map.setView([nelsonLat, nelsonLng], 11, { animate: false });
  }, [nelsonLat, nelsonLng]);

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

        <div className="mt-4 rounded-2xl overflow-hidden border-2 border-[#F4971D]/40">
          <div ref={containerRef} className="w-full h-[360px] bg-[#2a2a2a]" />
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
