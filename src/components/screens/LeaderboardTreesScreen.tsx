import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucude-react";
import nelsonHead from "@/assets/sheep/NelsonHead.svg.asset.json";

import { useToast } from "@/hooks/use-toast";
import { useSavings } from "@/hooks/useSavings";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { fetchLeaderboard, type ApiLeaderboardEntry } from "@/lib/api";

type Mode = "wool" | "tree";

interface Row {
  user_id: string;
  name: string;
  points: number;
  isMe?: boolean;
}

// ✅ Oak tree icon
const OakTreeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <g fill="#3f8a3a">
      <circle cx="32" cy="20" r="14" />
      <circle cx="18" cy="26" r="11" />
      <circle cx="46" cy="26" r="11" />
      <circle cx="24" cy="34" r="10" />
      <circle cx="40" cy="34" r="10" />
      <circle cx="32" cy="32" r="12" />
    </g>
    <rect x="29" y="38" width="6" height="18" rx="1.5" fill="#6b4226" />
    <ellipse cx="32" cy="58" rx="14" ry="2.5" fill="#3a2a1a" opacity="0.35" />
  </svg>
);

const LeaderboardTreesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>("wool");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);

  const { toast } = useToast();
  const { treesPlanted, plantTree } = useSavings();
  const { t } = useTranslations();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data: ApiLeaderboardEntry[] = await fetchLeaderboard(100);
        if (cancelled) return;

        const mapped: Row[] = data
          .map((u) => {
            const isMe = u.user_id === user?.id;
            const wool = Number(u.wool_points) || 0;
            const tree = Number(u.tree_points) || 0;

            return {
              user_id: u.user_id,
              name: u.display_name || u.username || `User ${String(u.user_id).slice(0, 6)}`,
              points: mode === "wool" ? wool : tree,
              isMe,
            };
          })
          .sort((a, b) => b.points - a.points);

        setRows(mapped);
        setError(false);
      } catch {
        if (cancelled) return;
        setRows([]);
        setError(true);
      }
    };

    load();
    window.addEventListener("points:updated", load);

    return () => {
      cancelled = true;
      window.removeEventListener("points:updated", load);
    };
  }, [mode, user?.id]);

  const heading = mode === "wool" ? t("WOOL POINTS") : t("TREE POINTS");

  const join = () => {
    if (plantTree(100)) {
      toast({
        title: t("Joined the Tree Queue!"),
        description: t("A tree will be planted on your behalf."),
      });
    } else {
      toast({
        title: t("Not enough Tree Points"),
        description: t("100 Tree Points required."),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5a623] pb-20 px-4 pt-3">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="text-black mb-2 flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t("Back")}
        </button>
      )}

      {/* ✅ HEADER */}
      <div className="text-center text-black font-serif mb-4">
        <p className="text-sm opacity-70">Estimated Impact</p>
        <p className="text-xl font-bold">25,500 kg CO₂e</p>
      </div>

      {/* ✅ TOGGLE */}
      <div className="bg-[#1f1f1f] rounded-full mt-3 p-1 flex text-sm font-serif font-bold">
        {(["wool", "tree"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-full transition ${
              mode === m ? "bg-[#f5a623] text-black" : "text-white opacity-80"
            }`}
          >
            {m === "wool" ? t("Wool Points") : t("Tree Points")}
          </button>
        ))}
      </div>

      {/* ✅ LEADERBOARD */}
      <div className="bg-[#1f1f1f] rounded-2xl mt-3 overflow-hidden">
        <div className="grid grid-cols-3 text-white text-center py-2 border-b border-white/20 text-[10px] uppercase tracking-wide opacity-70 font-serif">
          <span>{t("POSITION")}</span>
          <span>{t("USER")}</span>
          <span>{heading}</span>
        </div>

        {rows.length === 0 ? (
          <div className="text-white text-center py-4 text-sm opacity-80">
            {error ? t("Unable to load leaderboard.") : t("No participants yet.")}
          </div>
        ) : (
          rows.map((r, i) => (
            <div
              key={`${mode}-${i}`}
              className={`grid grid-cols-3 text-center py-3 border-b border-white/10 last:border-0 font-serif ${
                r.isMe ? "bg-white/15" : ""
              } ${r.points === 0 ? "text-gray-400" : "text-white font-bold"}`}
            >
              <span>#{i + 1}</span>

              <span>
                {r.name}
                {r.isMe && <span className="ml-1 text-yellow-300">(you)</span>}
              </span>

              <span>{r.points}</span>
            </div>
          ))
        )}
      </div>

      {/* TREE MODE */}
      {mode === "tree" && (
        <>
          <div className="flex justify-center my-6">
            <OakTreeIcon className="h-28 w-28" />
          </div>

          <div className="bg-[#1f1f1f] rounded-2xl py-4 text-center text-white font-serif font-bold text-lg mb-4">
            {t("Trees you have planted")}: {treesPlanted}
          </div>

          <button
            onClick={join}
            className="w-full bg-[#1f1f1f] rounded-2xl py-5 text-white font-serif font-bold text-lg"
          >
            {t("Join the Tree Queue")}
          </button>
        </>
      )}

      {/* WOOL MODE */}
      {mode === "wool" && (
        <>
          <div className="flex justify-center my-4">
            {/* ✅ FIXED IMAGE */}
            <img src={nelsonHead.url} alt="Sheep" className="h-20 w-20 object-contain" />
          </div>

          <div className="bg-[#1f1f1f] rounded-2xl p-4 text-white font-serif mt-2">
            <p className="font-bold text-lg mb-1">{t("Spend your wool")}</p>
            <p className="text-sm opacity-80">
              {t(
                "Use wool points to customise your sheep on the Account tab, or cool the borough by placing solar farms and wind turbines on the Act Local map.",
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardTreesScreen;
``;
