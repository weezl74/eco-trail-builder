
import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

type Page = "account-info" | "privacy" | "change-password" | "about" | "terms" | "contact";

interface Props {
  page: Page;
  onBack: () => void;
}

const API_URL = "https://caerphilly-api.onrender.com/profile";

/* -------------------------- Shell Wrapper -------------------------- */

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({
  title,
  onBack,
  children,
}) => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-10 font-roboto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-[#1f1f1f] text-white font-bold mb-4 px-4 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" /> {t("Back")}
      </button>

      <h1 className="text-white text-2xl font-bold mb-4">{title}</h1>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4 text-[#1f1f1f]">
        {children}
      </div>
    </div>
  );
};

/* -------------------------- Account Info -------------------------- */

const AccountInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const [displayName, setDisplayName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Load from Render API instead of Supabase
  React.useEffect(() => {
    (async () => {
      if (!user) return;

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const profile = data.find((p: any) => p.user_id === user.id);

        setDisplayName(profile?.display_name || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      }

      setLoaded(true);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;

    setSaving(true);

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        display_name: displayName,
        username: displayName,
        account_type: "resident",
      }),
    });

    setSaving(false);

    toast({
      title: t("Saved"),
      description: t("Your account information has been updated."),
    });
  };

  return (
    <Shell title={t("Account Information")} onBack={onBack}>
      <div className="space-y-2">
        <Label>{t("Email")}</Label>
        <Input value={user?.email || ""} disabled className="rounded-xl" />
      </div>

      <div className="space-y-2">
        <Label>{t("Display name")}</Label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={!loaded}
          className="rounded-xl"
        />
      </div>

      <Button
        onClick={save}
        disabled={saving || !loaded}
        className="w-full rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold"
      >
        {saving ? t("Saving…") : t("Save changes")}
      </Button>
    </Shell>
  );
};

/* -------------------------- Static Pages -------------------------- */

const Privacy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t("Privacy Settings")} onBack={onBack}>
      <p>{t("Your personal data is stored securely on Lovable Cloud and is only ever used to power your Nelson experience. We never sell your data.")}</p>
      <p>{t("Your name, footprint and points appear on the community leaderboard so other Caerphilly residents can cheer you on. To remove yourself from the leaderboard, contact us via the Contact Us page.")}</p>
    </Shell>
  );
};

const About: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t("About Nelson")} onBack={onBack}>
      <p>{t("Nelson is a community sustainability app for residents of Caerphilly.")}</p>
      <p>{t("Made with ❤️ for the Caerphilly borough.")}</p>
    </Shell>
  );
};

const Terms: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
