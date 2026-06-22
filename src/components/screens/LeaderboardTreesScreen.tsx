
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
