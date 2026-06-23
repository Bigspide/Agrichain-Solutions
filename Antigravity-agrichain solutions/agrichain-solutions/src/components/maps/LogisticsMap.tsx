"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type LogisticsMapProps = {
  origin: { lat: number; lng: number; label: string };
  current?: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  events?: { latitude: number; longitude: number }[];
};

const tileLayers = {
  street: {
    name: "Calles",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EPC, and the GIS User Community'
  },
  hybrid: {
    name: "Híbrido",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // Note: For a true hybrid, we'd need to overlay labels on satellite, but this is a simplified version
  }
};

function BoundsController({ points }: { points: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points as any, { padding: [28, 28], maxZoom: 9 });
  }, [map, points]);

  return null;
}

export default function LogisticsMap({ origin, current, destination, events = [] }: LogisticsMapProps) {
  const route = useMemo<LatLngExpression[]>(() => {
    const eventPoints = events.map((event) => [event.latitude, event.longitude] as LatLngExpression);
    return [
      [origin.lat, origin.lng] as LatLngExpression,
      ...eventPoints,
      ...(current ? [[current.lat, current.lng] as LatLngExpression] : []),
      [destination.lat, destination.lng] as LatLngExpression,
    ];
  }, [current, destination.lat, destination.lng, events, origin.lat, origin.lng]);

  const center = current ? [current.lat, current.lng] as LatLngExpression : [origin.lat, origin.lng] as LatLngExpression;
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'hybrid'>('street');

  const getTileLayer = (type: 'street' | 'satellite' | 'hybrid') => {
    const layer = tileLayers[type];
    return (
      <TileLayer
        key={type}
        url={layer.url}
        attribution={layer.attribution}
      />
    );
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={7} scrollWheelZoom={false} className="h-full w-full">
        {getTileLayer(mapType)}
        <BoundsController points={route} />
        <Polyline positions={route} pathOptions={{ color: "#16a34a", weight: 5, opacity: 0.8 }} />
        <CircleMarker center={[origin.lat, origin.lng]} radius={8} pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.95 }}>
          <Tooltip direction="top">{origin.label}</Tooltip>
        </CircleMarker>
        {current && (
          <CircleMarker center={[current.lat, current.lng]} radius={10} pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.95 }}>
            <Tooltip direction="top">{current.label}</Tooltip>
          </CircleMarker>
        )}
        <CircleMarker center={[destination.lat, destination.lng]} radius={8} pathOptions={{ color: "#f59e0b", fillColor: "#fbbf24", fillOpacity: 0.95 }}>
          <Tooltip direction="top">{destination.label}</Tooltip>
        </CircleMarker>
      </MapContainer>

      {/* Map type selector */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2 rounded-lg bg-white/90 backdrop-blur p-1 shadow-lg dark:bg-navy-900/80">
        {Object.keys(tileLayers).map((type) => (
          <button
            key={type}
            onClick={() => setMapType(type as 'street' | 'satellite' | 'hybrid')}
            className={`px-3 py-1 text-xs rounded transition-all duration-200 ${mapType === type
              ? "bg-primary-600 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:hover:bg-navy-800"
            }`}
          >
            {tileLayers[type as keyof typeof tileLayers].name}
          </button>
        ))}
      </div>
    </div>
  );
}
