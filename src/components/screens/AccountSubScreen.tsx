import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Page =
  | 'account-info'
  | 'privacy'
  | 'change-password'
  | 'about'
  | 'terms'
  | 'contact';

interface Props {
  page: Page;
  onBack: () => void;
}

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({
  title, onBack, children,
}) => (
  <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-6 font-roboto">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-white font-bold mb-4"
    >
      <ArrowLeft className="h-5 w-5" /> Back
    </button>
    <h1 className="text-white text-2xl font-bold mb-4">{title}</h1>
    <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4 text-[#1f1f1f]">
      {children}
    </div>
  </div>
);

const AccountInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
      setDisplayName(data?.display_name || '');
      setLoaded(true);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Your account information has been updated.' });
    }
  };

  return (
    <Shell title="Account Information" onBack={onBack}>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email || ''} disabled className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>Display name</Label>
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
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </Shell>
  );
};

const Privacy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Privacy Settings" onBack={onBack}>
    <p>
      Your personal data is stored securely on Lovable Cloud and is only ever used to
      power your Nurture experience. We never sell your data.
    </p>
    <p>
      Your name, footprint and points appear on the community leaderboard so other
      Caerphilly residents can cheer you on. To remove yourself from the leaderboard,
      contact us via the Contact Us page.
    </p>
  </Shell>
);

const ChangePassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pw.length < 8) {
      toast({ title: 'Too short', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (pw !== pw2) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated' });
      setPw(''); setPw2('');
    }
  };

  return (
    <Shell title="Change Password" onBack={onBack}>
      <div className="space-y-2">
        <Label>New password</Label>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>Confirm new password</Label>
        <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="rounded-xl" />
      </div>
      <Button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold"
      >
        {busy ? 'Updating…' : 'Update password'}
      </Button>
    </Shell>
  );
};

const About: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="About Nurture" onBack={onBack}>
    <p>
      Nurture is a community sustainability app for residents of Caerphilly. Calculate
      your carbon footprint, pledge greener actions, earn points and customise your
      sheep avatar as your neighbourhood cools down together.
    </p>
    <p>Made with ❤️ for the Caerphilly borough.</p>
  </Shell>
);

const Terms: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Terms and Conditions" onBack={onBack}>
    <p>
      By using Nurture you agree to use the app for personal, non-commercial purposes
      and to keep your sign-in credentials private. Pledges, points and leaderboard
      rankings are intended for motivation, not as legally binding commitments.
    </p>
    <p>
      We may update these terms occasionally. Continued use of the app after updates
      means you accept the revised terms.
    </p>
  </Shell>
);

const Contact: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Contact Us" onBack={onBack}>
    <p>Have a question or feedback? We'd love to hear from you.</p>
    <a
      href="mailto:hello@nurture-caerphilly.app"
      className="block w-full text-center rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold py-3"
    >
      Email the team
    </a>
  </Shell>
);

const AccountSubScreen: React.FC<Props> = ({ page, onBack }) => {
  switch (page) {
    case 'account-info': return <AccountInfo onBack={onBack} />;
    case 'privacy': return <Privacy onBack={onBack} />;
    case 'change-password': return <ChangePassword onBack={onBack} />;
    case 'about': return <About onBack={onBack} />;
    case 'terms': return <Terms onBack={onBack} />;
    case 'contact': return <Contact onBack={onBack} />;
  }
};

export default AccountSubScreen;
export type { Page };
