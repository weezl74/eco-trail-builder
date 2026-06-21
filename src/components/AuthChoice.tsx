import React, { useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import NelsonAvatar from '@/components/NelsonAvatar';
import { useSavings } from '@/hooks/useSavings';
import QuoteCard from '@/components/QuoteCard';
import { CLIMATE_QUOTES } from '@/data/climateQuotes';

interface AuthChoiceProps {
  onSelect: (choice: 'login' | 'register') => void;
}

// Pick N distinct random items.
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onSelect }) => {
  const { t } = useTranslations();
  const { woolColor, accessories } = useSavings();

  const quotes = useMemo(() => pickN(CLIMATE_QUOTES, 2), []);

  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center pt-[14%] pb-6 px-6 gap-5 overflow-hidden">
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

      <div className="w-full max-w-md flex flex-col gap-2 mt-2">
        {quotes.map((q) => (
          <QuoteCard key={q.id} quote={q} />
        ))}
      </div>

      {/* Nelson — centered below quotes */}
      <NelsonAvatar
        woolColor={woolColor}
        accessories={accessories}
        className="w-32 h-32 mt-2 pointer-events-none"
      />
    </div>
  );
};

export default AuthChoice;
