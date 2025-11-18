import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Replace with your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1azJyYncwOGszMmxzYzY2NHB0bzJyIn0.JWU8n8UOPmLirRkP0pWeRA';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for the main business
    new mapboxgl.Marker({ color: '#f97316' })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${businessName}</strong>`))
      .addTo(map.current);

    // Add markers for other businesses in the community
    businessLocations.forEach(location => {
      new mapboxgl.Marker({ color: '#8b5cf6', scale: 0.8 })
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.name}</strong>`))
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [businessName, latitude, longitude]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
