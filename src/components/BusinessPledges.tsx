import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Factory, Truck, Zap, Recycle, Users, TreePine } from 'lucide-react';

interface BusinessPledge {
  category: string;
  action: string;
  impact_value: number;
  points_earned: number;
}

const businessPledgeCategories = [
  {
    category: 'Energy',
    icon: Zap,
    pledges: [
      { action: 'Switch to LED lighting throughout facility', impact_value: 150, points_earned: 50 },
      { action: 'Install smart thermostats and energy monitoring', impact_value: 200, points_earned: 75 },
      { action: 'Implement motion-sensor lighting in low-traffic areas', impact_value: 100, points_earned: 40 },
      { action: 'Upgrade to energy-efficient HVAC systems', impact_value: 300, points_earned: 100 },
      { action: 'Install solar panels on facility roof', impact_value: 500, points_earned: 200 }
    ]
  },
  {
    category: 'Transport',
    icon: Truck,
    pledges: [
      { action: 'Transition fleet to electric/hybrid vehicles', impact_value: 400, points_earned: 150 },
      { action: 'Implement staff carpool program', impact_value: 120, points_earned: 50 },
      { action: 'Provide cycle-to-work scheme and bike storage', impact_value: 80, points_earned: 35 },
      { action: 'Optimize delivery routes using route planning software', impact_value: 150, points_earned: 60 },
      { action: 'Offer remote work options to reduce commuting', impact_value: 180, points_earned: 70 }
    ]
  },
  {
    category: 'Waste',
    icon: Recycle,
    pledges: [
      { action: 'Implement comprehensive recycling program', impact_value: 100, points_earned: 40 },
      { action: 'Eliminate single-use plastics from operations', impact_value: 120, points_earned: 50 },
      { action: 'Partner with local composting facility', impact_value: 90, points_earned: 35 },
      { action: 'Conduct waste audit and set reduction targets', impact_value: 80, points_earned: 30 },
      { action: 'Donate surplus materials to community projects', impact_value: 70, points_earned: 25 }
    ]
  },
  {
    category: 'Supply Chain',
    icon: Factory,
    pledges: [
      { action: 'Source from local suppliers within 50 miles', impact_value: 180, points_earned: 70 },
      { action: 'Require sustainability certifications from suppliers', impact_value: 150, points_earned: 60 },
      { action: 'Implement vendor sustainability scorecard', impact_value: 100, points_earned: 40 },
      { action: 'Switch to eco-friendly packaging materials', impact_value: 130, points_earned: 50 },
      { action: 'Reduce packaging by 25%', impact_value: 110, points_earned: 45 }
    ]
  },
  {
    category: 'Employee Engagement',
    icon: Users,
    pledges: [
      { action: 'Launch green team and sustainability champions program', impact_value: 90, points_earned: 35 },
      { action: 'Provide climate action training for all staff', impact_value: 70, points_earned: 30 },
      { action: 'Implement sustainability suggestion scheme', impact_value: 60, points_earned: 25 },
      { action: 'Organize quarterly volunteer environmental days', impact_value: 80, points_earned: 35 },
      { action: 'Create sustainability performance incentives', impact_value: 100, points_earned: 40 }
    ]
  },
  {
    category: 'Nature & Biodiversity',
    icon: TreePine,
    pledges: [
      { action: 'Create wildlife-friendly green spaces on site', impact_value: 120, points_earned: 50 },
      { action: 'Partner with local tree planting initiatives', impact_value: 150, points_earned: 60 },
      { action: 'Install bird boxes and insect hotels', impact_value: 50, points_earned: 20 },
      { action: 'Adopt pesticide-free grounds maintenance', impact_value: 80, points_earned: 30 },
      { action: 'Support local biodiversity projects financially', impact_value: 100, points_earned: 40 }
    ]
  }
];

export const BusinessPledges: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Energy');
  const [completedPledges, setCompletedPledges] = useState<Set<string>>(new Set());

  const handlePledgeComplete = (pledge: BusinessPledge) => {
    const pledgeKey = `${pledge.category}-${pledge.action}`;
    setCompletedPledges(prev => new Set([...prev, pledgeKey]));
  };

  const selectedCategoryData = businessPledgeCategories.find(c => c.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {businessPledgeCategories.map(({ category, icon: Icon }) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {category}
          </Button>
        ))}
      </div>

      {/* Pledges List */}
      <div className="space-y-3">
        {selectedCategoryData?.pledges.map((pledge, idx) => {
          const pledgeKey = `${selectedCategory}-${pledge.action}`;
          const isCompleted = completedPledges.has(pledgeKey);

          return (
            <Card 
              key={idx} 
              className={`p-4 transition-all ${
                isCompleted ? 'bg-primary/10 border-primary' : 'hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    <h4 className="font-semibold text-foreground">{pledge.action}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {pledge.impact_value} kg CO₂e saved/year
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      {pledge.points_earned} points
                    </Badge>
                  </div>
                </div>
                {!isCompleted && (
                  <Button 
                    onClick={() => handlePledgeComplete({ ...pledge, category: selectedCategory })}
                    size="sm"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
