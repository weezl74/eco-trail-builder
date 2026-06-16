import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import NelsonAvatar from '@/components/NelsonAvatar';
import { useSavings } from '@/hooks/useSavings';

interface AuthChoiceProps {
  onSelect: (choice: 'login' | 'register') => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onSelect }) => {
  const { t } = useTranslations();
  const { woolColor, accessories } = useSavings();
  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center pt-[18%] px-6 gap-6 overflow-hidden">
      <button
        onClick={() => onSelect('login')}
        className="w-full max-w-md bg-[#f5a623] hover:bg-[#e89a1f] active:scale-[0.98] transition rounded-2xl py-6 text-black text-2xl font-bold font-serif shadow-lg"
      >
        {t('Login')}
      </button>
      <button
        onClick={() => onSelect('register')}
        className="w-full max-w-md bg-[#f5a623] hover:bg-[#e89a1f] active:scale-[0.98] transition rounded-2xl py-6 text-black text-2xl font-bold font-serif shadow-lg"
      >
        {t('Register')}
      </button>

      {/* Nelson — bottom right */}
      <NelsonAvatar
        woolColor={woolColor}
        accessories={accessories}
        className="absolute bottom-4 right-4 w-40 h-40 pointer-events-none"
      />
    </div>
  );
};

export default AuthChoice;
