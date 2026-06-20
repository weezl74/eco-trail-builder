import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  techName: string;
  explanation: string;
  stars: number; // 1-3
  pointsAwarded?: number;
}

const TechRewardDialog: React.FC<Props> = ({ open, onClose, techName, explanation, stars, pointsAwarded }) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm bg-[#1f1f1f] text-white border-2 border-[#F4971D] rounded-3xl p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white/70 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-[#F4971D] py-6 px-6 text-center">
          <h2 className="font-serif font-bold text-2xl text-[#1f1f1f]">{techName}</h2>
          <p className="text-[#1f1f1f]/80 text-sm mt-1">Installed on the Borough</p>
        </div>
        <div className="px-6 py-5 space-y-4 text-center">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-9 h-9 ${n <= stars ? 'fill-[#F4971D] text-[#F4971D]' : 'text-white/30'}`}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-sm text-white/90 leading-relaxed">{explanation}</p>
          {pointsAwarded ? (
            <p className="text-[#F4971D] font-bold">+{pointsAwarded} bonus points</p>
          ) : null}
          <Button
            onClick={onClose}
            className="w-full rounded-2xl bg-[#F4971D] hover:bg-[#e08914] text-[#1f1f1f] font-bold"
          >
            Brilliant!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechRewardDialog;
