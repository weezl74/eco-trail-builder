import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import AccountCard from './AccountCard';
import WoollyWallet from './WoollyWallet';
import SheepAvatarScreen from './screens/SheepAvatarScreen';
import AccountSubScreen, { Page as SubPage } from './screens/AccountSubScreen';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';



interface AccountScreenProps {
  name: string;
  memberSince: string;
  totalPoints: number;
  currentFootprint: number;
  badges?: any[];
  rewards?: any[];
  onLogOut?: () => void;
}

const Row: React.FC<{ label: string; danger?: boolean; warn?: boolean; onClick?: () => void }> = ({
  label, danger, warn, onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-4 px-1"
  >
    <span className={`font-serif font-bold text-xl ${danger ? 'text-red-500' : warn ? 'text-[#f5a623]' : 'text-white'}`}>
      {label}
    </span>
    <ArrowRight className={`h-6 w-6 ${danger ? 'text-red-500' : warn ? 'text-[#f5a623]' : 'text-white'}`} />
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <p className="font-serif font-bold text-black text-base mb-2 px-1">{title}</p>
    <div className="bg-[#1f1f1f] rounded-2xl px-5 divide-y divide-white/10">
      {children}
    </div>
  </div>
);

const AccountScreen: React.FC<AccountScreenProps> = ({
  name, memberSince, totalPoints, currentFootprint, badges = [], rewards = [], onLogOut,
}) => {
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [subPage, setSubPage] = useState<SubPage | null>(null);
  const { t } = useTranslations();

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    onLogOut?.();
  };

  const handleDelete = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    await supabase.auth.signOut();
    onLogOut?.();
  };

  if (editingAvatar) {
    return <SheepAvatarScreen onBack={() => setEditingAvatar(false)} />;
  }

  if (subPage) {
    return <AccountSubScreen page={subPage} onBack={() => setSubPage(null)} />;
  }


  return (
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-6">
      {/* Carbon card placeholder uses the flippable card */}
      <div className="mb-4">
        <AccountCard
          name={name}
          memberSince={memberSince}
          totalPoints={totalPoints}
          currentFootprint={currentFootprint}
          badges={badges}
          rewards={rewards}
        />
      </div>

      <WoollyWallet />

      {/* Quick action buttons removed — share now lives on the card itself */}

      <Section title={t('Account')}>
        <Row label={t('Edit Carbon Card')} onClick={() => setEditingAvatar(true)} />
        <Row label={t('Account Information')} onClick={() => setSubPage('account-info')} />
        <Row label={t('Privacy Settings')} onClick={() => setSubPage('privacy')} />
        <Row label={t('Change Password')} onClick={() => setSubPage('change-password')} />
      </Section>

      <Section title={t('Support')}>
        <Row label={t('About Nurture')} onClick={() => setSubPage('about')} />
        <Row label={t('Terms and Conditions')} onClick={() => setSubPage('terms')} />
        <Row label={t('Contact Us')} onClick={() => setSubPage('contact')} />
      </Section>

      <div className="mb-5">
        <p className="font-serif font-bold text-black text-base mb-2 px-1">{t('Session and Data')}</p>
        <div className="bg-[#1f1f1f] rounded-2xl px-5 divide-y divide-white/10">
          <Row label={t('Log Out')} warn onClick={handleLogOut} />
          <Row label={t('Delete Account')} danger onClick={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default AccountScreen;
