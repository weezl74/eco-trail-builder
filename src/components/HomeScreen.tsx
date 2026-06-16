import React, { useState } from 'react';
import { Mail, Gift, Calendar, Shirt } from 'lucide-react';
import SheepAvatarScreen from './screens/SheepAvatarScreen';
import EventsCalendarScreen from './screens/EventsCalendarScreen';
import RewardsScreen from './screens/RewardsScreen';
import NelsonMessagesScreen from './screens/NelsonMessagesScreen';
import { useSavings } from '@/hooks/useSavings';
import { useTranslations } from '@/hooks/useTranslations';
import badHomepageAsset from '@/assets/final-bad-homepage.svg.asset.json';
import NelsonAvatar from './NelsonAvatar';
import BinDayBanner from './BinDayBanner';

type Screen = 'home' | 'avatar' | 'calendar' | 'rewards' | 'messages';

const HomeScreen: React.FC<{ onGoToPledges?: () => void }> = ({ onGoToPledges }) => {
  const [screen, setScreen] = useState<Screen>('home');
  const { savings, pledged, woolPoints, treePoints, woolColor, accessories } = useSavings();
  const { t } = useTranslations();

  if (screen === 'avatar') return <SheepAvatarScreen onBack={() => setScreen('home')} />;
  if (screen === 'calendar') return <EventsCalendarScreen onBack={() => setScreen('home')} />;
  if (screen === 'rewards') return <RewardsScreen onBack={() => setScreen('home')} />;
  if (screen === 'messages') return <NelsonMessagesScreen onBack={() => setScreen('home')} />;

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col">
      {/* Pill of icons */}
      <div className="pt-4 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-5 py-2 flex items-center gap-5 shadow-lg">
          <button onClick={() => setScreen('messages')} aria-label="Messages from Nelson">
            <Mail className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen('rewards')} aria-label="Your rewards">
            <Gift className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen('calendar')} aria-label="Events and achievements">
            <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen('avatar')} aria-label="Customise sheep">
            <Shirt className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Nelson's nighttime nudge — only shows on bin-eve after 6pm */}
      <BinDayBanner />

      {/* Points balances */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
        <div className="bg-[#f5a623] rounded-2xl py-2 px-3 text-center text-black font-serif font-bold">
          <div className="text-2xl leading-tight">{woolPoints}</div>
          <div className="text-[10px] uppercase tracking-wide">{t('Wool Points')}</div>
        </div>
        <div className="bg-green-700 rounded-2xl py-2 px-3 text-center text-white font-serif font-bold">
          <div className="text-2xl leading-tight">{treePoints}</div>
          <div className="text-[10px] uppercase tracking-wide">{t('Tree Points')}</div>
        </div>
      </div>

      {/* Estimated savings card */}
      <div className="mx-4 mt-3 bg-[#1f1f1f] rounded-2xl p-3 text-white">
        <h2 className="font-serif font-bold text-base text-center mb-1.5">{t('Estimated Savings')}</h2>
        <div className="space-y-1 font-serif font-bold text-sm">
          <p className="flex items-center gap-2"><span className="text-yellow-400 text-lg">£</span> {t('Money')}: £{savings.money}</p>
          <p className="flex items-center gap-2"><span className="text-red-400 text-xs font-mono">CO₂e</span> CO₂e: {savings.co2} kg</p>
          <p className="flex items-center gap-2"><span className="text-blue-400 text-lg">💧</span> {t('Water')}: {savings.water}L</p>
          <p className="flex items-center gap-2 text-[#f5a623]"><span className="text-lg">✓</span> {t('Pledges made')}: {pledged.length}</p>
        </div>
      </div>

      {/* Illustration */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-[#1f1f1f] relative flex-1 min-h-0">
        <img
          src={badHomepageAsset.url}
          alt="A scene showing the impact of pollution and unsustainable choices"
          className="w-full h-full object-cover block"
          loading="lazy"
        />
        {/* Nelson overlay — bottom left */}
        <NelsonAvatar
          woolColor={woolColor}
          accessories={accessories}
          className="absolute bottom-2 left-2 w-2/5 aspect-square pointer-events-none"
        />
      </div>

      {/* CTA */}
      <div className="mx-4 mt-3 flex justify-center">
        <button
          onClick={onGoToPledges}
          className="bg-[#f5a623] hover:bg-[#e69517] active:scale-95 transition text-black font-serif font-bold text-base rounded-2xl px-8 py-3 shadow-lg w-full max-w-sm"
        >
          {t('Save Me More')}
        </button>
      </div>

    </div>
  );
};

export default HomeScreen;
