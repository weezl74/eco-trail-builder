import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import SimplifiedApp from "@/components/SimplifiedApp";

const Index = () => {
  const [showApp, setShowApp] = useState(false);
  return showApp ? (
    <SimplifiedApp onBackToLanding={() => setShowApp(false)} />
  ) : (
    <LandingScreen onBeetleClick={() => setShowApp(true)} />
  );
};

export default Index;
