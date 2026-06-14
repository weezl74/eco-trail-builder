import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type LeafletPoi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  blurb: string;
  pledged: boolean;
  ctaLabel: string;
  onAction: () => void;
  walletLabel?: string;
  onAddToWallet?: () => void;
};

interface Props {
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number };
  pois: LeafletPoi[];
  className?: string;
  onMapClick?: (lat: number, lng: number, x: number, y: number) => void;
  interactive?: boolean;
}

const ShopLocalLeafletMap: React.FC<Props> = ({ bbox, pois, className, onMapClick, interactive = true }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    });
    map.fitBounds([
      [bbox.minLat, bbox.minLng],
      [bbox.maxLat, bbox.maxLng],
    ]);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle interactivity
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const handlers = [m.dragging, m.scrollWheelZoom, m.doubleClickZoom, m.touchZoom, m.boxZoom, m.keyboard];
    handlers.forEach((h) => (interactive ? h.enable() : h.disable()));
  }, [interactive]);

  // Map click handler
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !onMapClick) return;
    const cb = (e: L.LeafletMouseEvent) => {
      const size = m.getSize();
      const pt = m.latLngToContainerPoint(e.latlng);
      const x = (pt.x / size.x) * 100;
      const y = (pt.y / size.y) * 100;
      onMapClick(e.latlng.lat, e.latlng.lng, x, y);
    };
    m.on('click', cb);
    return () => {
      m.off('click', cb);
    };
  }, [onMapClick]);

  // Render markers
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    pois.forEach((p) => {
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="transform:translate(-50%,-100%);">
            <svg width="24" height="32" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 0C5 0 0 5 0 11c0 8 11 19 11 19s11-11 11-19C22 5 17 0 11 0z" fill="${p.color}" stroke="white" stroke-width="1.5"/>
              ${
                p.pledged
                  ? `<g transform="translate(6,6)"><circle cx="5" cy="5" r="5" fill="white"/><path d="M2.5 5.2 L4.3 7 L7.7 3.6" stroke="${p.color}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
                  : `<circle cx="11" cy="11" r="4" fill="white"/>`
              }
            </svg>
          </div>`,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
      });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer);
      const walletBtn = p.onAddToWallet
        ? `<button data-action="poi-wallet" style="background:white; color:#1f1f1f; border:1px solid #1f1f1f; border-radius:8px; padding:6px 10px; font-weight:700; font-family:inherit; cursor:pointer; width:100%; margin-top:6px;">${p.walletLabel ?? 'Add to wallet'}</button>`
        : '';
      const popupHtml = `
        <div style="font-family: Georgia, serif; min-width: 180px;">
          <div style="font-weight:700; margin-bottom:4px;">${p.name}</div>
          <div style="font-size:12px; color:#374151; margin-bottom:8px;">${p.blurb}</div>
          <button data-action="poi-cta" style="background:${p.color}; color:white; border:none; border-radius:8px; padding:6px 10px; font-weight:700; font-family:inherit; cursor:pointer; width:100%;">
            ${p.ctaLabel}
          </button>
          ${walletBtn}
        </div>`;
      marker.bindPopup(popupHtml);
      marker.on('popupopen', (e) => {
        const node = (e as L.PopupEvent).popup.getElement();
        const btn = node?.querySelector('[data-action="poi-cta"]') as HTMLButtonElement | null;
        if (btn) {
          btn.onclick = (ev) => {
            ev.stopPropagation();
            p.onAction();
            marker.closePopup();
          };
        }
        const wbtn = node?.querySelector('[data-action="poi-wallet"]') as HTMLButtonElement | null;
        if (wbtn && p.onAddToWallet) {
          wbtn.onclick = (ev) => {
            ev.stopPropagation();
            p.onAddToWallet?.();
            marker.closePopup();
          };
        }
      });
    });
  }, [pois]);

  return <div ref={containerRef} className={className} />;
};

export default ShopLocalLeafletMap;
