import React, { useState } from "react";
import { Mail, Gift, Calendar, Shirt, Users } from "lucide-react";
import SheepAvatarScreen from "./screens/SheepAvatarScreen";
import EventsCalendarScreen from "./screens/EventsCalendarScreen";
import RewardsScreen from "./screens/RewardsScreen";
import NelsonMessagesScreen from "./screens/NelsonMessagesScreen";
import GroupsScreen from "./screens/GroupsScreen";
import { useSavings } from "@/hooks/useSavings";
import { useTranslations } from "@/hooks/useTranslations";
import badHomepageAsset from "@/assets/final-bad-homepage.svg.asset.json";
import NelsonAvatar from "./NelsonAvatar";
import BinDayBanner from "./BinDayBanner";

type Screen = "home" | "avatar" | "calendar" | "rewards" | "messages" | "groups";

const HomeScreen: React.FC<{ onGoToPledges?: () => void }> = ({ onGoToPledges }) => {
  const [screen, setScreen] = useState<Screen>("home");

  // ✅ SVG TEST STATE (UPDATED FILES)
  const [testSvg, setTestSvg] = useState("/Frame_83.svg");

  const { savings, pledged, woolPoints, treePoints, woolColor, accessories } = useSavings();
  const { t } = useTranslations();

  if (screen === "avatar") return <SheepAvatarScreen onBack={() => setScreen("home")} />;
  if (screen === "calendar") return <EventsCalendarScreen onBack={() => setScreen("home")} />;
  if (screen === "rewards") return <RewardsScreen onBack={() => setScreen("home")} />;
  if (screen === "messages") return <NelsonMessagesScreen onBack={() => setScreen("home")} />;
  if (screen === "groups") return <GroupsScreen onBack={() => setScreen("home")} />;

  return (
    <div className="h-[calc(100svh-5rem)] bg-black pb-2 flex flex-col overflow-y-auto">
      {/* Icon pill */}
      <div className="pt-3 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-4 py-2 flex items-center gap-4 shadow-lg">
          <button onClick={() => setScreen("messages")}>
            <Mail className="h-6 w-6 text-white" />
          </button>
          <button onClick={() => setScreen("rewards")}>
            <Gift className="h-6 w-6 text-white" />
          </button>
          <button onClick={() => setScreen("calendar")}>
            <Calendar className="h-6 w-6 text-white" />
          </button>
          <button onClick={() => setScreen("avatar")}>
            <Shirt className="h-6 w-6 text-white" />
          </button>
          <button onClick={() => setScreen("groups")}>
            <Users className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      <BinDayBanner />

      {/* Points */}
      <div className="mx-4 mt-1.5 grid grid-cols-2 gap-1.5">
        <div className="bg-[#f5a623] rounded-xl py-1.5 px-2 text-center text-black font-bold">
          <div>{woolPoints}</div>
          <div className="text-[9px]">{t("Wool Points")}</div>
        </div>
        <div className="bg-green-700 rounded-xl py-1.5 px-2 text-center text-white font-bold">
          <div>{treePoints}</div>
          <div className="text-[9px]">{t("Tree Points")}</div>
        </div>
      </div>

      {/* Savings */}
      <div className="mx-4 mt-1.5 bg-[#1f1f1f] rounded-xl px-3 py-1.5 text-white text-xs">
        <div>
          {t("Money")}: £{savings.money}
        </div>
        <div>CO₂e: {savings.co2}</div>
        <div>
          {t("Water")}: {savings.water}
        </div>
        <div>
          {t("Pledges made")}: {pledged.length}
        </div>
      </div>

      {/* Illustration */}
      <div className="mx-4 mt-1.5 rounded-2xl overflow-hidden bg-[#1f1f1f] relative flex-1">
        {badHomepageAsset.url}

        {/* Nelson stable */}
        <NelsonAvatar
          woolColor={woolColor}
          accessories={accessories}
          className="absolute bottom-28 -left-2 w-[180px] h-[180px]"
        />
      </div>

      {/* CTA */}
      <div className="mx-4 mt-2">
        <button onClick={onGoToPledges} className="bg-[#f5a623] w-full py-3 rounded-xl">
          {t("Save Me More")}
        </button>
      </div>

      {/* ✅ SVG TESTER */}
      <div className="mx-4 mt-6 mb-6 bg-white p-4 rounded-xl">
        <div className="text-center font-bold mb-2">SVG Alignment Tester</div>

        <div className="w-[200px] h-[200px] border mx-auto mb-3 relative">
          <img src={testSvg} className="w-full h-full object-contain" />

          {/* crosshair */}
          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-red-400 opacity-30" />
          <div className="absolute top-1/2 left-0 h-[1px] w-full bg-red-400 opacity-30" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setTestSvg("/Frame_83.svg")}>Frame 83</button>
          <button onClick={() => setTestSvg("/Frame_83_1.svg")}>Frame 83 (1)</button>
          <button onClick={() => setTestSvg("/Group_6380.svg")}>Group 6380</button>
          <button onClick={() => setTestSvg("/Group_6380-2.svg")}>Group 6380 (alt)</button>
          <button onClick={() => setTestSvg("/Group_6385.svg")}>Group 6385</button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
