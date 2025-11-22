import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessCarbonReport } from '@/components/BusinessCarbonReport';

const BusinessCarbonReportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <BusinessCarbonReport 
      onComplete={(totalEmissions) => {
        console.log('Carbon report completed:', totalEmissions);
      }}
      onClose={() => navigate('/business-community')}
    />
  );
};

export default BusinessCarbonReportPage;