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

  // ✅ TEST STATE
  const [hat, setHat] = useState<string | null>(null);
  const [glasses, setGlasses] = useState<string | null>(null);

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

      {/* Illustration */}
      <div className="mx-4 mt-2 rounded-2xl overflow-hidden bg-[#1f1f1f] relative h-[300px]">
        {/* ✅ LAYER STACK TEST */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[200px] h-[200px]">
            {/* BODY */}
            <img src="/body-base.svg" className="absolute inset-0 w-full h-full object-contain" />

            {/* GLASSES */}
            {glasses && (
              <img src={`/glasses-${glasses}.svg`} className="absolute inset-0 w-full h-full object-contain" />
            )}

            {/* HAT */}
            {hat && <img src={`/hat-${hat}.svg`} className="absolute inset-0 w-full h-full object-contain" />}

            {/* Crosshair */}
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-red-400 opacity-30" />
            <div className="absolute top-1/2 left-0 h-[1px] w-full bg-red-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* ✅ CONTROLS */}
      <div className="mx-4 mt-4 text-white space-y-3">
        <div>
          <div className="mb-1">Hats</div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setHat(null)} className="px-2 py-1 bg-gray-700 rounded">
              None
            </button>
            <button onClick={() => setHat("cap")} className="px-2 py-1 bg-gray-700 rounded">
              Cap
            </button>
            <button onClick={() => setHat("pirate")} className="px-2 py-1 bg-gray-700 rounded">
              Pirate
            </button>
            <button onClick={() => setHat("sun")} className="px-2 py-1 bg-gray-700 rounded">
              Sun
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1">Glasses</div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setGlasses(null)} className="px-2 py-1 bg-gray-700 rounded">
              None
            </button>
            <button onClick={() => setGlasses("basic")} className="px-2 py-1 bg-gray-700 rounded">
              Basic
            </button>
            <button onClick={() => setGlasses("star")} className="px-2 py-1 bg-gray-700 rounded">
              Star
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
``;
