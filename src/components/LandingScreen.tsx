import React from 'react';
import { Settings, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LandingScreenProps {
  onBeetleClick?: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onBeetleClick }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative pb-20">
      {/* Extras Button */}
      <button
        onClick={() => navigate('/learning-assessment')}
        className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-foreground rounded-xl p-2 transition-colors duration-300"
        title="Extras"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      
      {/* Decision Toolkit Button */}
      <button
        onClick={() => navigate('/decision-toolkit')}
        className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-foreground rounded-xl p-2 transition-colors duration-300"
        title="Decision Making Toolkit"
      >
        <Settings className="h-5 w-5" />
      </button>
      
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