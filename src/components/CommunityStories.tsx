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
  display_name?: string;
  kudos_count: number;
  user_has_kudos?: boolean;
}

export default function CommunityStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Add story form state
  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    run_type: "sprint",
    points_earned: 0,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  // ✅ Fetch stories
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

  // ✅ ADD STORY (FULLY WIRED)
  const handleSubmitStory = async () => {
    if (!user || !newStory.title.trim() || !newStory.content.trim()) return;

    try {
      await api.post("/stories", {
        user_id: user.id,
        title: newStory.title.trim(),
        content: newStory.content.trim(),
        run_type: newStory.run_type,
        points_earned: newStory.points_earned,
        image_url: null,
      });

      toast({
        title: "Story added!",
        description: "Your story was shared.",
      });

      // reset form
      setNewStory({
        title: "",
        content: "",
        run_type: "sprint",
        points_earned: 0,
      });

      // reload feed
      fetchStories();
    } catch (err) {
      console.error("❌ submit failed:", err);

      toast({
        title: "Error",
        description: "Could not submit story",
        variant: "destructive",
      });
    }
  };

  // ✅ TOGGLE KUDOS
  const toggleKudos = async (storyId: string, hasKudos: boolean) => {
    if (!user) return;

    try {
      await api.post(`/stories/${storyId}/kudos`, {
        user_id: user.id,
        remove: hasKudos,
      });

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                kudos_count: hasKudos ? s.kudos_count - 1 : s.kudos_count + 1,
                user_has_kudos: !hasKudos,
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

  const icon = (type: string) => (type === "sprint" ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />);

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="space-y-4">
      {/* ✅ SIMPLE ADD STORY UI */}
      <div className="bg-white p-3 rounded-lg space-y-2">
        <input
          placeholder="Title"
          value={newStory.title}
          onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Share your story..."
          value={newStory.content}
          onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
          className="w-full border p-2"
        />

        <Button onClick={handleSubmitStory}>Add Story</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : stories.length === 0 ? (
        <p>No stories yet</p>
      ) : (
        stories.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Avatar>
                <AvatarFallback>{s.display_name?.substring(0, 2) || "??"}</AvatarFallback>
              </Avatar>

              <div>
                <div>{s.display_name || "Anonymous"}</div>
                <div className="text-xs text-gray-500">{formatTime(s.created_at)}</div>
              </div>

              <Badge className="ml-auto">+{s.points_earned}</Badge>
            </div>

            <h3>{s.title}</h3>
            <p>{s.content}</p>

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
