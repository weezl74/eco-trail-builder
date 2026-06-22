import React, { useState } from 'react';
import { ArrowLeft, Lock, Leaf } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { toast } from '@/hooks/use-toast';

import NelsonAvatar from '@/components/NelsonAvatar';
import { CARD_PALETTES, getPalette } from '@/lib/cardPalettes';
import { useTranslations } from '@/hooks/useTranslations';
import { playGoodBaa } from '@/lib/sounds';

import glassesImg from '@/assets/accessories/glasses.svg.asset.json';
import starGlassesImg from '@/assets/accessories/starGlasses.svg.asset.json';
import pirateHatImg from '@/assets/accessories/pirateHat.svg.asset.json';
import bowtieImg from '@/assets/accessories/bowtie.svg.asset.json';
import stubbleImg from '@/assets/accessories/stubble.svg.asset.json';
import raincoatImg from '@/assets/accessories/raincoat.svg.asset.json';
import longBeardImg from '@/assets/accessories/longBeard.svg.asset.json';
import mohawkImg from '@/assets/accessories/mohawk.png.asset.json';

const ACCESSORY_IMAGES: Partial<Record<string, string>> = {
  glasses: (glassesImg as { url: string }).url,
  starGlasses: (starGlassesImg as { url: string }).url,
  pirateHat: (pirateHatImg as { url: string }).url,
  bowtie: (bowtieImg as { url: string }).url,
  stubble: (stubbleImg as { url: string }).url,
  raincoat: (raincoatImg as { url: string }).url,
  longBeard: (longBeardImg as { url: string }).url,
  mohawk: (mohawkImg as { url: string }).url,
};

type AccessoryId =
  // SVG parts (new)
  | 'cap' | 'pirateHat' | 'mohawk'
  | 'glasses' | 'starGlasses'
  | 'stubble' | 'sideburns' | 'mustache' | 'longBeard' | 'fluffy'
  | 'hornsF' | 'hornsB'
  // legacy emoji
  | 'umbrella' | 'wellies' | 'scarf' | 'sunhat' | 'raincoat' | 'bowtie';

type Accessory = {
  id: AccessoryId;
  label: string;
  emoji: string;
  cost: number;
  carbonNote: string;
};

const ACCESSORIES: Accessory[] = [
  // Hats
  { id: 'cap', label: 'Cap', emoji: '🧢', cost: 40,
    carbonNote: 'Sun protection matters: UV index days above 7 in Wales have risen sharply over the past 30 years.' },
  { id: 'pirateHat', label: 'Pirate Hat', emoji: '🏴‍☠️', cost: 70,
    carbonNote: 'Rising seas are already eroding parts of the Welsh coast — by 1mm a year on average.' },
  { id: 'mohawk', label: 'Mohawk', emoji: '🦔', cost: 55,
    carbonNote: 'Wild hair, wild planet — UK hedgehog numbers have fallen 75% since 2000. Re-wild your garden.' },

  // Facial hair
  { id: 'stubble', label: 'Stubble', emoji: '🧔', cost: 25,
    carbonNote: 'A standard razor lasts ~5 weeks. Switching to a safety razor saves ~30 plastic cartridges a year.' },
  { id: 'longBeard', label: 'Long Beard', emoji: '🧙', cost: 60,
    carbonNote: 'Beard oil in glass not plastic? You\'ll cut ~12g of single-use plastic per refill.' },


  // Glasses
  { id: 'glasses', label: 'Glasses', emoji: '👓', cost: 40,
    carbonNote: 'Heatwaves in Wales are now 5× more likely than 50 years ago — protect your eyes from glare.' },
  { id: 'starGlasses', label: 'Star Glasses', emoji: '🤩', cost: 55,
    carbonNote: 'Star-quality climate action: switching to LED bulbs cuts lighting CO₂ by ~80%.' },

  // Legacy emoji accessories — kept for variety
  { id: 'sunhat', label: 'Sun Hat', emoji: '👒', cost: 35,
    carbonNote: '2022 was the UK\'s hottest year on record — 40°C was reached for the first time ever.' },
  { id: 'umbrella', label: 'Umbrella', emoji: '☂️', cost: 45,
    carbonNote: 'A 1°C warmer planet holds about 8% more water in the air — so when it rains, it pours much harder.' },
  { id: 'raincoat', label: 'Raincoat', emoji: '🧥', cost: 55,
    carbonNote: 'Flash floods in Wales have roughly tripled since 2000 as storms grow more intense.' },
  { id: 'wellies', label: 'Wellies', emoji: '🥾', cost: 50,
    carbonNote: 'UK winter rainfall is up 17% since 1990 — wellies are basically climate kit now.' },
  { id: 'scarf', label: 'Scarf', emoji: '🧣', cost: 30,
    carbonNote: 'Layering up lets you turn the thermostat down 1°C — saving around 300kg of CO₂ a year per home.' },
  { id: 'bowtie', label: 'Bow Tie', emoji: '🎀', cost: 30,
    carbonNote: 'Dressing smart for less: one second-hand outfit saves around 25kg of CO₂ versus buying new.' },
];

type Tab = 'avatar' | 'card';

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('avatar');
  const [openNote, setOpenNote] = useState<AccessoryId | null>(null);
  const { sheepHead: head, setSheepHead } = useUserPreferences();
  const pickHead = (h: 'nelson' | 'barb') => {
    void setSheepHead(h);
  };
  const { woolPoints, accessories, buyAccessory, cardColor, setCardColor, woolColor, setWoolColor } = useSavings();
  const palette = getPalette(cardColor);
  const { t } = useTranslations();

  const WOOL_COLOURS: { id: string; label: string; value: string }[] = [
    { id: 'beige', label: 'Beige', value: '#e8d9b8' },
    { id: 'cream', label: 'Cream', value: '#f5ead0' },
    { id: 'white', label: 'White', value: '#f7f5f0' },
    { id: 'grey', label: 'Grey', value: '#9aa0a6' },
    { id: 'charcoal', label: 'Charcoal', value: '#3f3f46' },
    { id: 'caramel', label: 'Caramel', value: '#b07a3a' },
    { id: 'rose', label: 'Rose', value: '#e6a4a4' },
    { id: 'mint', label: 'Mint', value: '#a8d8b9' },
  ];

  const handleBuy = (a: Accessory) => {
    if (accessories.includes(a.id)) {
      setOpenNote(a.id);
      return;
    }
    const ok = buyAccessory(a.id, a.cost);
    if (ok) playGoodBaa();
    toast({
      title: ok ? `${t(a.label)} ${t('unlocked')}` : t('Not enough wool'),
      description: ok ? a.carbonNote : `${t(a.label)} ${t('costs')} ${a.cost} ${t('wool')}.`,
    });
    if (ok) setOpenNote(a.id);
  };

  const has = (id: AccessoryId) => accessories.includes(id);

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-4 flex flex-col">
      {onBack && (
        <button onClick={onBack} className="text-black flex items-center gap-1 font-serif font-bold mb-2">
          <ArrowLeft className="h-5 w-5" /> {t('Back')}
        </button>
      )}

      <div className="text-center font-serif font-bold text-black mb-3">
        {t('Wool Points')}: {woolPoints}
      </div>

      <div className="flex bg-[#1f1f1f] rounded-full p-1 mb-4">
        <button
          onClick={() => setTab('avatar')}
          className={`flex-1 py-2 rounded-full text-sm font-serif font-bold ${
            tab === 'avatar' ? 'bg-white text-black' : 'text-white'
          }`}
        >
          {t('Avatar')}
        </button>
        <button
          onClick={() => setTab('card')}
          className={`flex-1 py-2 rounded-full text-sm font-serif font-bold ${
            tab === 'card' ? 'bg-white text-black' : 'text-white'
          }`}
        >
          {t('Card Colour')}
        </button>
      </div>

      {tab === 'avatar' && (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={() => pickHead('nelson')}
              className={`px-3 py-1 rounded-full text-xs font-serif font-bold ${head === 'nelson' ? 'bg-black text-[#F4971D]' : 'bg-white/70 text-black'}`}
            >Nelson</button>
            <button
              onClick={() => pickHead('barb')}
              className={`px-3 py-1 rounded-full text-xs font-serif font-bold ${head === 'barb' ? 'bg-black text-[#F4971D]' : 'bg-white/70 text-black'}`}
            >Barb</button>
          </div>
          <div className="flex items-center justify-center mb-3">
            <NelsonAvatar
              woolColor={woolColor}
              accessories={accessories}
              head={head}
              className="w-64 h-64 select-none"
            />
          </div>

          <div className="bg-[#3a3a3a] rounded-2xl p-3 mb-3">
            <p className="text-white font-serif font-bold text-sm mb-2">{t('Wool colour')}</p>
            <div className="grid grid-cols-8 gap-2">
              {WOOL_COLOURS.map((c) => {
                const selected = c.value.toLowerCase() === woolColor.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => setWoolColor(c.value)}
                    aria-label={c.label}
                    title={c.label}
                    className={`aspect-square rounded-full border-2 transition ${
                      selected ? 'border-[#F4971D] scale-110' : 'border-white/30'
                    }`}
                    style={{ background: c.value }}
                  />
                );
              })}
            </div>
          </div>



          <div className="bg-[#3a3a3a] rounded-2xl p-3">
            <p className="text-white font-serif font-bold text-sm mb-2">
              {t('Accessories')} <span className="opacity-60 text-xs">{t('(tap to see climate fact)')}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ACCESSORIES.map((a) => {
                const owned = has(a.id);
                const afford = woolPoints >= a.cost;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleBuy(a)}
                    disabled={!owned && !afford}
                    className={`rounded-xl p-2 text-[11px] font-serif font-bold flex flex-col items-center gap-1 ${
                      owned ? 'bg-[#F4971D] text-black' : afford ? 'bg-white text-black' : 'bg-white/30 text-white'
                    }`}
                  >
                    {ACCESSORY_IMAGES[a.id] ? (
                      <img
                        src={ACCESSORY_IMAGES[a.id]!}
                        alt={a.label}
                        className="h-20 w-20 object-contain"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-4xl leading-none">{a.emoji}</span>
                    )}
                    <span className="flex items-center gap-1 text-[10px]">
                      {!owned && !afford && <Lock className="h-3 w-3" />}
                      {owned ? `✓ ${t('owned')}` : `${a.cost} ${t('wool')}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {openNote && (() => {
              const a = ACCESSORIES.find((x) => x.id === openNote)!;
              return (
                <div className="mt-3 rounded-xl bg-green-900/40 border border-green-400/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="h-4 w-4 text-green-300" />
                    <span className="text-green-100 text-xs font-serif font-bold uppercase tracking-wide">
                      Why {a.label.toLowerCase()}?
                    </span>
                  </div>
                  <p className="text-white/90 text-xs leading-snug">{a.carbonNote}</p>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {tab === 'card' && (
        <>
          <div className="mb-4" style={{ aspectRatio: '1.586 / 1' }}>
            <div
              className="w-full h-full rounded-2xl p-5 shadow-xl relative overflow-hidden"
              style={{ background: palette.front, color: palette.text }}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: 'currentColor', opacity: 0.1 }} />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full" style={{ background: 'currentColor', opacity: 0.05 }} />
              <p className="text-xs opacity-80 font-roboto">GREEN MEMBER CARD</p>
              <p className="text-lg font-bold mt-1">Preview</p>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-2xl p-4 space-y-3">
            <p className="text-white font-serif font-bold text-sm">{t('Choose a colour')}</p>
            <div className="grid grid-cols-2 gap-2">
              {CARD_PALETTES.map((p) => {
                const selected = p.id === cardColor;
                return (
                  <button
                    key={p.id}
                    onClick={() => setCardColor(p.id)}
                    className={`rounded-xl p-2 text-left border-2 transition ${
                      selected ? 'border-[#F4971D] bg-white/10' : 'border-transparent bg-white/5'
                    }`}
                  >
                    <div className="h-10 w-full rounded-md mb-2" style={{ background: p.front }} />
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-serif font-bold">{t(p.label)}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4].map((i) => (
                          <Leaf
                            key={i}
                            className={`h-3 w-3 ${
                              i <= 5 - p.carbonScore ? 'text-green-400' : 'text-white/20'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-green-900/40 border border-green-400/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-green-300" />
                <span className="text-green-100 text-xs font-serif font-bold uppercase tracking-wide">
                  {t('Carbon impact')}
                </span>
              </div>
              <p className="text-white/90 text-xs leading-snug">{palette.carbonNote}</p>
            </div>
          </div>
        </>
      )}

      <button
        onClick={onBack}
        className="w-full mt-4 bg-[#5a3d1c] text-white font-serif font-bold py-4 rounded-xl"
      >
        {t('CONFIRM')}
      </button>
    </div>
  );
};

export default SheepAvatarScreen;
