
import React from 'react';
import { Earth, PoundSterling, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WorldsDisplayProps {
  currentFootprint: number;
  pledges: Array<{
    id: string;
    category: string;
    action: string;
    impact: number;
    frequency: string;
    costSaving?: number;
  }>;
  sprints: Array<{
    id: string;
    title: string;
    impact: number;
    frequency: string;
    completed: boolean;
    costSaving?: number;
  }>;
  mode: 'resident' | 'business';
}

const WorldsDisplay: React.FC<WorldsDisplayProps> = ({ 
  currentFootprint, 
  pledges, 
  sprints, 
  mode 
}) => {
  
  const sustainableFootprint = 6000; // kg CO2 per year per person (realistic target)
  
  // Use actual footprint - ensure it updates properly
  const footprintToUse = currentFootprint || 0;
  
  console.log('WorldsDisplay - Current footprint:', footprintToUse);
  
  const totalPledgeSavings = pledges.reduce((total, pledge) => {
    console.log('Pledge:', pledge.action, 'Impact:', pledge.impact);
    return total + pledge.impact;
  }, 0);
  
  const totalSprintSavings = sprints
    .filter(sprint => sprint.completed)
    .reduce((total, sprint) => {
      console.log('Completed sprint:', sprint.title, 'Impact:', sprint.impact);
      return total + sprint.impact;
    }, 0);
  
  const totalCostSavings = pledges.reduce((total, pledge) => total + (pledge.costSaving || 0), 0) +
                           sprints.filter(sprint => sprint.completed).reduce((total, sprint) => total + (sprint.costSaving || 0), 0);
  
  // Don't limit savings - use the actual calculated footprint reduction
  const carbonSaved = totalPledgeSavings + totalSprintSavings;
  console.log('Total carbon saved:', carbonSaved, 'kg');
  
  // Use the original footprint for worlds calculation (before any pledges/sprints)
  const worldsNeeded = footprintToUse / sustainableFootprint;
  console.log('Worlds needed:', worldsNeeded, 'for footprint:', footprintToUse);
  
  const maxDisplayWorlds = Math.ceil(worldsNeeded);
  console.log('Max display worlds:', maxDisplayWorlds, 'for footprint:', footprintToUse);

  const getLabels = () => {
    if (mode === 'business') {
      return {
        title: 'Company Environmental Impact',
        description: 'See how many Earth resources your organisation would need if everyone operated this way',
        target: 'Business sustainability target',
        current: 'Your organisation\'s current footprint'
      };
    } else {
      return {
        title: 'Your Environmental Impact',
        description: 'See how many Earth resources we would need if everyone lived like you',
        target: 'Sustainable target',
        current: 'Your current footprint'
      };
    }
  };

  const labels = getLabels();

  const renderWorlds = () => {
    if (worldsNeeded <= 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-green-400"></div>
          <p className="text-lg font-semibold text-green-400">
            Congratulations! You're living sustainably!
          </p>
        </div>
      );
    }

    const worlds = [];
    const totalWorlds = Math.min(20, Math.max(1, maxDisplayWorlds)); // Cap at 20 worlds for display
    
    for (let i = 0; i < totalWorlds; i++) {
      const isFullWorld = i < Math.floor(worldsNeeded);
      const isPartialWorld = i === Math.floor(worldsNeeded) && worldsNeeded % 1 !== 0;
      const partialAmount = worldsNeeded % 1;
      
      worlds.push(
        <div
          key={i}
          className="relative transform transition-all duration-300 ease-in-out hover:scale-110"
          style={{
            animationDelay: `${i * 0.1}s`,
            animation: `fadeIn 0.6s ease-in-out ${i * 0.1}s both`
          }}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Globe 
              className="w-5 h-5 text-white"
              strokeWidth={1}
              style={{
                opacity: (isFullWorld || isPartialWorld) ? (isPartialWorld ? partialAmount : 1) : 0.2
              }}
            />
          </div>
        </div>
      );
    }

    return worlds;
  };

  return (
    <div className="w-full">
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-white shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {labels.title}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {labels.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-lg font-semibold mb-2">
              {worldsNeeded.toFixed(1)} Earth{worldsNeeded !== 1 ? 's' : ''} needed
            </p>
          </div>
          
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-8 justify-items-center max-w-4xl mx-auto">
            {renderWorlds()}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm p-4 rounded-lg bg-slate-700/50 text-slate-300">
            <div className="text-center flex-1">
              <div className="font-semibold text-white mb-2 break-words">
                {labels.target}
              </div>
              <div className="text-slate-300 break-words">{(sustainableFootprint / 1000).toFixed(1)} tons CO₂/year {mode === 'business' ? 'per employee' : 'per person'}</div>
            </div>
            <div className="text-center flex-1">
              <div className="font-semibold text-white mb-2 break-words">
                {labels.current}
              </div>
              <div className="text-slate-300 break-words">{(footprintToUse / 1000).toFixed(1)} tons CO₂/year</div>
              {carbonSaved > 0 && (
                <div className="text-green-400 text-xs mt-1">
                  -{(carbonSaved / 1000).toFixed(1)} tons from actions
                </div>
              )}
              {totalCostSavings > 0 && (
                <div className="text-yellow-400 text-xs mt-1 flex items-center justify-center gap-1">
                  <PoundSterling className="w-3 h-3" strokeWidth={1} />
                  £{totalCostSavings.toLocaleString()}/year saved
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldsDisplay;
