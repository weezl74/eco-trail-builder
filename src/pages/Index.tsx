import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import LanguageSelect from "@/components/LanguageSelect";
import AuthChoice from "@/components/AuthChoice";
import RegisterForm, { RegistrationDetails } from "@/components/RegisterForm";
import SimplifiedApp from "@/components/SimplifiedApp";

type Stage = "landing" | "language" | "auth" | "register" | "app";

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

  if (stage === "register") {
    return (
      <RegisterForm
        onComplete={(details: RegistrationDetails) => {
          try {
            localStorage.setItem("registration_details", JSON.stringify(details));
          } catch {}
          setStage("app");
        }}
      />
    );
  }

  if (stage === "auth") {
    return (
      <AuthChoice
        onSelect={(choice) => {
          if (choice === "register") setStage("register");
          else setStage("app");
        }}
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
          setStage("auth");
        }}
      />
    );
  }

  return <LandingScreen onBeetleClick={() => setStage("language")} />;
};

export default Index;
