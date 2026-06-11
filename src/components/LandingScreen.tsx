import React, { useState } from 'react';
import normalBg from '@/assets/svg/landing-normal.jpg.asset.json';
import wetBg from '@/assets/svg/landing-wet.jpg.asset.json';
import { useTranslations } from '@/hooks/useTranslations';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

const pickWet = () => Math.random() < 0.5;

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  const [isWet] = useState(pickWet);
  const bg = isWet ? wetBg.url : normalBg.url;
  const { t } = useTranslations();

  return (
    <button
      type="button"
      onClick={onBeetleClick}
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
