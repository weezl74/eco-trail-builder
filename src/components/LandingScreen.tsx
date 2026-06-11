import React, { useEffect, useState } from 'react';
import normalBg from '@/assets/svg/landing-normal.jpg.asset.json';
import wetBg from '@/assets/svg/landing-wet.jpg.asset.json';
import { useTranslations } from '@/hooks/useTranslations';
import { playNelson } from '@/lib/sounds';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

// Open-Meteo WMO weather codes considered "wet"
// 51-67 drizzle/rain, 71-77 snow, 80-86 showers, 95-99 thunderstorm
const isWetCode = (code: number) =>
  (code >= 51 && code <= 67) ||
  (code >= 71 && code <= 77) ||
  (code >= 80 && code <= 86) ||
  (code >= 95 && code <= 99);

const fetchIsWet = async (lat: number, lon: number): Promise<boolean> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,precipitation`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather fetch failed');
  const json = await res.json();
  const code = json?.current?.weather_code;
  const precip = json?.current?.precipitation ?? 0;
  if (typeof code === 'number' && isWetCode(code)) return true;
  return precip > 0.1;
};




const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  // Ty Penallta, Ystrad Mynach — fixed location, no geolocation prompt
  const TY_PENALLTA = { lat: 51.6438, lon: -3.2384 };
  const [isWet, setIsWet] = useState<boolean>(false);
  const { t } = useTranslations();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const wet = await fetchIsWet(TY_PENALLTA.lat, TY_PENALLTA.lon);
        if (alive) setIsWet(wet);
      } catch (e) {
        console.warn('Landing weather lookup failed', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);


  const bg = isWet ? wetBg.url : normalBg.url;

  return (
    <button
      type="button"
      onClick={() => { playNelson(); onBeetleClick?.(); }}
      aria-label={t('Tap to Start')}
      className="min-h-screen w-full relative overflow-hidden bg-[#3a2418] block focus:outline-none active:scale-[0.99] transition-transform"
    >
      <img
        src={bg}
        alt={t('Welcome - Tap to Start')}
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        draggable={false}
      />
    </button>
  );
};

export default LandingScreen;
