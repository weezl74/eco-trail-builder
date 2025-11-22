import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BusinessProfile } from '@/components/BusinessProfile';
import { caerphillyBusinesses } from '@/components/BusinessCommunityPledges';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';

const BusinessImpactPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('community');
  const [mode, setMode] = useState<'resident' | 'business'>('business');

  const handleTabChange = (tab: string) => {
    if (tab === 'community') {
      navigate('/business-community');
    } else {
      // Navigate back to main app for other tabs
      navigate('/');
    }
  };

  const business = caerphillyBusinesses.find(b => b.id === businessId);

  if (!business) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Business Not Found</h1>
          <Button onClick={() => navigate('/business-community')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  // Calculate coordinates based on location (approximate)
  const locationCoordinates: Record<string, { lat: number; lng: number }> = {
    'Caerphilly Town': { lat: 51.5775, lng: -3.2186 },
    'Cwm Caerphilly': { lat: 51.5825, lng: -3.2086 },
    'Caerphilly': { lat: 51.5775, lng: -3.2186 },
    'Ystrad Mynach': { lat: 51.6419, lng: -3.2419 },
    'Bedwas': { lat: 51.5889, lng: -3.2089 },
    'Caerphilly Castle Quarter': { lat: 51.5778, lng: -3.2178 },
    'Bargoed': { lat: 51.6922, lng: -3.2319 },
    'Caerphilly Business Park': { lat: 51.5830, lng: -3.2280 },
    'Nelson': { lat: 51.6675, lng: -3.2897 },
    'Rhymney': { lat: 51.7608, lng: -3.2844 }
  };

  const coords = locationCoordinates[business.location] || { lat: 51.5775, lng: -3.2186 };

  return (
    <>
      <div className="min-h-screen bg-black pb-20">
        <div className="p-4">
          <Button 
            onClick={() => navigate('/business-community')} 
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </div>
        
        <BusinessProfile
          business={{
            business_name: business.business_name,
            waste_footprint: business.waste_footprint,
            travel_footprint: business.travel_footprint,
            energy_footprint: business.energy_footprint,
            latitude: coords.lat,
            longitude: coords.lng,
            climate_goals: business.climate_goals,
            pen_portrait: business.pen_portrait
          }}
        />
      </div>
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        mode={mode}
        onModeChange={setMode}
      />
    </>
  );
};

export default BusinessImpactPage;
