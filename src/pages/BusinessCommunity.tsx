import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessCommunityPledges } from '@/components/BusinessCommunityPledges';
import BottomNavigation from '@/components/BottomNavigation';

const BusinessCommunityPage = () => {
  const [activeTab, setActiveTab] = useState('community');
  const [mode, setMode] = useState<'resident' | 'business'>('business');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    if (tab === 'community') {
      setActiveTab(tab);
    } else {
      // Navigate back to main app for other tabs
      navigate('/');
    }
  };

  return (
    <>
      <BusinessCommunityPledges />
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        mode={mode}
        onModeChange={setMode}
      />
    </>
  );
};

export default BusinessCommunityPage;
