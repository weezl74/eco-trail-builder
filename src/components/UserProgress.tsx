import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, Zap, Target, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface UserProgressProps {
  currentFootprint: number;
  totalPoints: number;
  pledgesCompleted: number;
  sprintsCompleted: number;
  renewablesOwned: number;
  userMode: 'resident' | 'business';
  totalCostSavings?: number;
  waterSaved?: number;
}

const UserProgress: React.FC<UserProgressProps> = ({
  currentFootprint,
  totalPoints,
  pledgesCompleted,
  sprintsCompleted,
  renewablesOwned,
  userMode,
  totalCostSavings = 0,
  waterSaved = 0
}) => {
  const [showAllPledges, setShowAllPledges] = useState(false);
  // Calculate various metrics
  const averageFootprint = userMode === 'business' ? 50000 : 8000; // kg CO2/year
  const footprintReduction = Math.max(0, ((averageFootprint - currentFootprint) / averageFootprint) * 100);
  
  // Calculate progress towards next milestone
  const nextPointMilestone = Math.ceil(totalPoints / 100) * 100 + 100;
  const pointProgress = ((totalPoints % 100) / 100) * 100;

  // Mock pledges data - would come from real tracking
  const mockPledges = [
    { id: 1, action: 'Reduce meat consumption by 50%', category: 'Food', completed: true, points: 25 },
    { id: 2, action: 'Walk or cycle for short journeys', category: 'Transport', completed: true, points: 30 },
    { id: 3, action: 'Switch to renewable energy provider', category: 'Energy', completed: false, points: 40 },
    { id: 4, action: 'Reduce single-use plastics', category: 'Waste', completed: true, points: 20 },
    { id: 5, action: 'Support local businesses', category: 'Economy', completed: false, points: 15 },
    { id: 6, action: 'Start composting organic waste', category: 'Waste', completed: true, points: 35 },
  ];

  // Weekly activity (mock data - would come from real tracking)
  const weeklyActivity = [
    { day: 'Mon', pledges: 1, sprints: 0 },
    { day: 'Tue', pledges: 0, sprints: 1 },
    { day: 'Wed', pledges: 2, sprints: 1 },
    { day: 'Thu', pledges: 1, sprints: 0 },
    { day: 'Fri', pledges: 0, sprints: 1 },
    { day: 'Sat', pledges: 1, sprints: 1 },
    { day: 'Sun', pledges: 0, sprints: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(footprintReduction)}%
              </div>
              <div className="text-xs text-gray-600">Footprint Reduced</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalPoints}
              </div>
              <div className="text-xs text-gray-600">Total Points</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {pledgesCompleted}
              </div>
              <div className="text-xs text-gray-600">Pledges Done</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {renewablesOwned}
              </div>
              <div className="text-xs text-gray-600">Tech Installed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                £{totalCostSavings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Money Saved</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 mb-1">
                {waterSaved.toLocaleString()}L
              </div>
              <div className="text-xs text-gray-600">Water Saved</div>
            </div>
          </div>

          {/* Progress to next milestone */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Progress to {nextPointMilestone} points</span>
              <span className="text-sm text-gray-600">{totalPoints}/{nextPointMilestone}</span>
            </div>
            <Progress value={pointProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">This Week's Activity</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                <div className="space-y-1">
                  {/* Pledges */}
                  <div className={`h-2 rounded ${day.pledges > 0 ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-green-400 rounded"
                      style={{ width: `${Math.min(day.pledges * 50, 100)}%` }}
                    ></div>
                  </div>
                  {/* Sprints */}
                  <div className={`h-2 rounded ${day.sprints > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-blue-400 rounded"
                      style={{ width: `${day.sprints * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {day.pledges + day.sprints > 0 ? (day.pledges + day.sprints) : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded"></div>
              <span>Pledges</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded"></div>
              <span>Sprints</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pledges Summary */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">My Pledges</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllPledges(!showAllPledges)}
              className="flex items-center gap-2"
            >
              {showAllPledges ? (
                <>Hide Details <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show All ({mockPledges.length}) <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          </div>
          
          {!showAllPledges ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {mockPledges.filter(p => p.completed).length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {mockPledges.filter(p => !p.completed).length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mockPledges.map((pledge) => (
                <div key={pledge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${pledge.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pledge.action}</div>
                      <div className="text-xs text-gray-600">{pledge.category}</div>
                    </div>
                  </div>
                  <Badge variant={pledge.completed ? "default" : "outline"}>
                    {pledge.completed ? `+${pledge.points} pts` : `${pledge.points} pts`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Goals */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Current Goals</h3>
          </div>
          
          <div className="space-y-3">
            {/* Next renewable goal */}
            {renewablesOwned < 3 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Install {3 - renewablesOwned} more renewable{3 - renewablesOwned > 1 ? 's' : ''}</div>
                  <div className="text-xs text-gray-600">Get the "Tech Enthusiast" achievement</div>
                </div>
                <Badge variant="outline">
                  {renewablesOwned}/3
                </Badge>
              </div>
            )}
            
            {/* Points goal */}
            {totalPoints < 500 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Reach 500 points</div>
                  <div className="text-xs text-gray-600">Unlock level 7 - Climate Champion</div>
                </div>
                <Badge variant="outline">
                  {totalPoints}/500
                </Badge>
              </div>
            )}
            
            {/* Pledge goal */}
            {pledgesCompleted < 10 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Complete {10 - pledgesCompleted} more pledge{10 - pledgesCompleted > 1 ? 's' : ''}</div>
                  <div className="text-xs text-gray-600">Get the "Pledge Master" achievement</div>
                </div>
                <Badge variant="outline">
                  {pledgesCompleted}/10
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProgress;