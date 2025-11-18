import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap } from 'lucide-react';

interface AvatarSystemProps {
  totalPoints: number;
  userRenewables: number;
  pledgesCompleted: number;
}

const AvatarSystem: React.FC<AvatarSystemProps> = ({ 
  totalPoints, 
  userRenewables, 
  pledgesCompleted 
}) => {
  // Calculate avatar level based on total points
  const getAvatarLevel = (points: number) => {
    if (points >= 1000) return 10;
    if (points >= 800) return 9;
    if (points >= 600) return 8;
    if (points >= 500) return 7;
    if (points >= 400) return 6;
    if (points >= 300) return 5;
    if (points >= 200) return 4;
    if (points >= 100) return 3;
    if (points >= 50) return 2;
    return 1;
  };

  const currentLevel = getAvatarLevel(totalPoints);
  const nextLevelPoints = [50, 100, 200, 300, 400, 500, 600, 800, 1000][currentLevel - 1] || 1000;
  const pointsToNextLevel = Math.max(0, nextLevelPoints - totalPoints);

  // Get avatar appearance based on level
  const getAvatarStyle = (level: number) => {
    const baseSize = 80;
    const colors = [
      'from-gray-400 to-gray-600',      // Level 1
      'from-brown-400 to-brown-600',    // Level 2  
      'from-green-400 to-green-600',    // Level 3
      'from-blue-400 to-blue-600',      // Level 4
      'from-purple-400 to-purple-600',  // Level 5
      'from-pink-400 to-pink-600',      // Level 6
      'from-yellow-400 to-yellow-600',  // Level 7
      'from-orange-400 to-orange-600',  // Level 8
      'from-red-400 to-red-600',        // Level 9
      'from-cyan-400 via-blue-500 to-purple-600' // Level 10 (rainbow)
    ];
    
    return {
      size: baseSize + (level * 4),
      gradient: colors[level - 1] || colors[0],
      glow: level >= 5,
      crown: level >= 8
    };
  };

  const avatarStyle = getAvatarStyle(currentLevel);

  // Get level title
  const getLevelTitle = (level: number) => {
    const titles = [
      'Climate Newbie',
      'Eco Apprentice', 
      'Green Explorer',
      'Carbon Cutter',
      'Renewable Rookie',
      'Sustainability Star',
      'Climate Champion',
      'Eco Warrior',
      'Green Guardian',
      'Climate Hero'
    ];
    return titles[level - 1] || 'Climate Legend';
  };

  // Get achievements
  const achievements = [
    { 
      name: 'First Steps', 
      description: 'Complete your first pledge',
      unlocked: pledgesCompleted >= 1,
      icon: <Star className="w-4 h-4" />
    },
    { 
      name: 'Renewable Pioneer', 
      description: 'Install your first renewable technology',
      unlocked: userRenewables >= 1,
      icon: <Zap className="w-4 h-4" />
    },
    { 
      name: 'Point Collector', 
      description: 'Earn 100 points',
      unlocked: totalPoints >= 100,
      icon: <Trophy className="w-4 h-4" />
    },
    { 
      name: 'Pledge Master', 
      description: 'Complete 10 pledges',
      unlocked: pledgesCompleted >= 10,
      icon: <Star className="w-4 h-4" />
    },
    { 
      name: 'Tech Enthusiast', 
      description: 'Install 5 renewable technologies',
      unlocked: userRenewables >= 5,
      icon: <Zap className="w-4 h-4" />
    },
    { 
      name: 'Climate Champion', 
      description: 'Reach level 7',
      unlocked: currentLevel >= 7,
      icon: <Trophy className="w-4 h-4" />
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div 
              className={`rounded-full bg-gradient-to-br ${avatarStyle.gradient} flex items-center justify-center mx-auto transition-all duration-500 ${
                avatarStyle.glow ? 'shadow-lg shadow-blue-500/50' : ''
              }`}
              style={{ 
                width: `${avatarStyle.size}px`, 
                height: `${avatarStyle.size}px`,
                animation: avatarStyle.glow ? 'pulse 2s infinite' : 'none'
              }}
            >
              {/* Avatar content */}
              <div className="text-white text-2xl font-bold">
                {currentLevel}
              </div>
              
              {/* Crown for high levels */}
              {avatarStyle.crown && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="text-yellow-400 text-xl">👑</div>
                </div>
              )}
            </div>
            
            {/* Level badge */}
            <Badge variant="secondary" className="text-xs">
              Level {currentLevel}
            </Badge>
          </div>

          {/* Level info */}
          <h3 className="text-lg font-semibold text-white mb-1">
            {getLevelTitle(currentLevel)}
          </h3>
          
          {currentLevel < 10 && (
            <p className="text-sm text-slate-400 mb-4">
              {pointsToNextLevel} points to next level
            </p>
          )}

          {/* Progress bar */}
          {currentLevel < 10 && (
            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((totalPoints - (nextLevelPoints - (nextLevelPoints - (currentLevel > 1 ? [50, 100, 200, 300, 400, 500, 600, 800, 1000][currentLevel - 2] || 0 : 0)))) / (nextLevelPoints - (currentLevel > 1 ? [50, 100, 200, 300, 400, 500, 600, 800, 1000][currentLevel - 2] || 0 : 0))) * 100}%` 
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Achievements</h4>
          
          {/* Unlocked achievements */}
          {unlockedAchievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-green-900/30 rounded-lg border border-green-700/30">
              <div className="text-green-400">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-400">{achievement.name}</div>
                <div className="text-xs text-green-300">{achievement.description}</div>
              </div>
              <div className="text-green-400">✓</div>
            </div>
          ))}

          {/* Locked achievements (show next 2) */}
          {lockedAchievements.slice(0, 2).map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div className="text-slate-500">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-400">{achievement.name}</div>
                <div className="text-xs text-slate-500">{achievement.description}</div>
              </div>
              <div className="text-slate-500">🔒</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSystem;