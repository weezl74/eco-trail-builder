import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import LanguageSelect from "@/components/LanguageSelect";
import SimplifiedApp from "@/components/SimplifiedApp";

type Stage = "landing" | "language" | "app";

const Index = () => {
  const [stage, setStage] = useState<Stage>("landing");
  const [language, setLanguage] = useState<"en" | "cy">("en");

  if (stage === "app") {
    return (
      <SimplifiedApp
        onBackToLanding={() => setStage("landing")}
        language={language}
      />
    );
  }

  if (stage === "language") {
    return (
      <LanguageSelect
        onSelect={(lang) => {
          setLanguage(lang);
          try {
            localStorage.setItem("app_language", lang);
          } catch {}
          setStage("app");
        }}
      />
    );
  }

  return <LandingScreen onBeetleClick={() => setStage("language")} />;
};

export default Index;
