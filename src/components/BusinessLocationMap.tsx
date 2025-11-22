import React from 'react';

interface BusinessLocationMapProps {
  businessName: string;
  latitude: number;
  longitude: number;
}

// Business locations in Caerphilly for markers
const businessLocations = [
  { name: 'Caerphilly Town Centre', lat: 51.5775, lng: -3.2186 },
  { name: 'Caerphilly Castle Area', lat: 51.5778, lng: -3.2178 },
  { name: 'Van Road Business', lat: 51.5830, lng: -3.2280 },
  { name: 'Bedwas', lat: 51.5889, lng: -3.2089 },
  { name: 'Trethomas', lat: 51.5925, lng: -3.2089 },
];

export const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  businessName,
  latitude,
  longitude
}) => {
  // Caerphilly County Borough coordinates
  const caerphillyLat = 51.65;
  const caerphillyLng = -3.22;
  
  // Build markers string for Google Maps
  const markers = businessLocations
    .map(loc => `markers=color:purple%7Csize:small%7C${loc.lat},${loc.lng}`)
    .join('&');
  
  // Add main business marker
  const mainMarker = `markers=color:orange%7Clabel:B%7C${latitude},${longitude}`;
  
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
