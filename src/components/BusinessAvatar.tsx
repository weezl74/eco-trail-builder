import React from 'react';

interface BusinessAvatarProps {
  business: {
    waste_footprint: number;
    travel_footprint: number;
    energy_footprint: number;
  };
  size?: number;
}

export const BusinessAvatar: React.FC<BusinessAvatarProps> = ({ 
  business, 
  size = 60 
}) => {
  // Create 6 equal segments with tab colors
  const segmentAngle = 360 / 6;
  
  const radius = (size - 8) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Helper function to create arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  // Tab colors matching BottomNavigation (HSL from index.css)
  const tabColors = [
    'hsl(204, 52%, 53%)', // wfg-blue (calculator)
    'hsl(273, 59%, 35%)', // wfg-purple (dashboard)
    'hsl(57, 82%, 36%)',  // wfg-green (leaderboard)
    'hsl(351, 75%, 29%)', // wfg-red (sprints)
    'hsl(51, 100%, 51%)', // wfg-yellow (community)
    'hsl(31, 95%, 54%)',  // wfg-orange (knowledge)
  ];

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Create 6 equal segments with tab colors */}
        {tabColors.map((color, index) => (
          <path
            key={index}
            d={createArcPath(index * segmentAngle, (index + 1) * segmentAngle, radius)}
            fill={color}
            className="opacity-90"
          />
        ))}
        
        {/* Inner circle for cleaner look */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.35}
          fill="#18181b"
          className="opacity-95"
        />
      </svg>
      
      {/* Optional footprint indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {(business.waste_footprint + business.travel_footprint + business.energy_footprint) > 0 
            ? Math.round(business.waste_footprint + business.travel_footprint + business.energy_footprint) 
            : '0'}
        </span>
      </div>
    </div>
  );
};