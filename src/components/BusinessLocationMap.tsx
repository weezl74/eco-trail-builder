import React from 'react';

interface BusinessLocationMapProps {
  businessName: string;
  latitude: number;
  longitude: number;
}

export const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  businessName,
  latitude,
  longitude,
}) => {
  // Embed a Google Map centered on the business with a single pin at its coords.
  // Using the `q=` parameter drops a real marker tied to the map (not the screen).
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=13&output=embed`;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <iframe
        title={businessName}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
};
