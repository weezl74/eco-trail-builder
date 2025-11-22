import React from 'react';
import { Card } from '@/components/ui/card';
import { BusinessAvatar } from '@/components/BusinessAvatar';
import { BusinessLocationMap } from '@/components/BusinessLocationMap';
import { ArrowUp, Target } from 'lucide-react';

interface BusinessProfileProps {
  business: {
    business_name: string;
    waste_footprint: number;
    travel_footprint: number;
    energy_footprint: number;
    latitude?: number;
    longitude?: number;
    climate_goals?: string;
    pen_portrait?: string;
  };
}

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ business }) => {
  const total = business.waste_footprint + business.travel_footprint + business.energy_footprint;
  // Adjusted rating to ensure minimum 3 stars, with better businesses getting 4-5 stars
  const rating = Math.max(3, Math.min(5, Math.floor((800 - total) / 160)));
  const carbonSavings = Math.floor(total * 0.15);
  const costSavings = Math.floor(carbonSavings * 0.12);
  const communityRanking = 3;
  const communityGrowth = 17;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20 font-roboto">
      {/* Header with Business Name and Avatar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">{business.business_name}</h1>
          {business.climate_goals && (
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-4 h-4" />
              <span className="text-sm">{business.climate_goals}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <BusinessAvatar 
            business={{
              waste_footprint: business.waste_footprint,
              travel_footprint: business.travel_footprint,
              energy_footprint: business.energy_footprint
            }} 
            size={80} 
          />
        </div>
      </div>

      {/* Pen Portrait */}
      {business.pen_portrait && (
        <Card className="mb-6 p-4 bg-card border-2 border-border rounded-2xl">
          <p className="text-foreground leading-relaxed">{business.pen_portrait}</p>
        </Card>
      )}

      {/* Compact Layout - Map and All Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Map - Smaller size */}
        <Card className="p-0 overflow-hidden h-[220px] md:h-[260px] bg-card border-2 border-border rounded-2xl">
          <BusinessLocationMap 
            businessName={business.business_name}
            latitude={business.latitude || 51.5775}
            longitude={business.longitude || -3.2186}
          />
        </Card>

        {/* All Stats Cards in Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Metrics Card */}
          <Card className="p-4 bg-card border-2 border-border rounded-2xl col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rating</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 ${i < rating ? 'bg-primary' : 'bg-muted'} transition-colors`}
                      style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <p className="text-lg font-bold text-primary">{total} CO₂e</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Savings</p>
                <p className="text-sm font-semibold text-foreground">£{costSavings}-{costSavings * 10}</p>
              </div>
            </div>
          </Card>

          {/* Community Ranking Card */}
          <Card className="p-4 bg-card border-2 border-primary/20 rounded-2xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">#{communityRanking}</p>
              <p className="text-xs text-muted-foreground">Community</p>
              <p className="text-xs text-muted-foreground">Ranking</p>
            </div>
          </Card>

          {/* Community Growth Card */}
          <Card className="p-4 bg-card border-2 border-primary/20 rounded-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowUp className="w-5 h-5 text-green-600" />
                <p className="text-3xl font-bold text-primary">{communityGrowth}</p>
              </div>
              <p className="text-xs text-muted-foreground">Community</p>
              <p className="text-xs text-muted-foreground">Growth</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Carbon Savings Estimate */}
      <Card className="p-8 bg-card border-2 border-primary rounded-2xl mb-6">
        <div className="text-center">
          <p className="text-lg text-primary mb-4">Carbon Savings Estimate</p>
          <p className="text-7xl font-bold text-primary mb-4">{carbonSavings}M</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse delay-75" />
            <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse delay-150" />
          </div>
        </div>
      </Card>

      {/* Additional Impact Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-card border-2 border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Waste</p>
          <p className="text-2xl font-bold text-primary">{business.waste_footprint}</p>
        </Card>
        <Card className="p-4 text-center bg-card border-2 border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Travel</p>
          <p className="text-2xl font-bold text-primary">{business.travel_footprint}</p>
        </Card>
        <Card className="p-4 text-center bg-card border-2 border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Energy</p>
          <p className="text-2xl font-bold text-primary">{business.energy_footprint}</p>
        </Card>
      </div>
    </div>
  );
};
