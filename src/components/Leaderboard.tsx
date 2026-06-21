import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ApiUser {
  user_id: string;
  display_name?: string | null;
  username?: string | null;
  wool_points?: number | null;
  tree_points?: number | null;
}

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
    fetch("https://caerphilly-api.onrender.com/profile")
      .then((res) => res.json())
      .then((data: ApiUser[]) => {
        const users = Array.isArray(data) ? data : [];
        const sorted = [...users].sort(
          (a, b) =>
            ((b.wool_points || 0) + (b.tree_points || 0)) -
            ((a.wool_points || 0) + (a.tree_points || 0))
        );
        const mapped: LeaderboardEntry[] = sorted.map((u, i) => ({
          user_id: u.user_id,
          username: u.display_name || u.username || "",
          total_points: (u.wool_points || 0) + (u.tree_points || 0),
          rank: i + 1,
        }));
        setLeaderboard(mapped);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setError(true);
        setLeaderboard([]);
      })
      .finally(() => setLoading(false));
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

  const getUserAvatar = (username: string, level: number) => {
    const initials = username?.substring(0, 2).toUpperCase() || "?";
    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback className={`bg-primary/10 text-primary font-semibold`}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Community Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div 
              key={entry.user_id} 
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.user_id === user?.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/20 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center justify-center w-6 flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-shrink-0">
                  {getUserAvatar(entry.username, entry.avatar_level)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate text-sm">
                    {entry.username || `User ${entry.user_id.slice(0, 8)}`}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    Level {entry.avatar_level}
                  </Badge>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary text-sm">{entry.total_points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants yet. Complete actions to join the leaderboard!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}