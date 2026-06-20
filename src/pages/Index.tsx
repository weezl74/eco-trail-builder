import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import LanguageSelect from "@/components/LanguageSelect";
import AuthChoice from "@/components/AuthChoice";
import LoginForm from "@/components/LoginForm";
import RegisterForm, { RegistrationDetails } from "@/components/RegisterForm";
import SimplifiedApp from "@/components/SimplifiedApp";
import BusinessOnboarding from "@/components/business/BusinessOnboarding";
import BusinessApp from "@/components/business/BusinessApp";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Stage = "landing" | "language" | "auth" | "login" | "register" | "app" | "business-onboarding" | "business-app";

const Index = () => {
  const [stage, setStage] = useState<Stage>("landing");
  const [language, setLanguage] = useState<"en" | "cy">(() => {
    try {
      return (localStorage.getItem("app_language") as "en" | "cy") || "en";
    } catch {
      return "en";
    }
  });
  const { user, loading } = useAuth();
  const [bootChecked, setBootChecked] = useState(false);

  // Decide between resident-app and business-app based on profiles.account_type
  const routeAuthenticated = async () => {
    if (!user) return;

    const res = await fetch(
      `https://caerphilly-api-dev01.azurewebsites.net/api/getProfile/me/profile?user_id=${user.id}`,
    );

    const data = await res.json();
    setStage("app");
  };

  useEffect(() => {
    if (!loading && user) {
      routeAuthenticated();
    }
  }, [loading, user]);

  if (loading && !bootChecked) {
    return <div className="min-h-screen bg-[#f5a623]" />;
  }

  if (stage === "business-app") {
    return <BusinessApp onSignOut={() => setStage("landing")} onEditCard={() => setStage("business-onboarding")} />;
  }

  if (stage === "business-onboarding") {
    return <BusinessOnboarding editMode={!!user} onComplete={() => setStage("business-app")} />;
  }

  if (stage === "app") {
    return <SimplifiedApp onBackToLanding={() => setStage("landing")} language={language} />;
  }

  if (stage === "register") {
    return (
      <RegisterForm
        onComplete={(_details: RegistrationDetails, isBusiness: boolean) => {
          // PII (name, email, postcode, phone, age) is persisted server-side in the
          // profile via the auth trigger — do not echo it back into browser storage.
          setStage(isBusiness ? "business-onboarding" : "app");
        }}
      />
    );
  }

  if (stage === "login") {
    return <LoginForm onSuccess={() => routeAuthenticated()} />;
  }

  if (stage === "auth") {
    return <AuthChoice onSelect={(choice) => setStage(choice === "register" ? "register" : "login")} />;
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
