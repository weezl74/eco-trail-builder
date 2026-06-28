import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Zap } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

interface Story {
  id: string;
  title: string;
  content: string;
  run_type: string;
  points_earned: number;
  created_at: string;
  user_id: string;
  image_url?: string;

  display_name?: string;

  kudos_count: number;
  user_has_kudos?: boolean;
}

export default function CommunityStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  useEffect(() => {
    if (!user) return;

    fetchStories();

    const interval = setInterval(fetchStories, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ Fetch stories from API
  const fetchStories = async () => {
    try {
      const data = await api.get("/stories");
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load stories:", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle kudos
  const handleToggleKudos = async (storyId: string, current: boolean) => {
    if (!user) return;

    try {
      await api.post(`/stories/${storyId}/kudos`, {
        user_id: user.id,
        remove: current,
      });

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                kudos_count: current ? s.kudos_count - 1 : s.kudos_count + 1,
                user_has_kudos: !current,
              }
            : s,
        ),
      );
    } catch (err) {
      console.error("❌ Kudos failed:", err);
      toast({
        title: "Error",
        description: "Could not update kudos",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return t("Just now");
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const runIcon = (runType: string) =>
    runType === "sprint" ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />;

  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-muted-foreground">
        {t("Please sign in to view stories.")}
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      ) : stories.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">{t("No stories yet")}</div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>{story.display_name?.substring(0, 2)?.toUpperCase() || "??"}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-medium">{story.display_name || "Anonymous"}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTime(story.created_at)}</span>

                    <Badge variant="outline" className="flex items-center gap-1">
                      {runIcon(story.run_type)}
                      {story.run_type}
                    </Badge>
                  </div>
                </div>

                <Badge>+{story.points_earned}</Badge>
              </div>

              {/* Content */}
              <h3 className="font-semibold">{story.title}</h3>

              <p className="text-sm text-muted-foreground mb-3">{story.content}</p>

              {/* Image */}
              {story.image_url && (
                <img src={story.image_url} className="w-full h-48 object-cover rounded-md mb-3" alt="" />
              )}

              {/* Kudos */}
              <Button variant="ghost" size="sm" onClick={() => handleToggleKudos(story.id, !!story.user_has_kudos)}>
                <Heart className="h-4 w-4 mr-1" />
                {story.kudos_count} {t("kudos")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
