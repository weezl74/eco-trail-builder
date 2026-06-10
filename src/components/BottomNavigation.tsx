import React from 'react';
import { Home, Timer, Calculator, Users, UserCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode?: 'resident' | 'business';
  onModeChange?: (mode: 'resident' | 'business') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslations();
  const tabs = [
    { id: 'home', label: t('Home'), icon: Home },
    { id: 'challenges', label: t('Challenges'), icon: Timer },
    { id: 'calculator', label: t('Calculator'), icon: Calculator },
    { id: 'community', label: t('Community'), icon: Users },
    { id: 'account', label: t('Account'), icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#8a8a8a] border-t border-black/20">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = isActive ? '#f5a623' : '#ffffff';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 py-2 flex flex-col items-center justify-center gap-0.5"
            >
              {tab.id === 'account' && isActive ? (
                <div className="w-7 h-7 rounded-full bg-[#f5a623] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              ) : tab.id === 'account' ? (
                <div className="w-7 h-7 rounded-full bg-white" />
              ) : (
                <Icon className="h-6 w-6" style={{ color }} strokeWidth={2} />
              )}
              <span
                className="text-xs font-serif font-bold"
                style={{ color }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
