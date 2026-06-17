import React from 'react';
import { Footprints, Trophy } from 'lucide-react';
import { useBusinessStamps } from '@/hooks/useBusinessStamps';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface Props {
  businessCardId: string;
  stampsRequired: number;
  rewardText: string;
}

const LoyaltyCardBody: React.FC<Props> = ({ businessCardId, stampsRequired, rewardText }) => {
  const { t } = useTranslations();
  const { toast } = useToast();
  const { getStamps, addStamp } = useBusinessStamps();
  const stamps = getStamps(businessCardId);
  const complete = stamps >= stampsRequired;

  const handle = async (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (idx !== stamps || complete) return;
    const next = await addStamp(businessCardId, stampsRequired);
    if (next >= stampsRequired) {
      toast({ title: t('Reward unlocked!'), description: rewardText });
    } else {
      toast({ title: t('Stamp earned'), description: `${next} / ${stampsRequired}` });
    }
  };

  return (
    <div className="mt-3 bg-white/15 rounded-xl p-3 backdrop-blur space-y-2">
      <div>
        <p className="text-[10px] opacity-80 uppercase tracking-wider">{t('Reward')}</p>
        <p className="text-sm leading-snug">{rewardText}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: stampsRequired }).map((_, i) => {
          const stamped = i < stamps;
          const isReward = i === stampsRequired - 1;
          const isNext = i === stamps && !complete;
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => handle(e, i)}
              disabled={!isNext}
              className={`relative h-7 w-7 rounded-full border-2 flex items-center justify-center transition ${
                stamped
                  ? 'border-[#f4971d] bg-[#f4971d]/40'
                  : isReward && complete
                    ? 'border-yellow-300 bg-yellow-300/40'
                    : isReward
                      ? 'border-dashed border-yellow-300/80 bg-yellow-300/10'
                      : isNext
                        ? 'border-white/80 bg-white/20 animate-pulse'
                        : 'border-white/30 bg-white/5'
              }`}
            >
              {stamped ? (
                <span className="text-[7px] font-bold">✓</span>
              ) : isReward ? (
                <Trophy className="h-3 w-3 text-yellow-200" />
              ) : isNext ? (
                <Footprints className="h-3 w-3" />
              ) : (
                <span className="text-[8px] opacity-50">{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] opacity-70 leading-none">
        {complete ? t('Show this card to redeem your reward.') : t('Tap the glowing stamp on each visit.')}
      </p>
    </div>
  );
};

export default LoyaltyCardBody;
