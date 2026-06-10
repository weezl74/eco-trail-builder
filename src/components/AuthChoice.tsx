import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface AuthChoiceProps {
  onSelect: (choice: 'login' | 'register') => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onSelect }) => {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-[18%] px-6 gap-6">
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
    </div>
  );
};

export default AuthChoice;
