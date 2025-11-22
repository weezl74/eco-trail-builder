import React from 'react';

interface BusinessLocationMapProps {
  businessName: string;
  latitude: number;
  longitude: number;
}

export const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  businessName,
  latitude,
  longitude
}) => {
  // Caerphilly County Borough coordinates
  const caerphillyLat = 51.65;
  const caerphillyLng = -3.22;
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${caerphillyLat},${caerphillyLng}&zoom=11&maptype=roadmap`}
      />
    </div>
  );
};
