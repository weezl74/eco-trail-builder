import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Timer, Zap, Target, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Sprint {
  id: string;
  type: 'prosperous' | 'resilient' | 'healthier' | 'cohesive';
  title: string;
  description: string;
  duration: number; // hours
  points: number;
  startedAt?: Date;
  completedAt?: Date;
  isActive: boolean;
}

const sprintTypes = [
  {
    type: 'prosperous' as const,
    title: 'Prosperous Challenge',
    description: 'Focus on sustainable economic activities for 24 hours',
    duration: 24,
    points: 100,
    color: 'hsl(57 82% 36%)', // #b8b10e
    bgColor: 'bg-[#b8b10e]'
  },
  {
    type: 'resilient' as const,
    title: 'Resilient Living Sprint',
    description: 'Build community resilience through local actions for 48 hours',
    duration: 48,
    points: 150,
    color: 'hsl(31 95% 54%)', // #f4971d
    bgColor: 'bg-[#f4971d]'
  },
  {
    type: 'healthier' as const,
    title: 'Healthier Wales Challenge',
    description: 'Promote wellbeing and health through eco-friendly choices for 72 hours',
    duration: 72,
    points: 200,
    color: 'hsl(9 80% 53%)', // #e63024
    bgColor: 'bg-[#e63024]'
  },
  {
    type: 'cohesive' as const,
    title: 'Cohesive Communities Sprint',
    description: 'Strengthen community bonds through collaborative green initiatives for 96 hours',
    duration: 96,
    points: 250,
    color: 'hsl(273 59% 35%)', // #7e519c
    bgColor: 'bg-[#7e519c]'
  }
];

export default function SprintChallenges() {
  const [activeSprints, setActiveSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadActiveSprints();
    }
  }, [user]);

  const loadActiveSprints = async () => {
    if (!user) return;
    
    try {
      // Load active sprints from local storage for now
      const stored = localStorage.getItem(`sprints_${user.id}`);
      if (stored) {
        const sprints = JSON.parse(stored).map((s: any) => ({
          ...s,
          startedAt: s.startedAt ? new Date(s.startedAt) : undefined,
          completedAt: s.completedAt ? new Date(s.completedAt) : undefined
        }));
        setActiveSprints(sprints);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSprint = async (sprintType: typeof sprintTypes[0]) => {
    if (!user) return;

    try {
      const newSprint: Sprint = {
        id: `${sprintType.type}_${Date.now()}`,
        type: sprintType.type,
        title: sprintType.title,
        description: sprintType.description,
        duration: sprintType.duration,
        points: sprintType.points,
        startedAt: new Date(),
        isActive: true
      };

      const updatedSprints = [...activeSprints, newSprint];
      setActiveSprints(updatedSprints);
      
      // Save to local storage
      localStorage.setItem(`sprints_${user.id}`, JSON.stringify(updatedSprints));

      toast({
        title: "Sprint Started!",
        description: `${sprintType.title} is now active. You have ${sprintType.duration} hours to complete it.`,
      });
    } catch (error) {
      console.error('Error starting sprint:', error);
      toast({
        title: "Error",
        description: "Failed to start sprint. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completeSprint = async (sprintId: string) => {
    if (!user) return;

    try {
      const sprint = activeSprints.find(s => s.id === sprintId);
      if (!sprint) return;

      const updatedSprints = activeSprints.map(s => 
        s.id === sprintId 
          ? { ...s, completedAt: new Date(), isActive: false }
          : s
      );
      
      setActiveSprints(updatedSprints);
      localStorage.setItem(`sprints_${user.id}`, JSON.stringify(updatedSprints));

      // Award points (in a real app, this would update the database)
      toast({
        title: "Sprint Completed!",
        description: `Congratulations! You earned ${sprint.points} points.`,
      });
    } catch (error) {
      console.error('Error completing sprint:', error);
    }
  };

  const getTimeRemaining = (sprint: Sprint) => {
    if (!sprint.startedAt || sprint.completedAt) return null;
    
    const now = new Date();
    const endTime = new Date(sprint.startedAt.getTime() + (sprint.duration * 60 * 60 * 1000));
    const remaining = endTime.getTime() - now.getTime();
    
    if (remaining <= 0) return { expired: true, timeString: '00:00:00' };
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return { expired: false, timeString, totalHours: sprint.duration, remainingHours: hours + (minutes / 60) };
  };

  // Real-time countdown update
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sprint Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please sign in to participate in sprint challenges.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-6 w-6" />
            Sprint Challenges
          </CardTitle>
          <p className="text-muted-foreground">
            Take on time-limited challenges to earn points and make a real impact
          </p>
        </CardHeader>
      </Card>

      {/* Active Sprints */}
      {activeSprints.filter(s => s.isActive && !s.completedAt).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSprints.filter(s => s.isActive && !s.completedAt).map((sprint) => {
                const timeInfo = getTimeRemaining(sprint);
                const sprintType = sprintTypes.find(t => t.type === sprint.type);
                
                return (
                  <div key={sprint.id} className="border rounded-lg p-4" style={{ borderColor: sprintType?.color }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sprintType?.color }}
                        />
                        <h3 className="font-semibold">{sprint.title}</h3>
                        <Badge variant="secondary">
                          +{sprint.points} pts
                        </Badge>
                      </div>
                      {timeInfo && !timeInfo.expired && (
                        <div className="text-right">
                          <div className="text-sm font-mono" style={{ color: sprintType?.color }}>
                            ⏱️ {timeInfo.timeString}
                          </div>
                          <div className="text-xs text-muted-foreground">remaining</div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{sprint.description}</p>
                    
                    {timeInfo && (
                      <>
                        {!timeInfo.expired ? (
                          <>
                            <Progress 
                              value={((sprint.duration - (timeInfo.remainingHours || 0)) / sprint.duration) * 100}
                              className="mb-3"
                            />
                            <Button 
                              onClick={() => completeSprint(sprint.id)}
                              className="w-full"
                              style={{ backgroundColor: sprintType?.color }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Sprint
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-red-500 font-semibold">⏰ Sprint Expired</p>
                            <p className="text-sm text-muted-foreground">You can start a new one anytime!</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Sprint Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sprintTypes.map((sprintType) => {
              const hasActive = activeSprints.some(s => s.type === sprintType.type && s.isActive && !s.completedAt);
              
              return (
                <div key={sprintType.type} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sprintType.color }}
                    />
                    <h3 className="font-semibold">{sprintType.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{sprintType.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {sprintType.duration}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        +{sprintType.points} pts
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startSprint(sprintType)}
                    disabled={hasActive}
                    className="w-full"
                    style={{ 
                      backgroundColor: hasActive ? undefined : sprintType.color,
                      color: hasActive ? undefined : 'white'
                    }}
                    variant={hasActive ? 'secondary' : 'default'}
                  >
                    {hasActive ? 'Already Active' : 'Start Sprint'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Sprints */}
      {activeSprints.filter(s => s.completedAt).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSprints.filter(s => s.completedAt).map((sprint) => {
                const sprintType = sprintTypes.find(t => t.type === sprint.type);
                
                return (
                  <div key={sprint.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{sprint.title}</span>
                    </div>
                    <Badge variant="secondary">+{sprint.points} pts</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}