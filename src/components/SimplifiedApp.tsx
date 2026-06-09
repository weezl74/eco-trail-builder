import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from './BottomNavigation';
import CalculatorScreen from './screens/CalculatorScreen';
import HomeScreen from './HomeScreen';
import ChallengesScreen from './ChallengesScreen';
import CommunityScreen from './CommunityScreen';
import AccountScreen from './AccountScreen';

interface SimplifiedAppProps {
  onBackToLanding?: () => void;
  language?: 'en' | 'cy';
}

const SimplifiedApp = ({ onBackToLanding, language = 'en' }: SimplifiedAppProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profile) setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const totalPoints = userProfile?.total_points || 0;
  const currentFootprint = userProfile?.current_footprint || 0;
  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || 'Green Member';
  const memberSince = userProfile?.created_at
    ? new Date(userProfile.created_at).getFullYear().toString()
    : '2026';

  const badges = totalPoints > 0
    ? [
        { id: 'starter', label: 'First Step' },
        ...(totalPoints >= 100 ? [{ id: 'p100', label: '100 Points' }] : []),
        ...(totalPoints >= 500 ? [{ id: 'p500', label: 'Eco Champion' }] : []),
      ]
    : [];
  const rewards = totalPoints >= 200
    ? [{ id: 'r1', label: '10% off local cafés', value: 'Unlocked' }]
    : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'challenges':
        return <ChallengesScreen />;
      case 'calculator':
        return <CalculatorScreen />;
      case 'community':
        return <CommunityScreen userPoints={totalPoints} />;
      case 'account':
        return (
          <AccountScreen
            name={displayName}
            memberSince={memberSince}
            totalPoints={totalPoints}
            currentFootprint={currentFootprint}
            badges={badges}
            rewards={rewards}
            onLogOut={onBackToLanding}
          />
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      {renderTabContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
};

export default SimplifiedApp;
