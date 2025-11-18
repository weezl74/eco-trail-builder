import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import SimplifiedApp from "@/components/SimplifiedApp";

const Index = () => {
  const [showApp, setShowApp] = useState(false);

  const handleBackToLanding = () => {
    setShowApp(false);
  };

  if (showApp) {
    return <SimplifiedApp onBackToLanding={handleBackToLanding} />;
  }

  return <LandingScreen onBeetleClick={() => setShowApp(true)} />;
};

export default Index;
