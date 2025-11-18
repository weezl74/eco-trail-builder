
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, TreePine, Waves, Sun, Wind } from 'lucide-react';

interface PostcardsFromFutureProps {
  currentFootprint: number;
  pledges: Array<{
    id: string;
    category: string;
    action: string;
    impact: number;
    frequency: string;
  }>;
  sprints: Array<{
    id: string;
    title: string;
    impact: number;
    frequency: string;
    completed: boolean;
  }>;
}

const PostcardsFromFuture: React.FC<PostcardsFromFutureProps> = ({ 
  currentFootprint, 
  pledges, 
  sprints 
}) => {
  const [selectedYear, setSelectedYear] = useState(2030);
  
  const defaultFootprint = 8000;
  const footprintToUse = currentFootprint > 0 ? currentFootprint : defaultFootprint;
  
  const totalPledgeSavings = pledges.reduce((total, pledge) => total + pledge.impact, 0);
  const totalSprintSavings = sprints
    .filter(sprint => sprint.completed)
    .reduce((total, sprint) => total + sprint.impact, 0);
  
  const totalSavings = totalPledgeSavings + totalSprintSavings;
  const adjustedFootprint = Math.max(0, footprintToUse - totalSavings);
  
  const getPostcardData = (year: number) => {
    const yearsFromNow = year - 2024;
    const sustainableFootprint = 2300;
    
    // Calculate scenarios with year-specific changes
    const baseNoChangeFootprint = footprintToUse;
    const baseWithChangesFootprint = adjustedFootprint;
    
    // Simulate different trajectories based on year
    const improvementRate = 0.05; // 5% improvement per year with changes
    const degradationRate = 0.02; // 2% increase per year without changes (population growth, lifestyle inflation)
    
    const futureNoChange = baseNoChangeFootprint * Math.pow(1 + degradationRate, yearsFromNow);
    const futureWithChanges = baseWithChangesFootprint * Math.pow(1 - improvementRate, yearsFromNow);
    
    // Year-specific environmental conditions
    const getYearSpecificData = (scenario: 'noChange' | 'withChanges', footprint: number) => {
      const intensity = year === 2030 ? 'moderate' : year === 2040 ? 'high' : 'extreme';
      
      if (scenario === 'noChange') {
        return {
          image: year === 2030 ? "🌍⚠️" : year === 2040 ? "🌍🔥" : "🌍💀",
          environment: {
            airQuality: year === 2030 ? "Poor" : year === 2040 ? "Very Poor" : "Hazardous",
            weather: year === 2030 ? "More heat waves" : year === 2040 ? "Severe heat waves" : "Extreme heat waves",
            nature: year === 2030 ? "Species decline" : year === 2040 ? "Mass extinctions" : "Ecosystem collapse",
            oceans: year === 2030 ? "Rising seas" : year === 2040 ? "Major flooding" : "Coastal cities lost"
          }
        };
      } else {
        return {
          image: year === 2030 ? "🌱🌍" : year === 2040 ? "🌳🌍" : "🌿🌍✨",
          environment: {
            airQuality: year === 2030 ? "Improving" : year === 2040 ? "Clean" : "Pristine",
            weather: year === 2030 ? "Stabilizing" : year === 2040 ? "Stable" : "Optimal",
            nature: year === 2030 ? "Recovering" : year === 2040 ? "Thriving" : "Flourishing",
            oceans: year === 2030 ? "Healthier" : year === 2040 ? "Restored" : "Pristine"
          }
        };
      }
    };

    const noChangeData = getYearSpecificData('noChange', futureNoChange);
    const withChangesData = getYearSpecificData('withChanges', futureWithChanges);

    const scenarios = {
      noChange: {
        footprint: futureNoChange,
        worldsNeeded: futureNoChange / sustainableFootprint,
        title: "If You Don't Change...",
        description: `Your environmental impact worsens by ${year}`,
        image: noChangeData.image,
        color: "from-red-500 to-red-600",
        environment: noChangeData.environment
      },
      withChanges: {
        footprint: futureWithChanges,
        worldsNeeded: futureWithChanges / sustainableFootprint,
        title: "If You Make Changes...",
        description: `Your positive impact grows significantly by ${year}`,
        image: withChangesData.image,
        color: "from-green-500 to-green-600",
        environment: withChangesData.environment
      }
    };
    
    return scenarios;
  };
  
  const scenarios = getPostcardData(selectedYear);
  
  const years = [2030, 2040, 2050];
  
  const getEnvironmentIcon = (aspect: string) => {
    switch (aspect) {
      case 'airQuality': return <Wind className="w-4 h-4" />;
      case 'weather': return <Sun className="w-4 h-4" />;
      case 'nature': return <TreePine className="w-4 h-4" />;
      case 'oceans': return <Waves className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Postcards from the Future
          </CardTitle>
          <CardDescription>
            See how your choices today shape the world of tomorrow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-6">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                onClick={() => setSelectedYear(year)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {year}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Card key={key} className={`bg-gradient-to-br ${scenario.color} text-white shadow-lg`}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{scenario.image}</div>
                  <CardTitle className="text-xl text-white">{scenario.title}</CardTitle>
                  <CardDescription className="text-gray-100">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {scenario.worldsNeeded.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-100">
                      {scenario.worldsNeeded === 1 ? 'Earth needed' : 'Earths needed'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Environmental Conditions:</h4>
                    {Object.entries(scenario.environment).map(([aspect, condition]) => (
                      <div key={aspect} className="flex items-center gap-2 text-sm">
                        {getEnvironmentIcon(aspect)}
                        <span className="capitalize">{aspect.replace(/([A-Z])/g, ' $1')}: {condition}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-black bg-opacity-20 rounded-lg">
                    <div className="text-sm text-gray-100">
                      Carbon footprint: {(scenario.footprint / 1000).toFixed(1)} tons CO₂/year
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-600 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-slate-300" />
              <h3 className="font-semibold text-slate-200">Your Impact So Far</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-slate-200">Pledges Made</div>
                <div className="text-slate-400">{pledges.length} commitments</div>
              </div>
              <div>
                <div className="font-semibold text-slate-200">Sprints Completed</div>
                <div className="text-slate-400">{sprints.filter(s => s.completed).length} of {sprints.length}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-200">CO₂ Saved</div>
                <div className="text-slate-400">{(totalSavings / 1000).toFixed(1)} tons/year</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostcardsFromFuture;
