'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  sublabel?: string;
  /** Hex color for the marker — status/telemetry color, or an accent for opportunities. */
  color: string;
}

interface SiteMapProps {
  pins: MapPin[];
  height?: number;
  /** Defaults to the centroid of `pins`. */
  center?: LatLngExpression;
  zoom?: number;
}

/**
 * OpenStreetMap tiles via Leaflet — same tile source the Flutter driver app
 * uses (flutter_map + OSM), so web and mobile read as one product rather than
 * introducing a second mapping vendor.
 */
export function SiteMap({ pins, height = 360, center, zoom = 6 }: SiteMapProps) {
  const resolvedCenter = useMemo<LatLngExpression>(() => {
    if (center) return center;
    if (pins.length === 0) return [23.588, 58.3829];
    const lat = pins.reduce((sum, p) => sum + p.latitude, 0) / pins.length;
    const lng = pins.reduce((sum, p) => sum + p.longitude, 0) / pins.length;
    return [lat, lng];
  }, [center, pins]);

  return (
    <div style={{ height }} className="rounded-image overflow-hidden">
      <MapContainer
        center={resolvedCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {pins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.latitude, pin.longitude]}
            radius={8}
            pathOptions={{ color: pin.color, fillColor: pin.color, fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{pin.label}</p>
                {pin.sublabel ? <p className="text-xs text-gray-500">{pin.sublabel}</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
