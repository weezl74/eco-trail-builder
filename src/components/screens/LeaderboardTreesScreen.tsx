import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import nelsonHead from "@/assets/sheep/NelsonHead.svg.asset.json";

import { useToast } from "@/hooks/use-toast";
import { useSavings } from "@/hooks/useSavings";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";

type Mode = "wool" | "tree";

interface Row {
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

// ✅ Wool ball icon
const WoolBallIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <circle cx="32" cy="32" r="26" fill={color} stroke="#1f1f1f" strokeWidth="2" />
    <g fill="none" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
      <path d="M10 28 C 22 18, 42 18, 54 28" />
      <path d="M8 36 C 22 24, 42 24, 56 36" />
      <path d="M12 44 C 24 36, 40 36, 52 44" />
      <path d="M18 52 C 26 46, 38 46, 46 52" />
      <path d="M20 14 C 28 22, 36 22, 44 14" />
    </g>
  </svg>
);

const LeaderboardTreesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>("wool");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);

  const { toast } = useToast();
  const { treesPlanted, treePoints, woolPoints, plantTree, woolColor } = useSavings();
  const { t } = useTranslations();
  const { user } = useAuth();

  // Fetch leaderboard from API
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("https://caerphilly-api.onrender.com/profile")
        .then((res) => {
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then((data: any[]) => {
          if (cancelled) return;
          const mapped: Row[] = (data || [])
            .map((u) => {
              const isMe = u.user_id === user?.id;
              const wool = Number(u.wool_points) || 0;
              const tree = Number(u.tree_points) || 0;
              return {
                name:
                  (u.display_name || u.username || `User ${String(u.user_id).slice(0, 8)}`) +
                  (isMe ? " (you)" : ""),
                points: mode === "wool" ? wool : tree,
                isMe,
              };
            })
            .sort((a, b) => b.points - a.points);
          setRows(mapped);
          setError(false);
        })
        .catch(() => {
          if (cancelled) return;
          setRows([]);
          setError(true);
        });
    };
    load();
    const onPointsUpdated = () => load();
    window.addEventListener("points:updated", onPointsUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("points:updated", onPointsUpdated);
    };
  }, [mode, user?.id]);

  const heading = mode === "wool" ? t("WOOL POINTS") : t("TREE POINTS");
  const myPoints = mode === "wool" ? woolPoints : treePoints;


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
    <div className="min-h-screen bg-[#f5a623] pb-24 px-4 pt-4">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="text-black mb-2 flex items-center gap-1 font-serif font-bold">
          <ArrowLeft className="h-5 w-5" /> {t("Back")}
        </button>
      )}

      {/* Heading */}
      <div className="text-center text-black font-serif font-bold">
        <p className="text-2xl">{t("Estimated Offset")}</p>
        <p className="text-2xl">25,500 CO₂e</p>
        <p className="text-2xl">KG</p>
      </div>

      {/* Toggle */}
      <div className="bg-[#1f1f1f] rounded-full mt-4 p-1 grid grid-cols-2 text-center font-serif font-bold">
        {(["wool", "tree"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-2 transition ${mode === m ? "bg-[#f5a623] text-black" : "text-white"}`}
          >
            {m === "wool" ? t("Wool Points") : t("Tree Points")}
          </button>
        ))}
      </div>

      {/* Points summary */}
      <p className="text-center text-black font-serif font-bold mt-3">
        {t("You have")} <span className="text-[#1f1f1f]">{myPoints}</span>{" "}
        {mode === "wool" ? t("wool") : t("Tree").toLowerCase()} {t("points")}
      </p>

      {/* Leaderboard */}
      <div className="bg-[#1f1f1f] rounded-2xl mt-3 overflow-hidden">
        <div className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 border-b border-white/20 text-[11px] sm:text-xs uppercase tracking-wide px-2 gap-1">
          <span>{t("POSITION")}</span>
          <span>{t("USER")}</span>
          <span className="whitespace-nowrap">{heading}</span>
        </div>

        {rows.length === 0 ? (
          <div className="text-white font-serif text-center py-4 text-sm opacity-80">
            {error ? t("Unable to load leaderboard.") : t("No participants yet.")}
          </div>
        ) : (
          rows.map((r, i) => (
            <div
              key={`${mode}-${i}`}
              className="grid grid-cols-3 text-white font-serif font-bold text-center py-3 text-lg border-b border-white/10 last:border-0"
            >
              <span>#{i + 1}</span>
              <span>{r.name}</span>
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

          <div className="bg-[#1f1f1f] rounded-2xl py-4 text-center text-white font-serif font-bold text-2xl mb-4">
            {t("Trees you have planted")}: {treesPlanted}
          </div>

          <button
            onClick={join}
            className="w-full bg-[#1f1f1f] rounded-2xl py-5 text-white font-serif font-bold text-2xl active:scale-[0.99] transition"
          >
            {t("Join the Tree Queue")}
            <p className="text-base font-normal mt-1">{t("100 Tree Points Required")}</p>
          </button>
        </>
      )}

      {/* WOOL MODE */}
      {mode === "wool" && (
        <>
          <div className="flex justify-center items-end gap-6 my-6">
            {/* ✅ FIXED LINE BELOW */}
            <img src={nelsonHead.url} alt="Nelson" className="h-28 w-28 object-contain" />
            <WoolBallIcon color={woolColor} className="h-24 w-24" />
          </div>

          <div className="mt-2 bg-[#1f1f1f] rounded-2xl p-4 text-white font-serif">
            <p className="font-bold text-lg mb-1">{t("Spend your wool")}</p>
            <p className="text-sm opacity-80">
              {t(
                "Use wool points to customise your sheep on the Account tab, or cool the borough by placing solar farms and wind turbines on the Shop Local map.",
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardTreesScreen;
