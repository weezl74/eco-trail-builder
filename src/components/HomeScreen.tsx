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
    <div className="h-[calc(100svh-5rem)] bg-black pb-2 flex flex-col overflow-hidden">
      {/* Pill of icons */}
      <div className="pt-3 flex justify-center">
        <div className="bg-[#f5a623] rounded-full px-4 py-2 flex items-center gap-4 shadow-lg">
          <button onClick={() => setScreen("messages")} aria-label="Messages from Nelson">
            <Mail className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen("rewards")} aria-label="Your rewards">
            <Gift className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen("calendar")} aria-label="Events and achievements">
            <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen("avatar")} aria-label="Customise sheep">
            <Shirt className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
          <button onClick={() => setScreen("groups")} aria-label="Groups">
            <Users className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Nelson's nighttime nudge — only shows on bin-eve after 6pm */}
      <BinDayBanner />

      {/* Points balances */}
      <div className="mx-4 mt-1.5 grid grid-cols-2 gap-1.5">
        <div className="bg-[#f5a623] rounded-xl py-1.5 px-2 text-center text-black font-serif font-bold">
          <div className="text-xl leading-tight">{woolPoints}</div>
          <div className="text-[9px] uppercase tracking-wide">{t("Wool Points")}</div>
        </div>
        <div className="bg-green-700 rounded-xl py-1.5 px-2 text-center text-white font-serif font-bold">
          <div className="text-xl leading-tight">{treePoints}</div>
          <div className="text-[9px] uppercase tracking-wide">{t("Tree Points")}</div>
        </div>
      </div>

      {/* Estimated savings card */}
      <div className="mx-4 mt-1.5 bg-[#1f1f1f] rounded-xl px-3 py-1.5 text-white">
        <h2 className="font-serif font-bold text-sm text-center mb-1">{t("Estimated Savings")}</h2>
        <div className="space-y-0.5 font-serif font-bold text-xs">
          <p className="flex items-center gap-2">
            <span className="text-yellow-400 text-base">£</span> {t("Money")}: £{savings.money}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-red-400 text-[10px] font-mono">CO₂e</span> CO₂e: {savings.co2} kg
          </p>
          <p className="flex items-center gap-2">
            <span className="text-blue-400 text-base">💧</span> {t("Water")}: {savings.water}L
          </p>
          <p className="flex items-center gap-2 text-[#f5a623]">
            <span className="text-base">✓</span> {t("Pledges made")}: {pledged.length}
          </p>
        </div>
      </div>

      {/* Illustration */}

      {/* Illustration */}

      {/* Illustration */}
      <div className="mx-4 mt-1.5 rounded-2xl overflow-hidden bg-[#1f1f1f] relative flex-1 min-h-0">
        <img
          src={badHomepageAsset.url}
          alt="A scene showing the impact of pollution and unsustainable choices"
          className="w-full h-full object-cover object-bottom"
          loading="lazy"
        />

        {/* subtle gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* ✅ Nelson - bigger + left-aligned */}
        <NelsonAvatar
          woolColor={woolColor}
          accessories={accessories}
          className="absolute bottom-10 left-2 w-72 h-72 pointer-events-none"
        />
      </div>

      {/* CTA */}
      <div className="mx-4 mt-2 flex justify-center">
        <button
          onClick={onGoToPledges}
          className="bg-[#f5a623] hover:bg-[#e69517] active:scale-95 transition text-black font-serif font-bold text-base rounded-xl px-8 py-2.5 shadow-lg w-full max-w-sm"
        >
          {t("Save Me More")}
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
