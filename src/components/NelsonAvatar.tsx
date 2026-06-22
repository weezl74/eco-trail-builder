import React from 'react';
import TintedSheepBody from './TintedSheepBody';
import nelsonHead from '@/assets/sheep/NelsonHead.svg.asset.json';
import barbHead from '@/assets/sheep/BarbHead.svg.asset.json';

import pirateHat from '@/assets/sheep/parts/PirateHat.svg.asset.json';
import mohawk from '@/assets/sheep/parts/Mohawk.svg.asset.json';
import glasses from '@/assets/sheep/parts/Glasses.svg.asset.json';
import starGlasses from '@/assets/sheep/parts/StarGlasses.svg.asset.json';
import stubble from '@/assets/sheep/parts/Stubble.svg.asset.json';
import sideburns from '@/assets/sheep/parts/Sideburns.svg.asset.json';
import mustache from '@/assets/sheep/parts/Mustasch.svg.asset.json';
import longBeard from '@/assets/sheep/parts/LongBeard.svg.asset.json';
import fluffy from '@/assets/sheep/parts/Fluffy.svg.asset.json';
import hornsF from '@/assets/sheep/parts/HornsF.svg.asset.json';
import hornsB from '@/assets/sheep/parts/HornsB.svg.asset.json';

// Real accessory artwork (shop catalogue images) – overlaid as <img>
import capImg from '@/assets/accessories/cap.svg.asset.json';
import sunhatImg from '@/assets/accessories/sunhat.svg.asset.json';
import scarfImg from '@/assets/accessories/scarf.svg.asset.json';
import umbrellaImg from '@/assets/accessories/umbrella.svg.asset.json';
import welliesImg from '@/assets/accessories/wellies.svg.asset.json';

export type PartId =
  // hats
  | 'cap' | 'pirateHat' | 'mohawk'
  // glasses
  | 'glasses' | 'starGlasses'
  // facial hair
  | 'stubble' | 'sideburns' | 'mustache' | 'longBeard' | 'fluffy'
  // horns
  | 'hornsF' | 'hornsB'
  // image accessories
  | 'sunglasses' | 'tophat' | 'bowtie' | 'umbrella' | 'wellies' | 'scarf' | 'sunhat' | 'raincoat';

/**
 * Alignment framework: per-accessory placement on Nelson's body.
 * Coordinates are percentages of the avatar container.
 * Head box (body+head mode) lives at left 15%, top -14%, width 70%, height 70%,
 * so the face centres around (50%, 21%) and the body fills the bottom half.
 */
type Placement = { left: string; top: string; width: string; height: string; z: number };
const ACCESSORY_PLACEMENT: Record<string, Placement> = {
  // Cap perches on top of the head, brim forward — narrower than the head
  cap:      { left: '18%', top: '-24%', width: '64%', height: '42%', z: 5 },
  // Sun hat brim spreads wider than the head
  sunhat:   { left: '5%',  top: '-22%', width: '90%', height: '46%', z: 5 },
  // Scarf wraps the neck just below the chin
  scarf:    { left: '14%', top: '26%',  width: '72%', height: '26%', z: 4 },
  // Umbrella floats above the head
  umbrella: { left: '8%',  top: '-46%', width: '84%', height: '52%', z: 6 },
  // Wellies sit at the feet
  wellies:  { left: '22%', top: '74%',  width: '56%', height: '24%', z: 4 },
};

const ACCESSORY_IMG_URLS: Record<string, string> = {
  cap:      capImg.url,
  sunhat:   sunhatImg.url,
  scarf:    scarfImg.url,
  umbrella: umbrellaImg.url,
  wellies:  welliesImg.url,
};

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: 'nelson' | 'barb';
  className?: string;
  /** Show body+head (default) or just the head */
  headOnly?: boolean;
}

/**
 * Tinted SVG part rendered via CSS mask so `currentColor` styles work
 * on assets loaded as <img>.
 */
const TintedPart: React.FC<{ url: string; color: string; style?: React.CSSProperties; zIndex?: number }> = ({
  url, color, style, zIndex,
}) => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      ...style,
      zIndex,
      backgroundColor: color,
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
    }}
  />
);

/**
 * Unified Nelson/Barb avatar with optional accessories.
 * Place inside a sized container (e.g. w-32 h-32). Body + head fill it.
 *
 * The part SVGs are designed against a 500x500 face. They are overlaid
 * at the same square area as the head so positions roughly align.
 */
const NelsonAvatar: React.FC<Props> = ({
  woolColor,
  accessories = [],
  head = 'nelson',
  className,
  headOnly = false,
}) => {
  const has = (id: PartId) => accessories.includes(id);
  const headSrc = head === 'nelson' ? nelsonHead.url : barbHead.url;

  // Head occupies top portion of the container.
  // For body+head: head sits at top, 70% width, top -14% (matches HomeScreen pattern).
  // Parts use the same box as the head, so they align with the face.
  const headBox: React.CSSProperties = headOnly
    ? { left: 0, top: 0, width: '100%', height: '100%' }
    : { left: '15%', top: '-14%', width: '70%', height: '70%' };

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Back horns sit behind head */}
      {has('hornsB') && (
        <div className="absolute pointer-events-none" style={{ ...headBox, zIndex: 1 }}>
          <TintedPart url={hornsB.url} color="#d4b582" />
        </div>
      )}

      {/* Body */}
      {!headOnly && (
        <TintedSheepBody
          color={woolColor}
          className="absolute inset-0 w-full h-full drop-shadow-lg [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
        />
      )}

      {/* Head */}
      <img
        src={headSrc}
        alt={head === 'nelson' ? 'Nelson the sheep' : 'Barb the sheep'}
        className="absolute pointer-events-none select-none"
        style={{ ...headBox, zIndex: 2 }}
        draggable={false}
      />

      {/* Head-level overlays (face parts) — same box as head */}
      <div className="absolute pointer-events-none" style={{ ...headBox, zIndex: 3 }}>
        {/* Facial hair */}
        {has('fluffy')    && <TintedPart url={fluffy.url}    color="#5a3a1f" />}
        {has('longBeard') && <TintedPart url={longBeard.url} color="#5a3a1f" />}
        {has('sideburns') && <TintedPart url={sideburns.url} color="#5a3a1f" />}
        {has('stubble')   && <TintedPart url={stubble.url}   color="#2b1a0a" />}
        {has('mustache')  && <TintedPart url={mustache.url}  color="#3a2410" />}

        {/* Glasses */}
        {has('glasses')     && <TintedPart url={glasses.url}     color="#111" />}
        {has('starGlasses') && <TintedPart url={starGlasses.url} color="#F4971D" />}

        {/* Hats (drawn last so they sit on top) */}
        {has('mohawk')    && <TintedPart url={mohawk.url}    color="#c0392b" />}
        {has('cap')       && <TintedPart url={cap.url}       color="#F4971D" />}
        {has('pirateHat') && <TintedPart url={pirateHat.url} color="#1a1a1a" />}

        {/* Front horns on top */}
        {has('hornsF') && <TintedPart url={hornsF.url} color="#d4b582" />}
      </div>

      {/* Legacy emoji accessories — keep working for existing items */}
      {has('umbrella') && (
        <div className="absolute pointer-events-none text-5xl text-center" style={{ left: '50%', top: '-18%', transform: 'translateX(-50%)', zIndex: 4 }}>☂️</div>
      )}
      {has('tophat') && (
        <div className="absolute pointer-events-none text-3xl text-center" style={{ left: '50%', top: '-2%', transform: 'translateX(-50%)', zIndex: 4 }}>🎩</div>
      )}
      {has('sunhat') && (
        <div className="absolute pointer-events-none text-3xl text-center" style={{ left: '50%', top: '0%', transform: 'translateX(-50%)', zIndex: 4 }}>👒</div>
      )}
      {has('sunglasses') && (
        <div className="absolute pointer-events-none flex items-center gap-[2px]" style={{ left: '50%', top: '11%', width: '22%', transform: 'translateX(-50%)', zIndex: 4 }}>
          <div className="flex-1 aspect-[2/1] rounded-sm bg-black" />
          <div className="flex-1 aspect-[2/1] rounded-sm bg-black" />
        </div>
      )}
      {has('scarf') && (
        <div className="absolute pointer-events-none text-2xl text-center" style={{ left: '50%', top: '24%', transform: 'translateX(-50%)', zIndex: 4 }}>🧣</div>
      )}
      {has('bowtie') && (
        <div className="absolute pointer-events-none" style={{ left: '50%', top: '22%', width: '12%', transform: 'translateX(-50%)', zIndex: 4 }}>
          <svg viewBox="0 0 40 20" className="w-full">
            <polygon points="0,2 20,10 0,18" fill="#dc2626" />
            <polygon points="40,2 20,10 40,18" fill="#dc2626" />
            <circle cx="20" cy="10" r="3" fill="#7a0d0d" />
          </svg>
        </div>
      )}
      {has('raincoat') && !headOnly && (
        <div className="absolute pointer-events-none text-4xl text-center" style={{ left: '50%', top: '38%', transform: 'translateX(-50%)', zIndex: 4 }}>🧥</div>
      )}
      {has('wellies') && !headOnly && (
        <div className="absolute pointer-events-none text-2xl text-center" style={{ left: '50%', top: '78%', transform: 'translateX(-50%)', zIndex: 4 }}>🥾</div>
      )}
    </div>
  );
};

export default NelsonAvatar;
