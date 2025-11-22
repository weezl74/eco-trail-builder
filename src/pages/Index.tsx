import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import SimplifiedApp from "@/components/SimplifiedApp";

type UserMode = 'resident' | 'business';

const Index = () => {
  const [showApp, setShowApp] = useState(false);
  const [mode, setMode] = useState<UserMode>('resident');

  const handleBackToLanding = () => {
    setShowApp(false);
  };

  if (showApp) {
    return <SimplifiedApp onBackToLanding={handleBackToLanding} initialMode={mode} />;
  }

  return (
    <LandingScreen 
      onBeetleClick={() => setShowApp(true)} 
      mode={mode}
      onModeChange={setMode}
    />
  );
};

export default Index;
