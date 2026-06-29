import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchLeaderboard } from "@/lib/api";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchLeaderboard(100);

        if (cancelled) return;

        const mapped: LeaderboardEntry[] = data.map((u, i) => ({
          user_id: u.user_id,
          username: u.display_name || u.username || "",
          total_points: (u.wool_points || 0) + (u.tree_points || 0),
          rank: i + 1,
        }));

        setLeaderboard(mapped);
        setError(false);

      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching leaderboard:", err);
        setError(true);
        setLeaderboard([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const onUpdated = () => load();
    window.addEventListener("points:updated", onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("points:updated", onUpdated);
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getUserAvatar = (username: string) => {
    const initials = username?.substring(0, 2).toUpperCase() || "?";

    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

