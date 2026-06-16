import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { BusinessCarbonReport } from '@/components/BusinessCarbonReport';
import { BusinessCommunity } from '@/components/BusinessCommunity';
import BusinessHomeScreen from './BusinessHomeScreen';
import BusinessActionsScreen from './BusinessActionsScreen';
import BusinessAccountScreen from './BusinessAccountScreen';

interface Props {
  onSignOut?: () => void;
  onEditCard: () => void;
}

const BusinessApp: React.FC<Props> = ({ onSignOut, onEditCard }) => {
  const [tab, setTab] = useState('home');
  const [initialAction, setInitialAction] = useState<string | null>(null);

  const render = () => {
    switch (tab) {
      case 'home':
        return <BusinessHomeScreen onGoToActions={() => { setInitialAction('pledges'); setTab('challenges'); }} />;
      case 'challenges':
        return <BusinessActionsScreen initialView={initialAction} key={initialAction ?? 'root'} />;
      case 'calculator':
        return (
          <div className="min-h-screen bg-background pb-24">
            <BusinessCarbonReport />
          </div>
        );
      case 'community':
        return (
          <div className="min-h-screen bg-background pb-24">
            <BusinessCommunity />
          </div>
        );
      case 'account':
        return <BusinessAccountScreen onSignOut={onSignOut} onEditCard={onEditCard} />;
      default:
        return null;
    }
  };

  return (
    <>
      {render()}
      <BottomNavigation
        activeTab={tab}
        onTabChange={(t) => { setInitialAction(null); setTab(t); }}
      />
    </>
  );
};

export default BusinessApp;
