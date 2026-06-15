import React, { useState } from 'react';
import { BinDayConfig } from '@/hooks/useBinDay';
import { useTranslations } from '@/hooks/useTranslations';

interface Props {
  initial?: BinDayConfig | null;
  onSave: (c: BinDayConfig) => void;
  onCancel: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BinDaySetup: React.FC<Props> = ({ initial, onSave, onCancel }) => {
  const { t } = useTranslations();
  const [postcode, setPostcode] = useState(initial?.postcode ?? '');
  const [collectionDay, setCollectionDay] = useState<number>(initial?.collectionDay ?? 2);
  const [generalAnchor, setGeneralAnchor] = useState<string>(
    initial?.generalAnchor ?? new Date().toISOString().slice(0, 10)
  );
  const [nudge, setNudge] = useState<boolean>(initial?.nudge ?? true);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl">
        <p className="font-serif font-bold text-lg text-[#1f1f1f]">{t('Set up #WhatWasteWhen')}</p>
        <p className="text-xs text-black/60 mb-3">
          {t('Tell us your collection day and your next black-bag (general) date — we’ll handle the rest.')}
        </p>

        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">{t('Postcode')}</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          placeholder="CF83 1WT"
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm mb-3"
        />

        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">{t('Collection day')}</label>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setCollectionDay(i)}
              className={`py-2 rounded-lg text-[11px] font-bold ${
                collectionDay === i ? 'bg-[#f4971d] text-white' : 'bg-black/5 text-[#1f1f1f]'
              }`}
            >
              {t(d)}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
          {t('Next general (black bag) collection')}
        </label>
        <input
          type="date"
          value={generalAnchor}
          onChange={(e) => setGeneralAnchor(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm mb-3"
        />

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={nudge}
            onChange={(e) => setNudge(e.target.checked)}
            className="accent-[#f4971d] h-4 w-4"
          />
          <span className="text-xs text-[#1f1f1f]">
            {t('Let Nelson nudge me the night before')}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg py-2 text-sm font-bold border border-black/10"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={() => onSave({ postcode, collectionDay, generalAnchor, nudge })}
            className="flex-1 rounded-lg py-2 text-sm font-bold text-white bg-[#f4971d]"
          >
            {t('Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BinDaySetup;
