import React, { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import NelsonAvatar from "@/components/NelsonAvatar";
import { useSavings } from "@/hooks/useSavings";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTranslations } from "@/hooks/useTranslations";

type Accessory = {
  id: string;
  label: string;
  cost: number;
};

const ACCESSORIES: Accessory[] = [
  { id: "cap", label: "Cap", cost: 40 },
  { id: "pirateHat", label: "Pirate Hat", cost: 70 },
  { id: "sunhat", label: "Sun Hat", cost: 35 },

  { id: "glasses", label: "Glasses", cost: 40 },
  { id: "starGlasses", label: "Star Glasses", cost: 55 },

  { id: "mohawk", label: "Mohawk", cost: 55 },
  { id: "bowtie", label: "Bow Tie", cost: 30 },
];

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  const { woolPoints, accessories, buyAccessory } = useSavings();
  const { sheepHead: head, setSheepHead } = useUserPreferences();

  const [selected, setSelected] = useState<string[]>(accessories);

  const has = (id: string) => selected.includes(id);

  const toggleAccessory = (id: string) => {
    if (!has(id)) {
      if (woolPoints >= (ACCESSORIES.find((a) => a.id === id)?.cost || 0)) {
        buyAccessory(id, ACCESSORIES.find((a) => a.id === id)!.cost);
        setSelected([...selected, id]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4971D] px-4 pt-4 pb-24">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="text-black flex items-center gap-1 font-serif font-bold mb-2">
          <ArrowLeft className="h-5 w-5" /> {t("Back")}
        </button>
      )}

      {/* Points */}
      <div className="text-center font-serif font-bold text-black mb-4">
        {t("Wool Points")}: {woolPoints}
      </div>

      {/* Head selector */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={() => setSheepHead("nelson")}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            head === "nelson" ? "bg-black text-[#F4971D]" : "bg-white text-black"
          }`}
        >
          Nelson
        </button>

        <button
          onClick={() => setSheepHead("barb")}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            head === "barb" ? "bg-black text-[#F4971D]" : "bg-white text-black"
          }`}
        >
          Barb
        </button>
      </div>

      {/* ✅ AVATAR (clean, nothing else here!) */}
      <div className="flex justify-center mb-4">
        <div className="w-64 h-64 border border-white/40 rounded-lg flex items-center justify-center">
          <NelsonAvatar accessories={selected} head={head} className="w-full h-full" />
        </div>
      </div>

      {/* Accessories */}
      <div className="bg-[#3a3a3a] rounded-xl p-3">
        <p className="text-white font-serif font-bold mb-2">{t("Accessories")}</p>

        <div className="grid grid-cols-2 gap-3">
          {ACCESSORIES.map((a) => {
            const owned = accessories.includes(a.id);
            const afford = woolPoints >= a.cost;

            return (
              <button
                key={a.id}
                onClick={() => toggleAccessory(a.id)}
                disabled={!owned && !afford}
                className={`rounded-xl p-3 text-xs font-serif font-bold flex flex-col items-center gap-2 ${
                  owned ? "bg-[#F4971D] text-black" : afford ? "bg-white text-black" : "bg-white/30 text-white"
                }`}
              >
                <span className="text-lg">{a.label}</span>

                <span className="text-[10px] flex items-center gap-1">
                  {!owned && !afford && <Lock className="h-3 w-3" />}
                  {owned ? "✓ owned" : `${a.cost} wool`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SheepAvatarScreen;
