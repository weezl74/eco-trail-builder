import React, { useState, useEffect } from "react";
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

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({
  title,
  onBack,
  children,
}) => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[#F4971D] p-4">
      <button onClick={onBack}>
        <ArrowLeft /> {t("Back")}
      </button>

      <h1>{title}</h1>

      <div>{children}</div>
    </div>
  );
};

const AccountInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const [displayName, setDisplayName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;

      const res = await fetch(API_URL);
      const data = await res.json();

      const profile = data.find((p: any) => p.user_id === user.id);
      setDisplayName(profile?.display_name || "");
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

    toast({ title: t("Saved") });
  };

  return (
    <Shell title={t("Account")} onBack={onBack}>
      <Label>Email</Label>
      <Input value={user?.email || ""} disabled />

      <Label>Display Name</Label>
      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

      <Button onClick={save}>{saving ? "Saving…" : "Save"}</Button>
    </Shell>
  );
};

const Privacy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Privacy" onBack={onBack}>
    <p>Privacy info</p>
  </Shell>
);

const Terms: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Terms" onBack={onBack}>
    https://ccbc-decarb.github.io/privacy-policy/" target="_blank">
      Open Policy
    </a>
  </Shell>
);

const Contact: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Contact" onBack={onBack}>
    urture-caerphilly.app">Email</a>
  </Shell>
);

const About: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="About" onBack={onBack}>
    <p>About app</p>
  </Shell>
);

const ChangePassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const submit = async () => {
    if (pw !== pw2) return;
    await supabase.auth.updateUser({ password: pw });
  };

  return (
    <Shell title="Password" onBack={onBack}>
      <Input value={pw} onChange={(e) => setPw(e.target.value)} />
      <Input value={pw2} onChange={(e) => setPw2(e.target.value)} />
      <Button onClick={submit}>Update</Button>
    </Shell>
  );
};

const AccountSubScreen: React.FC<Props> = ({ page, onBack }) => {
  switch (page) {
    case "account-info":
      return <AccountInfo onBack={onBack} />;
    case "privacy":
      return <Privacy onBack={onBack} />;
    case "change-password":
      return <ChangePassword onBack={onBack} />;
    case "about":
      return <About onBack={onBack} />;
    case "terms":
      return <Terms onBack={onBack} />;
    case "contact":
      return <Contact onBack={onBack} />;
    default:
      return null;
  }
};

export default AccountSubScreen;
export type { Page };