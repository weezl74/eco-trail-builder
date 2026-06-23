import React from "react";
import NelsonAvatar from "@/components/NelsonAvatar";

type Props = {
  onBack?: () => void;
};

const SheepAvatarScreen: React.FC<Props> = () => {
  return (
    <div className="min-h-screen bg-[#F4971D] p-4">
      <div className="flex justify-center mt-10">
        <div className="w-64 h-64 border border-white/40 rounded-lg">
          <NelsonAvatar accessories={[]} head="nelson" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default SheepAvatarScreen;
