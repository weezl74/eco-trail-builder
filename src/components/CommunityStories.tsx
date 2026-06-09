import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Plus, Clock, Zap, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  title: string;
  content: string;
  run_type: string;
  points_earned: number;
  created_at: string;
  user_id: string;
  image_url?: string;
  profiles: {
    username: string;
    avatar_level: number;
  } | null;
  kudos_count: number;
  user_has_kudos: boolean;
}

interface NewStory {
  title: string;
  content: string;
  run_type: string;
  points_earned: number;
  image?: File | null;
}

export default function CommunityStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStory, setNewStory] = useState<NewStory>({
    title: "",
    content: "",
    run_type: "sprint",
    points_earned: 0,
    image: null
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;
    
    try {
      // First get stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('user_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // Then get profiles for each story
      const storiesWithProfiles = await Promise.all(
        (storiesData || []).map(async (story) => {
          const { data: profileRows } = await supabase
            .rpc('get_public_profile', { _user_id: story.user_id });
          const profile = profileRows?.[0]
            ? { username: profileRows[0].username, avatar_level: profileRows[0].avatar_level }
            : null;

          const { data: kudosData } = await supabase
            .from('story_kudos')
            .select('user_id')
            .eq('story_id', story.id);

          return {
            ...story,
            profiles: profile,
            kudos_count: kudosData?.length || 0,
            user_has_kudos: kudosData?.some(k => k.user_id === user.id) || false
          } as Story;
        })
      );

      setStories(storiesWithProfiles);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setNewStory(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewStory(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitStory = async () => {
    if (!user || !newStory.title.trim() || !newStory.content.trim()) return;

    setSubmitting(true);
    try {
      let imageUrl = null;
      
      // Upload image if present
      if (newStory.image) {
        const fileName = `story_${Date.now()}_${newStory.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(fileName, newStory.image);
          
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without image rather than failing completely
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('story-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('user_stories')
        .insert({
          user_id: user.id,
          title: newStory.title.trim(),
          content: newStory.content.trim(),
          run_type: newStory.run_type,
          points_earned: newStory.points_earned,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your story has been shared with the community.",
      });

      setNewStory({
        title: "",
        content: "",
        run_type: "sprint",
        points_earned: 0,
        image: null
      });
      setImagePreview(null);
      setIsDialogOpen(false);
      fetchStories();
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Error",
        description: "Failed to share your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleKudos = async (storyId: string, currentlyHasKudos: boolean) => {
    if (!user) return;

    try {
      if (currentlyHasKudos) {
        await supabase
          .from('story_kudos')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('story_kudos')
          .insert({
            story_id: storyId,
            user_id: user.id
          });
      }

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? {
              ...story,
              kudos_count: currentlyHasKudos ? story.kudos_count - 1 : story.kudos_count + 1,
              user_has_kudos: !currentlyHasKudos
            }
          : story
      ));
    } catch (error) {
      console.error('Error toggling kudos:', error);
      toast({
        title: "Error",
        description: "Failed to update kudos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRunTypeIcon = (runType: string) => {
    switch (runType) {
      case 'sprint':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please sign in to view and share community stories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Stories</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div key={story.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {story.profiles?.username?.substring(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{story.profiles?.username || "Anonymous"}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTimeAgo(story.created_at)}</span>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {getRunTypeIcon(story.run_type)}
                          {story.run_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{story.points_earned} pts
                  </Badge>
                </div>
                
                <h3 className="font-semibold mb-2">{story.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{story.content}</p>
                
                {/* Story Image */}
                {story.image_url && (
                  <div className="mb-3">
                    <img 
                      src={story.image_url} 
                      alt="Story image" 
                      className="w-full h-48 object-cover rounded-md border"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={story.user_id === user?.id}
                    onClick={() => handleToggleKudos(story.id, story.user_has_kudos)}
                    className={`flex items-center gap-2 ${story.user_has_kudos ? 'text-red-500' : ''}`}
                    title={story.user_id === user?.id ? "You can't kudos your own story" : 'Give one kudos'}
                  >
                    <Heart className={`h-4 w-4 ${story.user_has_kudos ? 'fill-current' : ''}`} />
                    {story.kudos_count} kudos
                  </Button>
                </div>
              </div>
            ))}
            
            {stories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stories shared yet. Be the first to share your success!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}