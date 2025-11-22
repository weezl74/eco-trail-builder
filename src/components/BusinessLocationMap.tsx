import React from 'react';

interface BusinessLocationMapProps {
  businessName: string;
  latitude: number;
  longitude: number;
}

// Approximate positions for key locations within Caerphilly County Borough
const businessLocations = [
  { name: 'Caerphilly Town Centre', x: 48, y: 52 },
  { name: 'Caerphilly Castle Area', x: 50, y: 50 },
  { name: 'Van Road Business', x: 53, y: 48 },
  { name: 'Bedwas', x: 56, y: 55 },
  { name: 'Trethomas', x: 58, y: 57 },
];

export const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  businessName,
  latitude,
  longitude
}) => {
  // Caerphilly County Borough coordinates
  const caerphillyLat = 51.65;
  const caerphillyLng = -3.22;
  
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed?pb=!1m12!1m3!1d79613.57439346557!2d-3.30!3d51.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`}
        title={businessName}
      />

      {/* Overlay pins to indicate key locations */}
      <div className="absolute inset-0 pointer-events-none">
        {businessLocations.map((location) => (
          <div
            key={location.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-soft border border-card"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
          />
        ))}
      </div>
    </div>
  );
};
