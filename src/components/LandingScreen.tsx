import React from 'react';
import { ChevronRight } from 'lucide-react';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative pb-20">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-roboto font-normal text-foreground text-center">
          hello
        </h1>
      </div>
      
      {/* Enter App - Bottom Right */}
      <div className="absolute bottom-24 right-8">
        <button
          onClick={onBeetleClick}
          className="p-4 rounded-xl bg-white/20 hover:bg-white/30 transition-colors active:scale-95 group"
          aria-label="Start app"
        >
          <ChevronRight className="h-8 w-8 text-foreground group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;