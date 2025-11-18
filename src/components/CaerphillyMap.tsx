import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Wind, Sun, Thermometer, Droplet, Factory, Home } from 'lucide-react';

interface CaerphillyMapProps {
  userRenewables: Array<{
    id: string;
    technology_type: string;
    points_cost: number;
  }>;
  totalPoints: number;
  currentFootprint: number;
  onPurchaseRenewable?: (tech: any) => void;
}

const CaerphillyMap: React.FC<CaerphillyMapProps> = ({ 
  userRenewables, 
  totalPoints, 
  currentFootprint 
}) => {
  // Calculate warming reduction based on renewables owned
  const renewableCount = userRenewables.length;
  const warmingReduction = Math.min(renewableCount * 10, 80); // Max 80% cooling
  
  // Define Caerphilly borough areas
  const boroughAreas = [
    { name: "Caerphilly Town", x: 45, y: 35, size: "large" },
    { name: "Blackwood", x: 25, y: 65, size: "medium" },
    { name: "Risca", x: 15, y: 45, size: "medium" },
    { name: "Bargoed", x: 60, y: 25, size: "medium" },
    { name: "Ystrad Mynach", x: 35, y: 50, size: "medium" },
    { name: "Nelson", x: 50, y: 60, size: "small" },
    { name: "Llanbradach", x: 40, y: 40, size: "small" },
    { name: "Bedwas", x: 35, y: 35, size: "small" },
    { name: "Rhymney", x: 70, y: 15, size: "small" },
    { name: "New Tredegar", x: 75, y: 35, size: "small" },
    { name: "Abertridwr", x: 30, y: 30, size: "small" },
    { name: "Senghenydd", x: 40, y: 25, size: "small" }
  ];

  // Get color based on warming level (red = hot, green = cool)
  const getAreaColor = (baseWarmth: number) => {
    const cooledWarmth = Math.max(0, baseWarmth - warmingReduction);
    if (cooledWarmth > 70) return 'bg-red-500';
    if (cooledWarmth > 50) return 'bg-orange-500';
    if (cooledWarmth > 30) return 'bg-yellow-500';
    if (cooledWarmth > 15) return 'bg-green-300';
    return 'bg-green-500';
  };

  // Get renewable technology icon
  const getRenewableIcon = (type: string) => {
    switch (type) {
      case 'solar': return <Sun className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'solar_battery': return <><Sun className="w-3 h-3 text-white" strokeWidth={1} /><Zap className="w-3 h-3 text-white" strokeWidth={1} /></>;
      case 'heat_pump': return <Thermometer className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'wind_turbine': return <Wind className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'wind_municipal': return <Wind className="w-5 h-5 text-white" strokeWidth={1} />;
      case 'green_hydrogen': return <Droplet className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'mine_water': return <Factory className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'sles': return <Home className="w-4 h-4 text-white" strokeWidth={1} />;
      case 'ccus': return <Factory className="w-4 h-4 text-white" strokeWidth={1} />;
      default: return <Zap className="w-4 h-4 text-white" strokeWidth={1} />;
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Caerphilly County Borough</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Hot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Warm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span>Cool</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Cold</span>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative w-full h-96 bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
          {/* Background terrain */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 opacity-30"></div>
          
          {/* Caerphilly County Borough Outline - Using thin outline based on accurate geographical boundaries */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M22,8 L28,6 L35,7 L42,9 L48,11 L55,13 L62,15 L68,17 L74,20 L79,24 L83,29 L86,35 L87,42 L86,49 L84,56 L81,62 L77,67 L72,71 L66,74 L59,76 L52,77 L45,76 L38,74 L32,71 L27,67 L23,62 L20,56 L18,49 L18,42 L19,35 L21,28 L22,21 L22,15 Z"
              fill="none"
              stroke="rgb(156 163 175 / 0.5)"
              strokeWidth="0.8"
              className="opacity-80"
            />
          </svg>
          
          {/* Borough areas */}
          {boroughAreas.map((area, index) => {
            const baseWarmth = 80 - (totalPoints / 20); // Areas start hot, cool with user points
            const areaWarmth = Math.max(10, baseWarmth + (Math.random() * 20 - 10)); // Some variation
            
            return (
              <div
                key={area.name}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 hover:scale-110 cursor-pointer group ${getAreaColor(areaWarmth)} ${
                  area.size === 'large' ? 'w-8 h-8' : 
                  area.size === 'medium' ? 'w-6 h-6' : 'w-4 h-4'
                }`}
                style={{ 
                  left: `${area.x}%`, 
                  top: `${area.y}%`,
                  boxShadow: `0 0 ${area.size === 'large' ? '12px' : area.size === 'medium' ? '8px' : '4px'} rgba(255,255,255,0.2)`
                }}
                title={area.name}
              >
                {/* Area name tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {area.name}
                </div>
              </div>
            );
          })}

          {/* Renewable technology icons scattered across map */}
          {userRenewables.map((renewable, index) => {
            const getTechExplanation = (type: string) => {
              switch (type) {
                case 'solar': return 'Solar panels convert sunlight into clean electricity, reducing reliance on fossil fuels';
                case 'solar_battery': return 'Solar + battery storage provides clean energy day and night, eliminating grid dependence';
                case 'heat_pump': return 'Heat pumps use efficient electricity instead of gas, reducing greenhouse gas emissions';
                case 'wind_turbine': return 'Wind turbines harness natural wind power to generate zero-emission electricity';
                case 'wind_municipal': return 'Community wind farms provide clean energy to multiple homes, multiplying climate impact';
                case 'green_hydrogen': return 'Green hydrogen stores renewable energy for transport and industry, replacing fossil fuels';
                case 'mine_water': return 'Mine water heating uses geothermal energy from old mines, turning heritage into climate solution';
                case 'sles': return 'Smart energy systems optimise renewable generation and consumption, maximising efficiency';
                case 'ccus': return 'Carbon capture removes CO₂ from the atmosphere and converts it into useful materials';
                default: return 'Renewable technology helps combat climate change by reducing carbon emissions';
              }
            };

            return (
              <div
                key={renewable.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse group"
                style={{
                  left: `${20 + (index * 15) % 60}%`,
                  top: `${20 + (index * 12) % 60}%`,
                  zIndex: 10
                }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                  {getRenewableIcon(renewable.technology_type)}
                </div>
                {/* Climate explanation tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none w-64 text-center">
                  {getTechExplanation(renewable.technology_type)}
                </div>
              </div>
            );
          })}

          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex justify-between items-center text-sm text-white mb-2">
                <span>Borough Cooling Progress</span>
                <span>{warmingReduction}% Cooled</span>
              </div>
              <div className="w-full bg-red-900 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${warmingReduction}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{userRenewables.length}</div>
            <div className="text-xs text-slate-400">Renewables Installed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalPoints}</div>
            <div className="text-xs text-slate-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{Math.round(warmingReduction)}%</div>
            <div className="text-xs text-slate-400">Cooling Impact</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaerphillyMap;