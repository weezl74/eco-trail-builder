import React from 'react';
import { ChevronRight } from 'lucide-react';

type UserMode = 'resident' | 'business';

interface LandingScreenProps {
  onBeetleClick?: () => void;
  mode?: UserMode;
  onModeChange?: (mode: UserMode) => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick, mode = 'resident', onModeChange }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative pb-20">
      {/* Mode Toggle - Top Center */}
      {onModeChange && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => onModeChange('resident')}
              className={`px-6 py-2 rounded-full font-roboto text-sm transition-all ${
                mode === 'resident'
                  ? 'bg-white text-foreground shadow-md'
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Resident
            </button>
            <button
              onClick={() => onModeChange('business')}
              className={`px-6 py-2 rounded-full font-roboto text-sm transition-all ${
                mode === 'business'
                  ? 'bg-white text-foreground shadow-md'
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Business
            </button>
          </div>
        </div>
      )}
      
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