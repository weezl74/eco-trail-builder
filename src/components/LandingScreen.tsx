import React from 'react';
import welcomeImage from '@/assets/welcome-sheep.jpg.asset.json';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#3a2418]">
      <img
        src={welcomeImage.url}
        alt="Welcome - Tap to Start"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        draggable={false}
      />
      {/* Tap to Start button overlay - positioned over the "Welcome / Tap to Start" text */}
      <button
        onClick={onBeetleClick}
        aria-label="Tap to Start"
        className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[70%] h-[14%] rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 active:scale-95 transition-transform"
      />
    </div>
  );
};

export default LandingScreen;
