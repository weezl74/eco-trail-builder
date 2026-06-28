import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";

// ✅ Story type
interface Story {
  id: string;
  title: string;
  content: string;
  run_type: string;
  points_earned: number;
  created_at: string;
  user_id: string;
  display_name?: string;
  kudos_count: number;
  user_has_kudos?: boolean;
}

export default function CommunityStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { t } = useTranslations();

  // ✅ Load stories from API
  useEffect(() => {
    if (!user) return;

    fetchStories();
    const interval = setInterval(fetchStories, 20000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchStories = async () => {
    try {
      const data = await api.get("/stories");
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ load stories failed:", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle kudos (API)
  const toggleKudos = async (id: string, has: boolean) => {
    if (!user) return;

    try {
      await api.post(`/stories/${id}/kudos`, {
        user_id: user.id,
        remove: has,
      });

      setStories((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                kudos_count: has ? s.kudos_count - 1 : s.kudos_count + 1,
                user_has_kudos: !has,
              }
            : s,
        ),
      );
    } catch (err) {
      console.error("❌ kudos failed:", err);
    }
  };

  const formatTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!user) {
    return <div className="text-center text-muted-foreground">{t("Please sign in")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* ✅ IMPORTANT: KEEP ORIGINAL BUTTON ONLY */}
      {/* This button should trigger your existing dropdown logic */}
      <Button>Add Story</Button>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stories yet</p>
      ) : (
        stories.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Avatar>
                <AvatarFallback>{s.display_name?.substring(0, 2) || "??"}</AvatarFallback>
              </Avatar>

              <div>
                <div className="font-medium">{s.display_name || "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">{formatTime(s.created_at)}</div>
              </div>

              <Badge className="ml-auto">+{s.points_earned}</Badge>
            </div>

            <h3 className="font-semibold">{s.title}</h3>

            <p className="text-sm text-muted-foreground mb-2">{s.content}</p>

            <Button variant="ghost" size="sm" onClick={() => toggleKudos(s.id, !!s.user_has_kudos)}>
              <Heart className="h-4 w-4 mr-1" />
              {s.kudos_count}
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
