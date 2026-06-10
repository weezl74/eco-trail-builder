import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

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
}) => {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen bg-[#F4971D] pb-24 px-4 pt-10 font-roboto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-[#1f1f1f] text-white font-bold mb-4 px-4 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" /> {t('Back')}
      </button>
      <h1 className="text-white text-2xl font-bold mb-4">{title}</h1>
      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4 text-[#1f1f1f]">
        {children}
      </div>
    </div>
  );
};

const AccountInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
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
      toast({ title: t('Error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('Saved'), description: t('Your account information has been updated.') });
    }
  };

  return (
    <Shell title={t('Account Information')} onBack={onBack}>
      <div className="space-y-2">
        <Label>{t('Email')}</Label>
        <Input value={user?.email || ''} disabled className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>{t('Display name')}</Label>
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
        {saving ? t('Saving…') : t('Save changes')}
      </Button>
    </Shell>
  );
};

const Privacy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t('Privacy Settings')} onBack={onBack}>
      <p>{t('Your personal data is stored securely on Lovable Cloud and is only ever used to power your Nurture experience. We never sell your data.')}</p>
      <p>{t('Your name, footprint and points appear on the community leaderboard so other Caerphilly residents can cheer you on. To remove yourself from the leaderboard, contact us via the Contact Us page.')}</p>
    </Shell>
  );
};

const ChangePassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pw.length < 8) {
      toast({ title: t('Too short'), description: t('Use at least 8 characters.'), variant: 'destructive' });
      return;
    }
    if (pw !== pw2) {
      toast({ title: t('Mismatch'), description: t('Passwords do not match.'), variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast({ title: t('Error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('Password updated') });
      setPw(''); setPw2('');
    }
  };

  return (
    <Shell title={t('Change Password')} onBack={onBack}>
      <div className="space-y-2">
        <Label>{t('New password')}</Label>
        <div className="relative">
          <Input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-xl pr-10" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1f1f1f]" aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t('Confirm new password')}</Label>
        <Input type={show ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} className="rounded-xl" />
      </div>
      <Button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold"
      >
        {busy ? t('Updating…') : t('Update password')}
      </Button>
    </Shell>
  );
};

const About: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t('About Nurture')} onBack={onBack}>
      <p>{t('Nurture is a community sustainability app for residents of Caerphilly. Calculate your carbon footprint, pledge greener actions, earn points and customise your sheep avatar as your neighbourhood cools down together.')}</p>
      <p>{t('Made with ❤️ for the Caerphilly borough.')}</p>
    </Shell>
  );
};

const Terms: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t('Terms and Conditions')} onBack={onBack}>
      <p>{t('Read the full Nurture App terms and privacy policy on our website.')}</p>
      <a
        href="https://ccbc-decarb.github.io/privacy-policy/"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold py-3"
      >
        {t('Open Privacy Policy')}
      </a>
    </Shell>
  );
};

const Contact: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  return (
    <Shell title={t('Contact Us')} onBack={onBack}>
      <p>{t('Have a question or feedback? We\'d love to hear from you.')}</p>
      <a
        href="mailto:hello@nurture-caerphilly.app"
        className="block w-full text-center rounded-2xl bg-[#1f1f1f] hover:bg-black text-white font-bold py-3"
      >
        {t('Email the team')}
      </a>
    </Shell>
  );
};

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
