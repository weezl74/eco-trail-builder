import React, { useState } from 'react';
import { ArrowRight, Sparkles, Share2 } from 'lucide-react';
import AccountCard from './AccountCard';
import SheepAvatarScreen from './screens/SheepAvatarScreen';
import AccountSubScreen, { Page as SubPage } from './screens/AccountSubScreen';
import { supabase } from '@/integrations/supabase/client';


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
      <div className="bg-[#fff8d6] rounded-2xl p-3 mb-4 shadow-lg">
        <AccountCard
          name={name}
          memberSince={memberSince}
          totalPoints={totalPoints}
          currentFootprint={currentFootprint}
          badges={badges}
          rewards={rewards}
        />
      </div>

      {/* Quick action buttons (badges / share) */}
      <div className="flex justify-center gap-12 mb-6">
        <button className="bg-[#1f1f1f] rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </button>
        <button className="bg-[#1f1f1f] rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
          <Share2 className="h-8 w-8 text-white" />
        </button>
      </div>

      <Section title="Account">
        <Row label="Edit Carbon Card" onClick={() => setEditingAvatar(true)} />
        <Row label="Account Information" onClick={() => setSubPage('account-info')} />
        <Row label="Privacy Settings" onClick={() => setSubPage('privacy')} />
        <Row label="Change Password" onClick={() => setSubPage('change-password')} />
      </Section>

      <Section title="Support">
        <Row label="About Nurture" onClick={() => setSubPage('about')} />
        <Row label="Terms and Conditions" onClick={() => setSubPage('terms')} />
        <Row label="Contact Us" onClick={() => setSubPage('contact')} />
      </Section>

      <div className="mb-5">
        <p className="font-serif font-bold text-black text-base mb-2 px-1">Session and Data</p>
        <div className="bg-[#1f1f1f] rounded-2xl px-5 divide-y divide-white/10">
          <Row label="Log Out" warn onClick={handleLogOut} />
          <Row label="Delete Account" danger onClick={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default AccountScreen;
