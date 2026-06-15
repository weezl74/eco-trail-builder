import React from 'react';
import { Moon } from 'lucide-react';
import { useBinDay, nextCollection } from '@/hooks/useBinDay';
import { useTranslations } from '@/hooks/useTranslations';

const BinDayBanner: React.FC = () => {
  const { config } = useBinDay();
  const { t } = useTranslations();
  if (!config || !config.nudge) return null;

  const now = new Date();
  const next = nextCollection(config, now);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const isEveBefore = next.date.getTime() === tomorrow.getTime() && now.getHours() >= 18;
  if (!isEveBefore) return null;

  const bins = [
    'Recycling',
    'Food & Garden',
    next.general ? 'General (black bag)' : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="mx-4 mt-3 bg-[#1a2742] rounded-2xl p-3 text-white flex items-center gap-3 shadow-lg">
      <Moon className="h-5 w-5 text-[#f4971d] flex-shrink-0" />
      <div className="text-xs leading-snug">
        <p className="font-bold">{t('Nelson’s nighttime nudge')}</p>
        <p className="opacity-90">{t('Bins out tomorrow')}: {t(bins)}</p>
      </div>
    </div>
  );
};

export default BinDayBanner;
