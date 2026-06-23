"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsLiteral, LatLngExpression, LatLngTuple } from "leaflet";
import { MapPin, Navigation, Truck } from "lucide-react";

type GpsEvent = {
  latitude: number;
  longitude: number;
};

type LiveTrackingMapProps = {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  currentLat?: number | null;
  currentLng?: number | null;
  heading?: number;
  originLabel?: string;
  destinationLabel?: string;
  driverName?: string;
  vehiclePlate?: string;
  events?: GpsEvent[];
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
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

function FitBounds({ points }: { points: LatLngBoundsLiteral }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [36, 36], maxZoom: 9 });
  }, [map, points]);

  return null;
}

function Recenter({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.75 });
  }, [center, map]);

  return null;
}

export default function LiveTrackingMap({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  currentLat,
  currentLng,
  heading = 0,
  originLabel = "Depart",
  destinationLabel = "Arrivee",
  driverName = "Chauffeur",
  vehiclePlate = "",
  events = [],
}: LiveTrackingMapProps) {
  const current = useMemo<LatLngTuple>(() => [currentLat ?? originLat, currentLng ?? originLng], [currentLat, currentLng, originLat, originLng]);
  const origin = useMemo<LatLngTuple>(() => [originLat, originLng], [originLat, originLng]);
  const destination = useMemo<LatLngTuple>(() => [destinationLat, destinationLng], [destinationLat, destinationLng]);
  const [mapType, setMapType] = useState<'street' | 'satellite' | 'hybrid'>('street');

  const travelledPath = useMemo<LatLngTuple[]>(() => {
    const points = events.map((event) => [event.latitude, event.longitude] as LatLngTuple);
    return [origin, ...points, current];
  }, [current, events, origin]);

  const plannedPath = useMemo<LatLngTuple[]>(() => [current, destination], [current, destination]);
  const bounds = useMemo<LatLngBoundsLiteral>(() => [origin, current, destination], [current, destination, origin]);

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
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-navy-900">
      <div className="absolute top-4 left-4 z-20 flex space-x-2 rounded-lg bg-white/90 backdrop-blur p-1 shadow-lg dark:bg-navy-900/80">
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
      <MapContainer
        center={current}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full min-h-[400px] w-full"
      >
        {getTileLayer(mapType)}
        <FitBounds points={bounds} />
        <Recenter center={current} />

        <Polyline
          positions={plannedPath}
          pathOptions={{ color: "#2563eb", dashArray: "8 10", weight: 4, opacity: 0.65 }}
        />
        <Polyline positions={travelledPath} pathOptions={{ color: "#16a34a", weight: 5, opacity: 0.9 }} />

        <CircleMarker
          center={origin}
          radius={9}
          pathOptions={{ color: "#ffffff", fillColor: "#16a34a", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -8]}>{originLabel}</Tooltip>
          <Popup>
            <strong>{originLabel}</strong>
            <br />
            Point de depart
          </Popup>
        </CircleMarker>

        <CircleMarker
          center={destination}
          radius={9}
          pathOptions={{ color: "#ffffff", fillColor: "#f97316", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -8]}>{destinationLabel}</Tooltip>
          <Popup>
            <strong>{destinationLabel}</strong>
            <br />
            Destination
          </Popup>
        </CircleMarker>

        <CircleMarker
          center={current}
          radius={13}
          pathOptions={{ color: "#ffffff", fillColor: "#2563eb", fillOpacity: 0.95, weight: 4 }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            {driverName}
            {vehiclePlate ? ` - ${vehiclePlate}` : ""}
          </Tooltip>
          <Popup>
            <strong>{driverName}</strong>
            {vehiclePlate && (
              <>
                <br />
                {vehiclePlate}
              </>
            )}
            <br />
            Position live
          </Popup>
        </CircleMarker>
      </MapContainer>

      <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-navy-900/90">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{driverName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cap {Math.round(heading)} deg{vehiclePlate ? ` | ${vehiclePlate}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[500] grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy-900/90">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
            <MapPin className="h-3.5 w-3.5" />
            Depart
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">{originLabel}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy-900/90">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <Navigation className="h-3.5 w-3.5" />
            Position
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {current[0].toFixed(4)}, {current[1].toFixed(4)}
          </p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy-900/90">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
            <MapPin className="h-3.5 w-3.5" />
            Arrivee
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">{destinationLabel}</p>
        </div>
      </div>
    </div>
  );
}
