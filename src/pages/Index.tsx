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
  const { savings, pledged, woolPoints, treePoints, woolColor, accessories } = useSavings();
  const { t } = useTranslations();

  if (screen === "avatar") return <SheepAvatarScreen onBack={() => setScreen("home")} />;
  if (screen === "calendar") return <EventsCalendarScreen onBack={() => setScreen("home")} />;
  if (screen === "rewards") return <RewardsScreen onBack={() => setScreen("home")} />;
  if (screen === "messages") return <NelsonMessagesScreen onBack={() => setScreen("home")} />;
  if (screen === "groups") return <GroupsScreen onBack={() => setScreen("home")} />;

  return (
    <div className="h-[calc(100svh-5rem)] max-h-[calc(100svh-5rem)] bg-black pb-3 flex flex-col overflow-hidden">
      {/* ✅ ICON PILL */}
      <div className="pt-4 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-4 py-2 flex items-center gap-5 shadow-md">
          <button onClick={() => setScreen("messages")}>
            <Mail className="h-6 w-6 text-white opacity-90" />
          </button>
          <button onClick={() => setScreen("rewards")}>
            <Gift className="h-6 w-6 text-white opacity-90" />
          </button>
          <button onClick={() => setScreen("calendar")}>
            <Calendar className="h-6 w-6 text-white opacity-90" />
          </button>
          <button onClick={() => setScreen("avatar")}>
            <Shirt className="h-6 w-6 text-white opacity-90" />
          </button>
          <button onClick={() => setScreen("groups")}>
            <Users className="h-6 w-6 text-white opacity-90" />
          </button>
        </div>
      </div>

      {/* ✅ BIN DAY */}
      <BinDayBanner />

      {/* ✅ POINTS */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
        <div className="bg-[#1f1f1f] rounded-xl py-3 text-center font-serif">
          <p className="text-xs text-white opacity-60">{t("Wool Points")}</p>
          <p className="text-lg text-white font-bold">{woolPoints}</p>
        </div>
        <div className="bg-green-700 rounded-xl py-3 text-center font-serif">
          <p className="text-xs text-white opacity-60">{t("Tree Points")}</p>
          <p className="text-lg text-white font-bold">{treePoints}</p>
        </div>
      </div>

      {/* ✅ SAVINGS PANEL */}
      <div className="mx-4 mt-3 bg-[#1f1f1f] rounded-xl px-4 py-3 text-white font-serif">
        <p className="text-xs opacity-60 mb-2 text-center">{t("Estimated Savings")}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>£ {t("Money")}</span>
            <span className="font-bold">£{savings.money}</span>
          </div>

          <div className="flex justify-between">
            <span>CO₂</span>
            <span className="font-bold">{savings.co2} kg</span>
          </div>

          <div className="flex justify-between">
            <span>💧 {t("Water")}</span>
            <span className="font-bold">{savings.water} L</span>
          </div>

          <div className="flex justify-between text-[#f5a623]">
            <span>✓ {t("Pledges")}</span>
            <span className="font-bold">{pledged.length}</span>
          </div>
        </div>
      </div>

      {/* ✅ SCENE */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-[#1f1f1f] relative flex-1 min-h-0">
        <img src={badHomepageAsset.url} alt="Environmental impact scene" className="w-full h-full object-cover" />

        {/* ✅ SHEEP — SLIGHTLY HIGHER */}
        <NelsonAvatar
          woolColor={woolColor}
          accessories={accessories}
          className="absolute bottom-[88px] left-2 w-2/5 aspect-square pointer-events-none"
        />
      </div>

      {/* ✅ CTA */}
      <div className="mx-4 mt-3 flex justify-center">
        <button
          onClick={onGoToPledges}
          className="bg-[#f5a623] hover:bg-[#e69517] active:scale-95 transition text-black font-serif font-bold text-lg rounded-xl px-8 py-3 shadow-lg w-full"
        >
          {t("Save Me More")}
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
