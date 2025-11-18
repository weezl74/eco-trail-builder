import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessAvatar } from './BusinessAvatar';
import { MapPin, Leaf } from 'lucide-react';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  climate_goals: string;
  waste_footprint: number;
  travel_footprint: number;
  energy_footprint: number;
  latitude: number;
  longitude: number;
  distance?: number;
}

// Sample Caerphilly businesses data
const sampleBusinesses: Business[] = [
  {
    id: '1',
    business_name: 'Crafty Legs Events',
    business_type: 'Event Management',
    climate_goals: 'Zero waste events by 2025. Using local suppliers and sustainable materials for all corporate events and weddings.',
    waste_footprint: 25,
    travel_footprint: 40,
    energy_footprint: 35,
    latitude: 51.5747,
    longitude: -3.2178,
    distance: 0.5
  },
  {
    id: '2',
    business_name: 'Basil and Rusty',
    business_type: 'Restaurant',
    climate_goals: 'Farm-to-table dining with 90% locally sourced ingredients. Composting all food waste and using renewable energy.',
    waste_footprint: 30,
    travel_footprint: 20,
    energy_footprint: 50,
    latitude: 51.5758,
    longitude: -3.2189,
    distance: 0.8
  },
  {
    id: '3',
    business_name: 'Nuaire',
    business_type: 'Manufacturing',
    climate_goals: 'Carbon neutral manufacturing by 2026. Leading in energy-efficient ventilation systems and green building solutions.',
    waste_footprint: 45,
    travel_footprint: 30,
    energy_footprint: 25,
    latitude: 51.5721,
    longitude: -3.2145,
    distance: 1.2
  },
  {
    id: '4',
    business_name: 'EcoBrix',
    business_type: 'Construction',
    climate_goals: 'Building the future with recycled materials. Every project uses 70% sustainable materials and net-zero energy design.',
    waste_footprint: 20,
    travel_footprint: 35,
    energy_footprint: 45,
    latitude: 51.5699,
    longitude: -3.2201,
    distance: 1.8
  },
  {
    id: '5',
    business_name: 'Spirafix',
    business_type: 'Engineering',
    climate_goals: 'Innovative fastening solutions for renewable energy projects. Helping wind and solar installations across Wales.',
    waste_footprint: 15,
    travel_footprint: 25,
    energy_footprint: 60,
    latitude: 51.5812,
    longitude: -3.2156,
    distance: 2.1
  }
];

export const BusinessCommunity: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading real data, but use sample data for now
    const loadBusinesses = async () => {
      setLoading(true);
      // Sort by distance (closest first)
      const sortedBusinesses = [...sampleBusinesses].sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setBusinesses(sortedBusinesses);
      setLoading(false);
    };

    loadBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Business Community</h2>
        <div className="text-muted-foreground">Loading local businesses...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Community</h2>
        <p className="text-muted-foreground">
          Connect with local climate-conscious businesses in Caerphilly. Support local trading and sustainable practices.
        </p>
      </div>

      <div className="grid gap-4">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Business Avatar */}
                <div className="flex-shrink-0">
                  <BusinessAvatar 
                    business={business}
                    size={80}
                  />
                </div>

                {/* Business Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{business.business_name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {business.business_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{business.distance?.toFixed(1)} miles</span>
                    </div>
                  </div>

                  {/* Climate Goals */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Climate Goals
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {business.climate_goals}
                    </p>
                  </div>

                  {/* Footprint Summary */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                      <span>Waste: {business.waste_footprint}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                      <span>Travel: {business.travel_footprint}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                      <span>Energy: {business.energy_footprint}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Join the Business Community</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Is your business missing? Add your climate goals and connect with other sustainable businesses in Caerphilly.
          </p>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Add Your Business
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};