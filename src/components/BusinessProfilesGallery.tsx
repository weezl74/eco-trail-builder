import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessAvatar } from '@/components/BusinessAvatar';
import { MapPin, Target, TrendingUp } from 'lucide-react';

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
    pen_portrait: 'Award-winning sustainable events company committed to zero-waste catering and local sourcing. Pioneering reusable event equipment and partnering with local farms to reduce food miles.',
    waste_footprint: 180,
    travel_footprint: 320,
    energy_footprint: 250
  },
  {
    id: '2',
    business_name: 'Cwm Bakery',
    business_type: 'Artisan Bakery',
    location: 'Cwm Caerphilly',
    year_established: 2010,
    employees: 6,
    climate_goals: 'Zero Food Waste by 2025',
    pen_portrait: 'Traditional Welsh bakery using locally-milled flour and sustainable practices. Partnering with food banks to donate unsold goods and transitioning to renewable energy for ovens.',
    waste_footprint: 140,
    travel_footprint: 260,
    energy_footprint: 380
  },
  {
    id: '3',
    business_name: 'Matt La Vi Musician',
    business_type: 'Music & Entertainment',
    location: 'Caerphilly',
    year_established: 2014,
    employees: 1,
    climate_goals: 'Carbon Neutral Touring by 2026',
    pen_portrait: 'Professional musician committed to sustainable performance practices. Using public transport for gigs, digital marketing to reduce print waste, and supporting local environmental causes through benefit concerts.',
    waste_footprint: 45,
    travel_footprint: 210,
    energy_footprint: 120
  },
  {
    id: '4',
    business_name: 'EcoBrix',
    business_type: 'Sustainable Construction',
    location: 'Ystrad Mynach',
    year_established: 2020,
    employees: 25,
    climate_goals: 'Net Zero Supply Chain by 2027',
    pen_portrait: 'Innovative construction company specializing in recycled building materials. Creating low-carbon bricks from waste materials and promoting circular economy principles in construction.',
    waste_footprint: 120,
    travel_footprint: 450,
    energy_footprint: 380
  },
  {
    id: '5',
    business_name: 'Spirafix',
    business_type: 'Engineering Solutions',
    location: 'Bedwas',
    year_established: 2012,
    employees: 35,
    climate_goals: '50% Carbon Reduction by 2026',
    pen_portrait: 'Precision engineering firm implementing lean manufacturing and waste reduction. Investing in renewable energy and developing energy-efficient product designs for automotive sector.',
    waste_footprint: 280,
    travel_footprint: 520,
    energy_footprint: 680
  },
  {
    id: '6',
    business_name: 'Caerphilly Cheese Co.',
    business_type: 'Food Production',
    location: 'Caerphilly Castle Quarter',
    year_established: 1830,
    employees: 18,
    climate_goals: 'Regenerative Agriculture by 2028',
    pen_portrait: 'Historic cheese producer partnering with local regenerative farms. Implementing methane capture, renewable energy, and biodegradable packaging while supporting traditional craftsmanship.',
    waste_footprint: 200,
    travel_footprint: 380,
    energy_footprint: 450
  },
  {
    id: '7',
    business_name: 'Green Valley Brewery',
    business_type: 'Craft Brewing',
    location: 'Bargoed',
    year_established: 2019,
    employees: 15,
    climate_goals: 'Water Neutral by 2026',
    pen_portrait: 'Award-winning craft brewery with closed-loop water systems. Using local ingredients, donating grain waste to farms, and operating on 100% renewable energy with ambitious water conservation targets.',
    waste_footprint: 160,
    travel_footprint: 290,
    energy_footprint: 350
  },
  {
    id: '8',
    business_name: 'TechCymru Solutions',
    business_type: 'IT Services',
    location: 'Caerphilly Business Park',
    year_established: 2016,
    employees: 42,
    climate_goals: 'Carbon Negative by 2027',
    pen_portrait: 'Digital-first company with remote-work policies reducing commuting emissions. Using green hosting, offsetting all operations, and developing climate tech solutions for Welsh businesses.',
    waste_footprint: 80,
    travel_footprint: 180,
    energy_footprint: 420
  },
  {
    id: '9',
    business_name: 'Woodland Crafts Wales',
    business_type: 'Sustainable Furniture',
    location: 'Nelson',
    year_established: 2017,
    employees: 10,
    climate_goals: 'Carbon Positive by 2025',
    pen_portrait: 'Furniture makers using locally-sourced sustainable timber. Planting three trees for every one used, zero-waste workshop practices, and creating heirloom-quality pieces designed to last generations.',
    waste_footprint: 90,
    travel_footprint: 220,
    energy_footprint: 280
  },
  {
    id: '10',
    business_name: 'Rhymney Renewables',
    business_type: 'Solar Installation',
    location: 'Rhymney',
    year_established: 2021,
    employees: 20,
    climate_goals: 'Enable 1000 homes by 2026',
    pen_portrait: 'Social enterprise installing solar panels for homes and businesses across Caerphilly. Operating carbon-neutral, training local apprentices, and making renewable energy accessible to all communities.',
    waste_footprint: 110,
    travel_footprint: 340,
    energy_footprint: 200
  }
];

export const BusinessProfilesGallery: React.FC = () => {
  return (
    <div className="bg-black min-h-screen p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Business Community</h1>
          <p className="text-cyan-400 text-lg">Leading climate action across Caerphilly County Borough</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caerphillyBusinesses.map((business) => {
            const totalFootprint = business.waste_footprint + business.travel_footprint + business.energy_footprint;
            
            return (
              <Card key={business.id} className="bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 transition-all">
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

                  {/* Pen Portrait */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {business.pen_portrait}
                  </p>

                  {/* Climate Goal */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-400 font-semibold">CLIMATE GOAL</span>
                    </div>
                    <p className="text-white font-bold">{business.climate_goals}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/50 rounded p-2 text-center">
                      <div className="text-xs text-gray-400 mb-1">Score</div>
                      <div className="text-lg font-bold text-cyan-400">{totalFootprint}</div>
                      <div className="text-xs text-gray-500">CO₂e</div>
                    </div>
                    {business.employees && (
                      <div className="bg-black/50 rounded p-2 text-center">
                        <div className="text-xs text-gray-400 mb-1">Team</div>
                        <div className="text-lg font-bold text-white">{business.employees}</div>
                        <div className="text-xs text-gray-500">people</div>
                      </div>
                    )}
                    {business.year_established && (
                      <div className="bg-black/50 rounded p-2 text-center">
                        <div className="text-xs text-gray-400 mb-1">Since</div>
                        <div className="text-lg font-bold text-white">{business.year_established}</div>
                        <div className="text-xs text-gray-500">est.</div>
                      </div>
                    )}
                  </div>

                  {/* Footprint Breakdown */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-400">Waste: {business.waste_footprint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-400">Travel: {business.travel_footprint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-400">Energy: {business.energy_footprint}</span>
                      </div>
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
