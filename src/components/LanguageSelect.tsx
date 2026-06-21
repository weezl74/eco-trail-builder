import React, { useMemo } from 'react';
import { CLIMATE_QUOTES } from '@/data/climateQuotes';
import QuoteCard from '@/components/QuoteCard';

interface LanguageSelectProps {
  onSelect: (lang: 'cy' | 'en') => void;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelect }) => {
  // Pick one quote per session — stable across rerenders.
  const quote = useMemo(
    () => CLIMATE_QUOTES[Math.floor(Math.random() * CLIMATE_QUOTES.length)],
    [],
  );

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center pt-[18%] px-6 gap-6">
      <button
        onClick={() => onSelect('cy')}
        className="w-full max-w-md bg-[#f5a623] hover:bg-[#e89a1f] active:scale-[0.98] transition rounded-2xl py-6 text-black text-2xl font-bold font-serif shadow-lg"
      >
        Cymraeg
      </button>
      <button
        onClick={() => onSelect('en')}
        className="w-full max-w-md bg-[#f5a623] hover:bg-[#e89a1f] active:scale-[0.98] transition rounded-2xl py-6 text-black text-2xl font-bold font-serif shadow-lg"
      >
        English
      </button>

      <QuoteCard quote={quote} bilingual className="max-w-md mt-4" />
    </div>
  );
};

export default LanguageSelect;
