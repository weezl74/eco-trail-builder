import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessAvatar } from '@/components/BusinessAvatar';
import { MapPin, Target, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Business {
  id: string;
  business_name: string;
  business_type: string;
  climate_goals: string;
  pen_portrait: string;
  waste_footprint: number;
  travel_footprint: number;
  energy_footprint: number;
  location: string;
  year_established?: number;
  employees?: number;
  pledges: Array<{
    action: string;
    category: string;
    impact: number;
  }>;
  kudos: number;
}

const caerphillyBusinesses: Business[] = [
  {
    id: '1',
    business_name: 'Crafty Legs Events',
    business_type: 'Events & Catering',
    location: 'Caerphilly Town',
    year_established: 2015,
    employees: 12,
    climate_goals: 'Net Zero by 2028',
    pen_portrait: 'Award-winning sustainable events company committed to zero-waste catering and local sourcing.',
    waste_footprint: 180,
    travel_footprint: 320,
    energy_footprint: 250,
    pledges: [
      { action: 'Zero-waste catering at all events', category: 'Waste', impact: 85 },
      { action: 'Source 100% local ingredients', category: 'Travel', impact: 60 },
      { action: 'Reusable event equipment only', category: 'Waste', impact: 35 }
    ],
    kudos: 47
  },
  {
    id: '2',
    business_name: 'Cwm Bakery',
    business_type: 'Artisan Bakery',
    location: 'Cwm Caerphilly',
    year_established: 2010,
    employees: 6,
    climate_goals: 'Zero Food Waste by 2025',
    pen_portrait: 'Traditional Welsh bakery using locally-milled flour and sustainable practices.',
    waste_footprint: 140,
    travel_footprint: 260,
    energy_footprint: 380,
    pledges: [
      { action: 'Donate all unsold goods to food banks', category: 'Waste', impact: 70 },
      { action: 'Switch to renewable energy ovens', category: 'Energy', impact: 120 },
      { action: 'Use only local Welsh flour', category: 'Travel', impact: 45 }
    ],
    kudos: 38
  },
  {
    id: '3',
    business_name: 'Matt La Vi Musician',
    business_type: 'Music & Entertainment',
    location: 'Caerphilly',
    year_established: 2014,
    employees: 1,
    climate_goals: 'Carbon Neutral Touring by 2026',
    pen_portrait: 'Professional musician committed to sustainable performance practices.',
    waste_footprint: 45,
    travel_footprint: 210,
    energy_footprint: 120,
    pledges: [
      { action: 'Public transport for all local gigs', category: 'Travel', impact: 90 },
      { action: 'Digital-only marketing materials', category: 'Waste', impact: 25 },
      { action: 'Host monthly environmental benefit concerts', category: 'Community', impact: 50 }
    ],
    kudos: 52
  },
  {
    id: '4',
    business_name: 'EcoBrix',
    business_type: 'Sustainable Construction',
    location: 'Ystrad Mynach',
    year_established: 2020,
    employees: 25,
    climate_goals: 'Net Zero Supply Chain by 2027',
    pen_portrait: 'Innovative construction company specializing in recycled building materials.',
    waste_footprint: 120,
    travel_footprint: 450,
    energy_footprint: 380,
    pledges: [
      { action: 'Use 80% recycled materials', category: 'Waste', impact: 110 },
      { action: 'Electric vehicle fleet', category: 'Travel', impact: 200 },
      { action: 'Solar-powered site equipment', category: 'Energy', impact: 95 }
    ],
    kudos: 64
  },
  {
    id: '5',
    business_name: 'Spirafix',
    business_type: 'Engineering Solutions',
    location: 'Bedwas',
    year_established: 2012,
    employees: 35,
    climate_goals: '50% Carbon Reduction by 2026',
    pen_portrait: 'Precision engineering firm implementing lean manufacturing and waste reduction.',
    waste_footprint: 280,
    travel_footprint: 520,
    energy_footprint: 680,
    pledges: [
      { action: 'Implement lean manufacturing', category: 'Waste', impact: 140 },
      { action: 'Install rooftop solar panels', category: 'Energy', impact: 280 },
      { action: 'Hybrid company vehicles', category: 'Travel', impact: 160 }
    ],
    kudos: 31
  },
  {
    id: '6',
    business_name: 'Caerphilly Cheese Co.',
    business_type: 'Food Production',
    location: 'Caerphilly Castle Quarter',
    year_established: 1830,
    employees: 18,
    climate_goals: 'Regenerative Agriculture by 2028',
    pen_portrait: 'Historic cheese producer partnering with local regenerative farms.',
    waste_footprint: 200,
    travel_footprint: 380,
    energy_footprint: 450,
    pledges: [
      { action: 'Partner with regenerative farms only', category: 'Community', impact: 150 },
      { action: 'Biodegradable packaging', category: 'Waste', impact: 50 },
      { action: 'Methane capture system', category: 'Energy', impact: 180 }
    ],
    kudos: 55
  },
  {
    id: '7',
    business_name: 'Green Valley Brewery',
    business_type: 'Craft Brewing',
    location: 'Bargoed',
    year_established: 2019,
    employees: 15,
    climate_goals: 'Water Neutral by 2026',
    pen_portrait: 'Award-winning craft brewery with closed-loop water systems.',
    waste_footprint: 160,
    travel_footprint: 290,
    energy_footprint: 350,
    pledges: [
      { action: 'Closed-loop water recycling', category: 'Energy', impact: 120 },
      { action: 'Donate grain waste to local farms', category: 'Waste', impact: 80 },
      { action: '100% renewable energy', category: 'Energy', impact: 230 }
    ],
    kudos: 43
  },
  {
    id: '8',
    business_name: 'TechCymru Solutions',
    business_type: 'IT Services',
    location: 'Caerphilly Business Park',
    year_established: 2016,
    employees: 42,
    climate_goals: 'Carbon Negative by 2027',
    pen_portrait: 'Digital-first company with remote-work policies reducing commuting emissions.',
    waste_footprint: 80,
    travel_footprint: 180,
    energy_footprint: 420,
    pledges: [
      { action: 'Remote-first work policy', category: 'Travel', impact: 180 },
      { action: 'Green web hosting', category: 'Energy', impact: 220 },
      { action: 'Develop climate tech solutions', category: 'Community', impact: 100 }
    ],
    kudos: 29
  },
  {
    id: '9',
    business_name: 'Woodland Crafts Wales',
    business_type: 'Sustainable Furniture',
    location: 'Nelson',
    year_established: 2017,
    employees: 10,
    climate_goals: 'Carbon Positive by 2025',
    pen_portrait: 'Furniture makers using locally-sourced sustainable timber.',
    waste_footprint: 90,
    travel_footprint: 220,
    energy_footprint: 280,
    pledges: [
      { action: 'Plant 3 trees for every 1 used', category: 'Community', impact: 200 },
      { action: 'Zero-waste workshop', category: 'Waste', impact: 90 },
      { action: 'Local timber only', category: 'Travel', impact: 110 }
    ],
    kudos: 71
  },
  {
    id: '10',
    business_name: 'Rhymney Renewables',
    business_type: 'Solar Installation',
    location: 'Rhymney',
    year_established: 2021,
    employees: 20,
    climate_goals: 'Enable 1000 homes by 2026',
    pen_portrait: 'Social enterprise installing solar panels for homes and businesses across Caerphilly.',
    waste_footprint: 110,
    travel_footprint: 340,
    energy_footprint: 200,
    pledges: [
      { action: 'Install 1000 home solar systems', category: 'Energy', impact: 500 },
      { action: 'Train local apprentices', category: 'Community', impact: 80 },
      { action: 'Carbon-neutral operations', category: 'Travel', impact: 140 }
    ],
    kudos: 82
  },
  {
    id: '11',
    business_name: 'Castle View Café',
    business_type: 'Café & Restaurant',
    location: 'Caerphilly Castle',
    year_established: 2009,
    employees: 14,
    climate_goals: 'Single-Use Plastic Free by 2025',
    pen_portrait: 'Family-run café serving locally-sourced Welsh produce with zero plastic policy.',
    waste_footprint: 95,
    travel_footprint: 240,
    energy_footprint: 310,
    pledges: [
      { action: 'Ban all single-use plastics', category: 'Waste', impact: 75 },
      { action: 'Compost all food waste', category: 'Waste', impact: 40 },
      { action: 'Source 90% ingredients locally', category: 'Travel', impact: 85 }
    ],
    kudos: 45
  },
  {
    id: '12',
    business_name: 'Valleys Vegan Kitchen',
    business_type: 'Plant-Based Restaurant',
    location: 'Blackwood',
    year_established: 2022,
    employees: 8,
    climate_goals: 'Carbon Negative Operations',
    pen_portrait: 'Innovative plant-based restaurant demonstrating the climate benefits of sustainable food.',
    waste_footprint: 60,
    travel_footprint: 180,
    energy_footprint: 220,
    pledges: [
      { action: '100% plant-based menu', category: 'Community', impact: 150 },
      { action: 'Zero food waste policy', category: 'Waste', impact: 60 },
      { action: 'Cycle delivery service', category: 'Travel', impact: 90 }
    ],
    kudos: 68
  },
  {
    id: '13',
    business_name: 'Repair Café Caerphilly',
    business_type: 'Community Repair',
    location: 'Caerphilly Town Centre',
    year_established: 2020,
    employees: 5,
    climate_goals: 'Save 10,000 items from landfill annually',
    pen_portrait: 'Social enterprise teaching repair skills and extending product lifespans.',
    waste_footprint: 30,
    travel_footprint: 120,
    energy_footprint: 180,
    pledges: [
      { action: 'Free repair workshops monthly', category: 'Community', impact: 120 },
      { action: 'Divert 10k items from landfill', category: 'Waste', impact: 200 },
      { action: 'Partner with 20 local schools', category: 'Community', impact: 80 }
    ],
    kudos: 91
  },
  {
    id: '14',
    business_name: 'Morgan Motors Electric',
    business_type: 'EV Charging & Services',
    location: 'Newbridge',
    year_established: 2021,
    employees: 12,
    climate_goals: 'Accelerate EV Adoption',
    pen_portrait: 'Leading EV charging network and conversion specialists across the borough.',
    waste_footprint: 70,
    travel_footprint: 280,
    energy_footprint: 420,
    pledges: [
      { action: 'Install 50 public EV chargers', category: 'Energy', impact: 300 },
      { action: 'Convert 100 classic cars to EV', category: 'Travel', impact: 180 },
      { action: '100% renewable energy supply', category: 'Energy', impact: 120 }
    ],
    kudos: 57
  },
  {
    id: '15',
    business_name: 'Circular Textiles Wales',
    business_type: 'Textile Recycling',
    location: 'Hengoed',
    year_established: 2019,
    employees: 16,
    climate_goals: 'Zero Textile Waste by 2027',
    pen_portrait: 'Innovative textile recycling creating new products from waste fabrics.',
    waste_footprint: 50,
    travel_footprint: 310,
    energy_footprint: 270,
    pledges: [
      { action: 'Recycle 100 tonnes textiles annually', category: 'Waste', impact: 250 },
      { action: 'Upcycling workshops for residents', category: 'Community', impact: 60 },
      { action: 'Partner with 15 clothing retailers', category: 'Community', impact: 90 }
    ],
    kudos: 39
  },
  {
    id: '16',
    business_name: 'Aber Valley Organics',
    business_type: 'Organic Farm Shop',
    location: 'Abertridwr',
    year_established: 2013,
    employees: 11,
    climate_goals: 'Regenerative Farming Model',
    pen_portrait: 'Farm shop championing regenerative agriculture and biodiversity.',
    waste_footprint: 85,
    travel_footprint: 200,
    energy_footprint: 290,
    pledges: [
      { action: 'Restore 50 acres to wildflower meadow', category: 'Community', impact: 180 },
      { action: 'Zero-plastic packaging', category: 'Waste', impact: 65 },
      { action: 'Carbon-negative farming practices', category: 'Energy', impact: 140 }
    ],
    kudos: 74
  },
  {
    id: '17',
    business_name: 'Pedal Power Caerphilly',
    business_type: 'Bike Shop & Café',
    location: 'Caerphilly Station',
    year_established: 2018,
    employees: 9,
    climate_goals: 'Double Cycling Commuters by 2026',
    pen_portrait: 'Bike shop promoting active travel with repair services and cycle-friendly café.',
    waste_footprint: 40,
    travel_footprint: 150,
    energy_footprint: 200,
    pledges: [
      { action: 'Free bike maintenance classes', category: 'Community', impact: 100 },
      { action: 'Cycle-to-work partnerships', category: 'Travel', impact: 220 },
      { action: 'Refurbish 500 bikes annually', category: 'Waste', impact: 80 }
    ],
    kudos: 63
  },
  {
    id: '18',
    business_name: 'Green Spaces Landscaping',
    business_type: 'Sustainable Landscaping',
    location: 'Ystrad Mynach',
    year_established: 2015,
    employees: 18,
    climate_goals: 'Native Species & Wildlife Corridors',
    pen_portrait: 'Landscaping company specializing in native planting and wildlife habitats.',
    waste_footprint: 120,
    travel_footprint: 380,
    energy_footprint: 310,
    pledges: [
      { action: 'Plant 5000 native trees/shrubs', category: 'Community', impact: 280 },
      { action: 'Create 20 wildlife corridors', category: 'Community', impact: 150 },
      { action: 'Electric equipment only', category: 'Energy', impact: 110 }
    ],
    kudos: 48
  },
  {
    id: '19',
    business_name: 'Community Energy Co-op',
    business_type: 'Energy Cooperative',
    location: 'Bargoed',
    year_established: 2020,
    employees: 7,
    climate_goals: 'Power 5000 Homes with Renewables',
    pen_portrait: 'Community-owned renewable energy cooperative democratizing green power.',
    waste_footprint: 25,
    travel_footprint: 160,
    energy_footprint: 150,
    pledges: [
      { action: 'Install community solar farms', category: 'Energy', impact: 450 },
      { action: 'Energy poverty support program', category: 'Community', impact: 120 },
      { action: 'Local renewable energy education', category: 'Community', impact: 70 }
    ],
    kudos: 86
  },
  {
    id: '20',
    business_name: 'Zero Waste Refill Shop',
    business_type: 'Package-Free Retail',
    location: 'Caerphilly Market',
    year_established: 2021,
    employees: 4,
    climate_goals: 'Eliminate 1 Million Plastic Items',
    pen_portrait: 'Package-free shop helping residents reduce single-use plastic waste.',
    waste_footprint: 15,
    travel_footprint: 90,
    energy_footprint: 140,
    pledges: [
      { action: 'Save 1M plastic items from landfill', category: 'Waste', impact: 300 },
      { action: 'Partner with 30 local producers', category: 'Community', impact: 85 },
      { action: 'Monthly zero-waste workshops', category: 'Community', impact: 55 }
    ],
    kudos: 79
  }
];

export const BusinessCommunityPledges: React.FC = () => {
  const navigate = useNavigate();

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  return (
    <div className="bg-black min-h-screen p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Business Community</h1>
          <p className="text-cyan-400 text-lg">Climate pledges from local businesses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caerphillyBusinesses.map((business) => {
            const totalFootprint = business.waste_footprint + business.travel_footprint + business.energy_footprint;
            
            return (
              <Card 
                key={business.id} 
                className="bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                onClick={() => handleBusinessClick(business.id)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleBusinessClick(business.id);
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{business.business_name}</h3>
                      <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        {business.location}
                      </div>
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                        {business.business_type}
                      </Badge>
                    </div>
                    <BusinessAvatar business={business} size={70} />
                  </div>

                  {/* Climate Goal */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-400 font-semibold">CLIMATE GOAL</span>
                    </div>
                    <p className="text-white font-bold">{business.climate_goals}</p>
                  </div>

                  {/* Pledges */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <div className="text-xs text-gray-400 font-semibold">ACTIVE PLEDGES</div>
                    </div>
                    {business.pledges.map((pledge, idx) => (
                      <div key={idx} className="bg-black/30 rounded p-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-white">{pledge.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs border-zinc-700 text-gray-400">
                                {pledge.category}
                              </Badge>
                              <span className="text-xs text-cyan-400">-{pledge.impact} CO₂e</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kudos */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      <span className="text-white font-bold">{business.kudos}</span>
                      <span className="text-gray-400 text-sm">kudos</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total Impact: {totalFootprint} CO₂e
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { caerphillyBusinesses };
