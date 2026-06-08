import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import LanguageSelect from "@/components/LanguageSelect";
import AuthChoice from "@/components/AuthChoice";
import LoginForm from "@/components/LoginForm";
import RegisterForm, { RegistrationDetails } from "@/components/RegisterForm";
import SimplifiedApp from "@/components/SimplifiedApp";
import { useAuth } from "@/hooks/useAuth";

type Stage = "landing" | "language" | "auth" | "login" | "register" | "app";

const Index = () => {
  const [stage, setStage] = useState<Stage>("landing");
  const [language, setLanguage] = useState<"en" | "cy">("en");
  const { user } = useAuth();

  // If authenticated and past landing, go to app
  useEffect(() => {
    if (user && (stage === "login" || stage === "register" || stage === "auth")) {
      setStage("app");
    }
  }, [user, stage]);

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

  if (stage === "login") {
    return <LoginForm onSuccess={() => setStage("app")} />;
  }

  if (stage === "auth") {
    return (
      <AuthChoice
        onSelect={(choice) => setStage(choice === "register" ? "register" : "login")}
      />
    );
  }

  if (stage === "language") {
    return (
      <LanguageSelect
        onSelect={(lang) => {
          setLanguage(lang);
          try { localStorage.setItem("app_language", lang); } catch {}
          setStage("auth");
        }}
      />
    );
  }

  return <LandingScreen onBeetleClick={() => setStage("language")} />;
};

export default Index;
