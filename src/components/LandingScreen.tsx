import React from 'react';
import dayBg from '@/assets/svg/welcome-day.svg.asset.json';
import nightBg from '@/assets/svg/welcome-night.svg.asset.json';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

const sunsetBgUrl = '/welcome-sunset-orange.svg';

const pickBackground = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 17) return dayBg.url;
  if (h >= 17 && h < 20) return sunsetBgUrl;
  return nightBg.url;
};

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  const bg = pickBackground();
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#3a2418]">
      <img
        src={bg}
        alt="Welcome - Tap to Start"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        draggable={false}
      />
      <button
        onClick={onBeetleClick}
        aria-label="Tap to Start"
        className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[70%] h-[14%] rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 active:scale-95 transition-transform"
      />
    </div>
  );
};

export default LandingScreen;
