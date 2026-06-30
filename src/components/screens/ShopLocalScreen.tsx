import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Filter, Sun, Wind, Droplet, Thermometer } from 'lucide-react';
import { useSavings, RenewableType, RENEWABLE_COSTS } from '@/hooks/useSavings';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';
import WalkMyWarmUpJourney from '@/components/WalkMyWarmUpJourney';
import ShopLocalLeafletMap, { LeafletPoi, LeafletRenewable } from '@/components/ShopLocalLeafletMap';
import { useWalletBusinesses as useWallet } from '@/hooks/useWallet';
import { getSector } from '@/lib/sectorIcons';
import NelsonJourneyScreen from '@/components/screens/NelsonJourneyScreen';
import TechRewardDialog from '@/components/TechRewardDialog';
import actLocal from '@/assets/svg/act-local.svg.asset.json';

type Category = 'libraries' | 'allotments' | 'leisure' | 'ev' | 'eco' | 'business';
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
    color: '#15803d',
    message: 'Invest your pound locally to keep supply-chain travel emissions low.',
    delta: { money: 18, co2: 14, water: 25 },
  },
  business: {
    label: 'Member Businesses',
    color: '#f4971d',
    message: 'Member business — tap to add their loyalty card to your wallet.',
    delta: { money: 0, co2: 0, water: 0 },
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
  id: number | string;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  carbonAction: string | null;
  // For business pins only
  businessCardId?: string;
  sectorIcon?: string;
  rewardText?: string | null;
  stampsRequired?: number | null;
};


const pinId = (p: { id: number | string; category: Category }) => `${p.category}:${p.id}`;

type Mode = 'local' | 'cool';

const RENEWABLE_META: Record<
  RenewableType,
  { label: string; color: string; icon: typeof Sun; glyph: string; explanation: string; stars: number }
> = {
  solar: {
    label: 'Solar Farm',
    color: '#fbbf24',
    icon: Sun,
    glyph: '☀',
    explanation:
      'Solar panels turn sunlight straight into clean electricity, pushing fossil-fuel power off the grid.',
    stars: 2,
  },
  wind: {
    label: 'Wind Turbine',
    color: '#38bdf8',
    icon: Wind,
    glyph: '🌬',
    explanation:
      'A turbine harvests Caerphilly’s hillside winds for zero-carbon electricity — no fuel, no flue gas.',
    stars: 2,
  },
  mine_water: {
    label: 'Mine Water',
    color: '#a78bfa',
    icon: Droplet,
    glyph: '♨',
    explanation:
      'Warm water sitting in old coal mines is pumped up to heat homes — turning mining heritage into a climate solution.',
    stars: 3,
  },
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
  const { businesses: walletBusinesses, addBusiness } = useWallet();
  const { t } = useTranslations();
  const [walkOpen, setWalkOpen] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [reward, setReward] = useState<{ label: string; explanation: string; stars: number } | null>(null);

  const leafletRenewables: LeafletRenewable[] = useMemo(
    () =>
      renewables
        .filter((r) => r.lat != null && r.lng != null)
        .map((r) => {
          const meta = RENEWABLE_META[r.type];
          return {
            id: r.id,
            lat: r.lat as number,
            lng: r.lng as number,
            color: meta.color,
            label: meta.label,
            glyph: meta.glyph,
            onClick: () =>
              setReward({ label: meta.label, explanation: meta.explanation, stars: meta.stars }),
          };
        }),
    [renewables],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      let locData: any[] = [];
      let bizData: any[] = [];
      try {
        const [locRes, bizRes] = await Promise.all([
          api.get('/map-locations'),
          api.get('/business-cards/public'),
        ]);
        locData = Array.isArray(locRes) ? locRes : [];
        bizData = Array.isArray(bizRes) ? bizRes : [];
      } catch (e) {
        console.error('Failed to load map locations', e);
      }
      if (!mounted) return;
      const mapped: POI[] = locData
        .map((r: any) => {
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
      const businessPois: POI[] = bizData
        .filter((b: any) => b.latitude != null && b.longitude != null)
        .map((b: any) => ({
          id: b.id,
          name: b.business_name,
          category: 'business' as Category,
          lat: Number(b.latitude),
          lng: Number(b.longitude),
          carbonAction: b.offer_to_residents ?? null,
          businessCardId: b.id,
          sectorIcon: b.sector_icon ?? undefined,
          rewardText: b.reward_text,
          stampsRequired: b.stamps_required,
        }));
      setPois([...mapped, ...businessPois]);
    })();
    return () => { mounted = false; };
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
        title: `${t('Pledged')}: ${p.name}`,
        description: `+£${info.delta.money} · ${info.delta.co2}kg CO₂e · ${info.delta.water}L · +25 ${t('wool')}`,
      });
    } else {
      toast({ title: t('Already pledged'), description: p.name });
    }
  };

  // Forward-looking blurb for the pin popup — never assumes the user has
  // already visited the place or earned the carbon saving.
  const inviteBlurb = (p: POI) => {
    const info = CATEGORY_INFO[p.category];
    if (p.category === 'leisure') {
      return t('Join the #WalkMyWarmUp meet-up — walk in for your warm-up and skip the drive.');
    }
    return info.message;
  };

  const leafletPois: LeafletPoi[] = useMemo(
    () =>
      visible.map((p) => {
        const info = CATEGORY_INFO[p.category];
        const id = pinId(p);
        const isPledged = pledged.includes(id);
        const isLeisure = p.category === 'leisure';
        const isBusiness = p.category === 'business';
        const inWallet = walletBusinesses.some((b) => b.id === id);
        const reason = p.carbonAction || info.message;
        const sectorMeta = isBusiness ? getSector(p.sectorIcon) : null;
        const color = sectorMeta?.color ?? info.color;
        const blurb = isBusiness
          ? (p.rewardText
              ? `${t('Loyalty card')}: ${p.rewardText} (${p.stampsRequired ?? 6} ${t('stamps')})`
              : t('Tap to add this business loyalty card to your wallet.'))
          : (isLeisure
              ? t('Join the #WalkMyWarmUp meet-up — walk in for your warm-up and skip the drive.')
              : info.message);
        return {
          id,
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          color,
          blurb,
          pledged: isBusiness ? false : isPledged,
          ctaLabel: isBusiness
            ? (inWallet ? `✓ ${t('Loyalty card in wallet')}` : t('Add loyalty card to wallet'))
            : isLeisure
              ? t('Join #WalkMyWarmUp')
              : isPledged
                ? `✓ ${t('Pledged')}`
                : t('Pledge to visit'),
          onAction: () => {
            if (isBusiness) {
              const ok = addBusiness({
                id,
                name: p.name,
                category: sectorMeta?.label ?? info.label,
                color,
                reason: p.rewardText || reason,
                businessCardId: p.businessCardId,
                sectorIcon: p.sectorIcon,
                stampsRequired: p.stampsRequired ?? 6,
                rewardText: p.rewardText ?? undefined,
              });
              toast({
                title: ok ? t('Loyalty card added') : t('Already in wallet'),
                description: p.name,
              });
              return;
            }
            isLeisure ? setWalkOpen(true) : handlePledge(p);
          },
          walletLabel: isBusiness
            ? undefined
            : (inWallet ? `✓ ${t('In wallet')}` : t('Add to wallet')),
          onAddToWallet: isBusiness
            ? undefined
            : () => {
                const ok = addBusiness({
                  id,
                  name: p.name,
                  category: info.label,
                  color: info.color,
                  reason,
                });
                toast({
                  title: ok ? t('Added to wallet') : t('Already in wallet'),
                  description: p.name,
                });
              },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, pledged, walletBusinesses],
  );


  // Cooling % from renewables placed
  const cooling = Math.min(95, renewables.length * 6);
  // Red-orange overlay that fades as the borough cools.
  // Starts a strong red/orange wash at 0% cooled and tapers to transparent at 100%.
  const warmRatio = 1 - cooling / 100; // 1 = fully hot, 0 = fully cooled
  const overlayAlpha = 0.45 * warmRatio;
  const overlayColor = `hsla(14, 90%, 50%, ${overlayAlpha})`;

  if (showJourney) {
    return (
      <NelsonJourneyScreen
        totalPoints={woolPoints}
        onBack={() => setShowJourney(false)}
      />
    );
  }





  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-3 left-3 z-[1000] bg-white rounded-full p-2 shadow"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
      )}

      {/* Mode toggle */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow flex p-1 font-serif font-bold text-sm">
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
            {m === 'local' ? t('Local Map') : t('Cool the Borough')}
          </button>
        ))}
      </div>

      {mode === 'local' && (
        <button
          onClick={() => setShowFilter((s) => !s)}
          className="fixed top-3 right-3 z-[1000] bg-white rounded-2xl px-4 py-2 shadow font-serif font-bold flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('Filter')} ({active.size})
        </button>
      )}

      {mode === 'local' && showFilter && (
        <div className="fixed top-16 right-3 z-[1000] bg-white rounded-2xl shadow-lg p-3 w-64">
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
              <span className="font-serif text-sm">{t(c.label)}</span>
            </label>
          ))}
        </div>
      )}

      {mode === 'local' && (
        <div className="fixed bottom-28 left-3 z-[1000] bg-white/95 rounded-2xl shadow p-2 flex flex-wrap gap-2 max-w-[90%]">
          {CATEGORIES.filter((c) => active.has(c.id)).map((c) => (
            <div key={c.id} className="flex items-center gap-1 text-xs font-serif">
              <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
              {t(c.label)}
            </div>
          ))}
        </div>
      )}

      {/* Cool mode HUD */}
      {mode === 'cool' && (
        <>
          {/* Thermometer */}
          <div className="fixed top-20 right-3 z-[1000] bg-white/95 rounded-2xl shadow p-3 flex flex-col items-center w-16">
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
              {cooling}%<br/>{t('cooler')}
            </p>
          </div>

          {/* Wool + buy bar */}
          <div className="fixed bottom-28 left-3 right-3 z-[1000] bg-white/95 rounded-2xl shadow p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-serif font-bold text-sm">{t('Wool:')} {woolPoints}</p>
              <p className="font-serif text-xs opacity-70">
                {placing ? t('Tap the map to place') : t('Pick a renewable')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RENEWABLE_META) as RenewableType[]).map((rt) => {
                const meta = RENEWABLE_META[rt];
                const Icon = meta.icon;
                const cost = RENEWABLE_COSTS[rt];
                const selected = placing === rt;
                const afford = woolPoints >= cost;
                return (
                  <button
                    key={rt}
                    onClick={() => setPlacing(selected ? null : rt)}
                    disabled={!afford}
                    className={`rounded-xl p-2 font-serif text-xs flex flex-col items-center gap-1 border-2 transition ${
                      selected ? 'border-black bg-[#f5a623]' : 'border-transparent bg-gray-100'
                    } ${!afford ? 'opacity-40' : ''}`}
                  >
                    <Icon className="h-5 w-5" style={{ color: meta.color }} />
                    <span className="font-bold leading-tight text-center">{t(meta.label)}</span>
                    <span>{cost} {t('wool')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nelson "bring him home" button */}
          <button
            onClick={() => setShowJourney(true)}
            className="fixed bottom-64 right-3 z-[1000] w-16 h-16 rounded-full bg-[#f5a623] shadow-lg border-2 border-white flex items-center justify-center active:scale-95 transition"
            aria-label="Find Nelson"
            title={t('Bring Nelson home')}
          >
            <img src={actLocal.url} alt="" className="w-11 h-11" />
          </button>
        </>
      )}

      <div className="absolute inset-0 w-full h-full">
        <ShopLocalLeafletMap
          bbox={BBOX}
          pois={mode === 'local' ? leafletPois : []}
          renewables={mode === 'cool' ? leafletRenewables : []}
          className="absolute inset-0 w-full h-full"
          onMapClick={
            mode === 'cool' && placing
              ? async (lat, lng, x, y) => {
                  const tech = placing;
                  const ok = await buyRenewable(tech, x, y, lat, lng);
                  if (ok) {
                    const meta = RENEWABLE_META[tech];
                    toast({
                      title: `${t(meta.label)} ${t('placed')}`,
                      description: `-${RENEWABLE_COSTS[tech]} ${t('wool')}`,
                    });
                    setPlacing(null);
                    setReward({ label: meta.label, explanation: meta.explanation, stars: meta.stars });
                  } else {
                    toast({
                      title: t('Not enough wool'),
                      description: `${t(RENEWABLE_META[tech].label)} ${RENEWABLE_COSTS[tech]} ${t('wool')}`,
                    });
                  }
                }
              : undefined
          }
        />

        {/* Red-orange "the borough is warming" overlay — fades as cooling rises */}
        {mode === 'cool' && overlayAlpha > 0.01 && (
          <div
            className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
            style={{
              background: overlayColor,
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>

      <TechRewardDialog
        open={!!reward}
        onClose={() => setReward(null)}
        techName={reward?.label ? t(reward.label) : ''}
        explanation={reward?.explanation ? t(reward.explanation) : ''}
        stars={reward?.stars || 1}
      />

      <WalkMyWarmUpJourney
        open={walkOpen}
        onOpenChange={setWalkOpen}
        onEarned={() => {
          toast({ title: t('Stamp earned!'), description: '#WalkMyWarmUp' });
        }}
      />
    </div>
  );
};

export default ShopLocalScreen;
