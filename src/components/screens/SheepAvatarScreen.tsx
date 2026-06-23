import React from "react";
import { ArrowLeft } from "lucide-react";

import NelsonAvatar from "@/components/NelsonAvatar";
import { useSavings } from "@/hooks/useSavings";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type Props = {
  onBack?: () => void;
};

const SheepAvatarScreen: React.FC<Props> = ({ onBack }) => {
  const { accessories, woolPoints } = useSavings();
  const { sheepHead, setSheepHead } = useUserPreferences();

  return (
    <div className="min-h-screen bg-[#F4971D] p-4">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="mb-4 flex items-center gap-2 font-bold text-black">
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      )}

      {/* Points */}
      <div className="text-center font-bold text-black mb-4">Wool Points: {woolPoints}</div>

      {/* Head selector */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setSheepHead("nelson")}
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            sheepHead === "nelson" ? "bg-black text-[#F4971D]" : "bg-white text-black"
          }`}
        >
          Nelson
        </button>

        <button
          onClick={() => setSheepHead("barb")}
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            sheepHead === "barb" ? "bg-black text-[#F4971D]" : "bg-white text-black"
          }`}
        >
          Barb
        </button>
      </div>

      {/* ✅ Avatar ONLY (clean container) */}
      <div className="flex justify-center">
        <div className="w-64 h-64 border border-white/40 rounded-lg flex items-center justify-center">
          <NelsonAvatar accessories={accessories} head={sheepHead} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default SheepAvatarScreen;
