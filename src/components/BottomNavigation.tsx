import React from 'react';
import { Calculator, LayoutDashboard, Trophy, Timer, Users, Bug, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  // Legacy props (resident-only build ignores these)
  mode?: 'resident' | 'business';
  onModeChange?: (mode: 'resident' | 'business') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'calculator', icon: Calculator, color: 'bg-wfg-blue' },
    { id: 'dashboard', icon: LayoutDashboard, color: 'bg-wfg-purple' },
    { id: 'leaderboard', icon: Trophy, color: 'bg-wfg-green' },
    { id: 'sprints', icon: Timer, color: 'bg-wfg-red' },
    { id: 'community', icon: Users, color: 'bg-wfg-yellow' },
    { id: 'account', icon: UserCircle, color: 'bg-wfg-orange' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex bg-black/20 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 h-16 ${tab.color} flex items-center justify-center transition-all duration-300 relative ${
                isActive ? 'transform -translate-y-2 rounded-t-2xl shadow-xl' : ''
              }`}
            >
              <Icon className={`h-6 w-6 text-white ${isActive ? 'scale-125' : ''} transition-transform`} />
            </button>
          );
        })}
      </div>

      <div className="absolute top-2 left-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange('landing')}
          className="h-6 w-6 p-0 opacity-60 hover:opacity-90 transition-opacity rounded-xl"
        >
          <Bug className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;
