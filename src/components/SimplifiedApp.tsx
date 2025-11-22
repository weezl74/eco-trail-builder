import React, { useState, useEffect } from 'react';
import { Home, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import { BusinessProfile } from './BusinessProfile';
import { BusinessProfilesGallery } from './BusinessProfilesGallery';

type UserMode = 'resident' | 'business';

interface SimplifiedAppProps {
  onBackToLanding?: () => void;
  initialMode?: UserMode;
}

const SimplifiedApp = ({ onBackToLanding, initialMode = 'resident' }: SimplifiedAppProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calculator');
  const [mode, setMode] = useState<UserMode>(initialMode);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // When mode changes, reset to calculator tab to show appropriate landing
  const handleModeChange = (newMode: UserMode) => {
    console.log('Mode changing to:', newMode);
    setMode(newMode);
    setActiveTab('calculator');
    console.log('Active tab set to calculator');
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('Current mode:', mode, 'Active tab:', activeTab);
  }, [mode, activeTab]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }

      // Load business data if exists
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (business) {
        setBusinessData(business);
      }
      
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        if (mode === 'business') {
          return <BusinessProfile 
            business={{
              business_name: businessData?.business_name || 'My Business',
              waste_footprint: businessData?.waste_footprint || 280,
              travel_footprint: businessData?.travel_footprint || 420,
              energy_footprint: businessData?.energy_footprint || 350,
              latitude: businessData?.latitude || 51.5775,
              longitude: businessData?.longitude || -3.2186,
              climate_goals: businessData?.climate_goals || 'Net Zero by 2030',
              pen_portrait: 'A forward-thinking business committed to sustainable practices and community engagement.'
            }}
          />;
        }
        return (
          <div className="min-h-screen bg-background pb-20">
            <WasteCalculator mode={mode} onModeChange={handleModeChange} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-roboto text-foreground">Dashboard</h1>
                <button
                  onClick={onBackToLanding}
                  className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
                >
                  <Home className="h-6 w-6 text-foreground" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-4">
                  <UserProgress 
                    currentFootprint={userProfile?.current_footprint || 0}
                    totalPoints={userProfile?.total_points || 0}
                    pledgesCompleted={0}
                    sprintsCompleted={0}
                    renewablesOwned={0}
                    userMode={mode}
                  />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <AvatarSystem 
                    totalPoints={userProfile?.total_points || 0}
                    userRenewables={0}
                    pledgesCompleted={0}
                  />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <CaerphillyMap 
                    userRenewables={[]}
                    totalPoints={userProfile?.total_points || 0}
                    currentFootprint={userProfile?.current_footprint || 0}
                  />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <RenewableShop 
                    totalPoints={userProfile?.total_points || 0}
                    userRenewables={[]}
                    onPurchase={() => {}}
                  />
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <TreePlanting 
                    totalPoints={userProfile?.total_points || 0}
                    onPointsUpdate={(newPoints) => {
                      if (userProfile) {
                        setUserProfile({
                          ...userProfile,
                          total_points: newPoints
                        });
                      }
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
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-roboto text-foreground">Leaderboard</h1>
                <button
                  onClick={onBackToLanding}
                  className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
                >
                  <Home className="h-6 w-6 text-foreground" />
                </button>
              </div>
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
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-roboto text-foreground">Sprint Challenges</h1>
                <button
                  onClick={onBackToLanding}
                  className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
                >
                  <Home className="h-6 w-6 text-foreground" />
                </button>
              </div>
              <div className="bg-card rounded-2xl p-4">
                <SprintChallenges />
              </div>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="min-h-screen bg-background pb-20">
            {mode === 'business' ? (
              <BusinessProfilesGallery />
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-roboto text-foreground">Community</h1>
                  <button
                    onClick={onBackToLanding}
                    className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
                  >
                    <Home className="h-6 w-6 text-foreground" />
                  </button>
                </div>
                <div className="bg-card rounded-2xl p-4">
                  <div className="flex items-center mb-4">
                    <Bug className="h-8 w-8 mr-3 text-wfg-yellow" />
                    <h2 className="text-xl font-roboto">Community Buzz</h2>
                  </div>
                  <CommunityStories />
                </div>
              </div>
            )}
          </div>
        );
      case 'knowledge':
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-roboto text-foreground">Knowledge & Quizzes</h1>
                <button
                  onClick={onBackToLanding}
                  className="p-2 rounded-xl bg-card hover:bg-card/90 transition-colors"
                >
                  <Home className="h-6 w-6 text-foreground" />
                </button>
              </div>
              <div className="bg-card rounded-2xl p-4">
                <div className="flex items-center mb-4">
                  <Bug className="h-8 w-8 mr-3 text-wfg-orange" />
                  <h2 className="text-xl font-roboto">Learn & Earn Points</h2>
                </div>
                <KnowledgeBase 
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
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
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mode={mode}
        onModeChange={handleModeChange}
      />
    </>
  );
};

export default SimplifiedApp;