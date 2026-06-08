import React from 'react';

interface LanguageSelectProps {
  onSelect: (lang: 'cy' | 'en') => void;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ onSelect }) => {
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
    </div>
  );
};

export default LanguageSelect;
