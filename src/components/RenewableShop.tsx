import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Wind, Sun, Thermometer, Droplet, Factory, Home, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RenewableTech {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  impact: string;
  icon: React.ReactNode;
  type: string;
}

interface RenewableShopProps {
  totalPoints: number;
  userRenewables: Array<{
    id: string;
    technology_type: string;
    points_cost: number;
  }>;
  onPurchase: (tech: RenewableTech) => void;
}

const RenewableShop: React.FC<RenewableShopProps> = ({ 
  totalPoints, 
  userRenewables, 
  onPurchase 
}) => {
  const { toast } = useToast();

  const renewableTechnologies: RenewableTech[] = [
    {
      id: 'solar',
      name: 'Solar Panels',
      description: 'Generate clean electricity from sunlight. Benefits Caerphilly by reducing grid demand and creating local energy resilience.',
      pointsCost: 100,
      impact: '2-4 kW system',
      icon: <Sun className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'solar'
    },
    {
      id: 'solar_battery',
      name: 'Solar + Battery',
      description: 'Solar panels with energy storage. Helps Caerphilly become grid-independent and provides backup power during outages.',
      pointsCost: 180,
      impact: '4 kW + 10 kWh battery',
      icon: <div className="flex"><Sun className="w-5 h-5 text-white" strokeWidth={1} /><Zap className="w-5 h-5 text-white" strokeWidth={1} /></div>,
      type: 'solar_battery'
    },
    {
      id: 'heat_pump',
      name: 'Heat Pump',
      description: 'Efficient heating and cooling system. Reduces Caerphilly\'s reliance on gas heating and cuts local air pollution.',
      pointsCost: 150,
      impact: 'Air source heat pump',
      icon: <Thermometer className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'heat_pump'
    },
    {
      id: 'wind_turbine',
      name: 'Small Wind Turbine',
      description: 'Domestic wind power generation. Utilises Caerphilly\'s hillside winds and reduces strain on the national grid.',
      pointsCost: 120,
      impact: '1-5 kW domestic turbine',
      icon: <Wind className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'wind_turbine'
    },
    {
      id: 'wind_municipal',
      name: 'Large Community Wind Turbine',
      description: 'Community wind turbine share. Powers multiple Caerphilly homes and creates local green jobs.',
      pointsCost: 200,
      impact: 'Community wind farm share',
      icon: <Wind className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'wind_municipal'
    },
    {
      id: 'green_hydrogen',
      name: 'Green Hydrogen',
      description: 'Clean hydrogen fuel system. Creates a sustainable fuel source for Caerphilly\'s transport and industry.',
      pointsCost: 250,
      impact: 'Hydrogen fuel cell system',
      icon: <Droplet className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'green_hydrogen'
    },
    {
      id: 'mine_water',
      name: 'Mine Water Heating',
      description: 'Geothermal from old mines. Transforms Caerphilly\'s mining heritage into clean heating for the community.',
      pointsCost: 180,
      impact: 'Mine water heat pump',
      icon: <Factory className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'mine_water'
    },
    {
      id: 'sles',
      name: 'Smart Local Energy',
      description: 'Integrated energy management. Creates an intelligent energy network across Caerphilly for optimal efficiency.',
      pointsCost: 160,
      impact: 'Smart energy system',
      icon: <Home className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'sles'
    },
    {
      id: 'ccus',
      name: 'Carbon Capture',
      description: 'Carbon capture & utilisation. Removes CO₂ from Caerphilly\'s air and converts it into useful materials.',
      pointsCost: 300,
      impact: 'Personal carbon offset',
      icon: <Factory className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'ccus'
    },
    {
      id: 'tree_planting',
      name: 'Tree Planting',
      description: 'Plant native broadleaf trees. Locks in carbon, cools streets and brings nature back to the Borough.',
      pointsCost: 80,
      impact: '10-tree micro-woodland',
      icon: <Wind className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'tree_planting'
    },
    {
      id: 'green_roof',
      name: 'Green Roof',
      description: 'A planted roof that insulates buildings, manages rainwater and tackles the urban heat-island effect.',
      pointsCost: 140,
      impact: 'Sedum / wildflower roof',
      icon: <Home className="w-6 h-6 text-white" strokeWidth={1} />,
      type: 'green_roof'
    }
  ];

  const handlePurchase = (tech: RenewableTech) => {
    if (totalPoints < tech.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${tech.pointsCost - totalPoints} more points to purchase ${tech.name}`,
        variant: "destructive"
      });
      return;
    }

    // Allow multiple purchases but show count
    const ownedCount = userRenewables.filter(r => r.technology_type === tech.type).length;

    onPurchase(tech);
    toast({
      title: "Technology Purchased!",
      description: `${tech.name} has been installed and is now cooling Caerphilly!`,
      variant: "default"
    });
  };

  const getOwnedCount = (techType: string) => {
    return userRenewables.filter(r => r.technology_type === techType).length;
  };

  const canAfford = (cost: number) => {
    return totalPoints >= cost;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5" strokeWidth={1} />
          Renewable Technology Shop
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {totalPoints} Points Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renewableTechnologies.map((tech) => {
            const ownedCount = getOwnedCount(tech.type);
            const affordable = canAfford(tech.pointsCost);
            
            return (
              <div
                key={tech.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  ownedCount > 0 
                    ? 'bg-green-900/30 border-green-700/50' 
                    : affordable
                    ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    : 'bg-slate-800/50 border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0">
                    {tech.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm mb-1">
                      {tech.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">
                      {tech.description}
                    </p>
                    <div className="text-xs text-slate-300">
                      {tech.impact}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-white" strokeWidth={1} />
                    <span className="text-sm font-medium text-white">
                      {tech.pointsCost}
                    </span>
                  </div>

                  {ownedCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ✓ Owned ({ownedCount})
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(tech)}
                        disabled={!affordable}
                        className={`h-6 px-2 text-xs ${
                          affordable 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3 h-3 mr-1" strokeWidth={1} />
                        Buy More
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(tech)}
                      disabled={!affordable}
                      className={`h-6 px-2 text-xs ${
                        affordable 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3 h-3 mr-1" strokeWidth={1} />
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shopping tips */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Shopping Tips</h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• Each technology cools the Caerphilly map and shows your environmental impact</li>
            <li>• Earn points by completing pledges (varies by difficulty) and sprints (2 points/day)</li>
            <li>• Knowledge articles + mini quiz = 15 points</li>
            <li>• Technologies stack - the more you own, the cooler Caerphilly becomes!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RenewableShop;