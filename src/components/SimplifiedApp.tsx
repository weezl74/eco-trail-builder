import React, { useState, useEffect } from 'react';
import { Home, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from './BottomNavigation';
import WasteCalculator from './WasteCalculator';
import UserProgress from './UserProgress';
import AvatarSystem from './AvatarSystem';
import Leaderboard from './Leaderboard';
import CommunityStories from './CommunityStories';
import CaerphillyMap from './CaerphillyMap';
import RenewableShop from './RenewableShop';
import TreePlanting from './TreePlanting';
import KnowledgeBase from './KnowledgeBase';
import SprintChallenges from './SprintChallenges';
import AccountCard from './AccountCard';

interface SimplifiedAppProps {
  onBackToLanding?: () => void;
}

const SimplifiedApp = ({ onBackToLanding }: SimplifiedAppProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground font-roboto">Loading...</p>
        </div>
      </div>
    );
  }

  const totalPoints = userProfile?.total_points || 0;
  const currentFootprint = userProfile?.current_footprint || 0;

  const PageHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-roboto text-foreground">{title}</h1>
      <button
        onClick={onBackToLanding}
        className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
      >
        <Home className="h-6 w-6 text-foreground" />
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return (
          <div className="min-h-screen bg-background pb-20">
            <WasteCalculator />
          </div>
        );
      case 'dashboard':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <PageHeader title="Dashboard" />
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-4">
                  <UserProgress
                    currentFootprint={currentFootprint}
                    totalPoints={totalPoints}
                    pledgesCompleted={0}
                    sprintsCompleted={0}
                    renewablesOwned={0}
                    userMode="resident"
                  />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <AvatarSystem totalPoints={totalPoints} userRenewables={0} pledgesCompleted={0} />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <CaerphillyMap userRenewables={[]} totalPoints={totalPoints} currentFootprint={currentFootprint} />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <RenewableShop totalPoints={totalPoints} userRenewables={[]} onPurchase={() => {}} />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <TreePlanting
                    totalPoints={totalPoints}
                    onPointsUpdate={(newPoints) => {
                      if (userProfile) setUserProfile({ ...userProfile, total_points: newPoints });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <PageHeader title="Leaderboard" />
              <div className="bg-card rounded-2xl p-4">
                <Leaderboard />
              </div>
            </div>
          </div>
        );
      case 'sprints':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <PageHeader title="Sprint Challenges" />
              <div className="bg-card rounded-2xl p-4">
                <SprintChallenges />
              </div>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <PageHeader title="Community" />
              <div className="bg-card rounded-2xl p-4">
                <div className="flex items-center mb-4">
                  <Bug className="h-8 w-8 mr-3 text-wfg-yellow" />
                  <h2 className="text-xl font-roboto">Community Buzz</h2>
                </div>
                <CommunityStories />
              </div>
              <div className="bg-card rounded-2xl p-4 mt-4">
                <KnowledgeBase userProfile={userProfile} setUserProfile={setUserProfile} />
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <PageHeader title="My Account" />
              <div className="bg-card rounded-2xl p-5">
                <AccountCard
                  name={userProfile?.display_name || user?.email?.split('@')[0] || 'Green Member'}
                  memberSince={
                    userProfile?.created_at
                      ? new Date(userProfile.created_at).getFullYear().toString()
                      : '2026'
                  }
                  totalPoints={totalPoints}
                  currentFootprint={currentFootprint}
                  badges={
                    totalPoints > 0
                      ? [
                          { id: 'starter', label: 'First Step' },
                          ...(totalPoints >= 100 ? [{ id: 'p100', label: '100 Points' }] : []),
                          ...(totalPoints >= 500 ? [{ id: 'p500', label: 'Eco Champion' }] : []),
                        ]
                      : []
                  }
                  rewards={
                    totalPoints >= 200
                      ? [{ id: 'r1', label: '10% off local cafés', value: 'Unlocked' }]
                      : []
                  }
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-background pb-20">
            <WasteCalculator />
          </div>
        );
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
