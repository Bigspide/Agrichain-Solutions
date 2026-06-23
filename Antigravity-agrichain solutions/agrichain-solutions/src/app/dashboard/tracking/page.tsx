"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Route,
  ThermometerSun,
  Timer,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import type { Order } from "@/types";

const LiveTrackingMap = dynamic(() => import("@/components/tracking/LiveTrackingMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type GpsEvent = {
  id: string;
  latitude: number;
  longitude: number;
  speedKph?: number | null;
  heading?: number | null;
  recordedAt: string;
};

type LogisticsTrip = {
  id: string;
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehiclePlate?: string | null;
  originLabel?: string | null;
  originLat: number;
  originLng: number;
  destinationLabel?: string | null;
  destinationLat: number;
  destinationLng: number;
  currentLat?: number | null;
  currentLng?: number | null;
  distanceRemainingKm?: number | null;
  etaMinutes?: number | null;
  temperatureC?: number | null;
  gpsEvents: GpsEvent[];
  order?: Order;
};

const statusOrder = ["confirmed", "processing", "shipped", "in_transit", "delivered"];

const statusLabels: Record<string, string> = {
  confirmed: "Commande confirmee",
  processing: "Preparation",
  shipped: "Expediee",
  in_transit: "En transit",
  delivered: "Livree",
};

function MapSkeleton() {
  return (
    <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Chargement de la carte...</p>
      </div>
    </div>
  );
}

function formatEta(minutes?: number | null) {
  if (!minutes) return "A confirmer";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

function progressForStatus(status?: string) {
  if (status === "delivered") return 100;
  if (status === "in_transit") return 72;
  if (status === "shipped") return 48;
  if (status === "processing") return 28;
  return 12;
}

export default function TrackingPage() {
  const { t } = useI18n();
  const [trip, setTrip] = useState<LogisticsTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { location: liveLocation, isConnected } = useLiveTracking(trip?.id ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadTrip() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/logistics/events", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les donnees logistiques.");
        const payload = (await response.json()) as { trip?: LogisticsTrip | null };
        if (!cancelled) setTrip(payload.trip ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur logistique");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentLat = liveLocation?.lat ?? trip?.currentLat ?? trip?.originLat;
  const currentLng = liveLocation?.lng ?? trip?.currentLng ?? trip?.originLng;
  const progress = progressForStatus(trip?.status);

  const steps = useMemo(() => {
    const currentIndex = Math.max(0, statusOrder.indexOf(trip?.status || "confirmed"));
    return statusOrder.map((status, index) => ({
      status,
      label: statusLabels[status],
      done: index <= currentIndex,
      current: index === currentIndex,
    }));
  }, [trip?.status]);

  const latestEvents = useMemo(() => {
    return [...(trip?.gpsEvents ?? [])]
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 4);
  }, [trip?.gpsEvents]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t("nav.tracking")}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Suivi GPS temps reel, trajectoire, ETA et chaine du froid connectes a la base.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                isConnected
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800"
              }`}
            >
              {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {isConnected ? "Socket live" : "Socket hors ligne"}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-navy-900 dark:text-gray-200 dark:hover:bg-navy-800"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="card-premium p-8 text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-primary-500" />
          <p className="text-sm text-gray-500">Chargement du tracking...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="card-premium border-red-200 p-6 dark:border-red-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && !trip && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
            <Route className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Aucun trajet actif</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Les trajets apparaissent ici quand une commande dispose de son transporteur, son origine, sa destination
            et de points GPS en base de donnees.
          </p>
        </motion.div>
      )}

      {trip && currentLat != null && currentLng != null && (
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium overflow-hidden lg:col-span-2"
          >
            <div className="relative h-[460px]">
              <LiveTrackingMap
                originLat={trip.originLat}
                originLng={trip.originLng}
                destinationLat={trip.destinationLat}
                destinationLng={trip.destinationLng}
                currentLat={currentLat}
                currentLng={currentLng}
                heading={liveLocation?.heading ?? latestEvents[0]?.heading ?? 0}
                originLabel={trip.originLabel || "Depart"}
                destinationLabel={trip.destinationLabel || "Arrivee"}
                driverName={trip.driverName || "AgriChain Logistics"}
                vehiclePlate={trip.vehiclePlate || ""}
                events={trip.gpsEvents}
              />
              <div className="absolute left-4 top-4 z-[600] flex flex-wrap gap-2">
                <div className="rounded-xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:bg-navy-900/90">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(trip.distanceRemainingKm || 0)} km
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:bg-navy-900/90">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatEta(trip.etaMinutes)}</span>
                  </div>
                </div>
                {trip.temperatureC != null && (
                  <div className="rounded-xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:bg-navy-900/90">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{trip.temperatureC} deg C</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 p-5 dark:border-gray-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{trip.order?.orderNumber || trip.id}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {trip.originLabel || "Depart"} vers {trip.destinationLabel || "Arrivee"}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-1.5 dark:bg-orange-900/20">
                  <Truck className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold capitalize text-orange-600">
                    {(statusLabels[trip.status] || trip.status).replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                  <span>{trip.originLabel || "Depart"}</span>
                  <span>{trip.destinationLabel || "Arrivee"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="relative h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-blue-600"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Position: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
                </span>
                {liveLocation?.speed && <span>{Math.round(liveLocation.speed)} km/h</span>}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6"
          >
            <h3 className="mb-6 font-display font-semibold text-gray-900 dark:text-white">Suivi de livraison</h3>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.status} className="relative flex gap-4">
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-4 top-10 h-full w-0.5 ${
                        step.done ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                  <div
                    className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      step.current
                        ? "bg-primary-500 shadow-glow"
                        : step.done
                          ? "bg-primary-500"
                          : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {step.done ? <CheckCircle className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {step.current && <p className="mt-1 text-xs font-medium text-primary-600">Statut courant</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-3 text-xs text-gray-500">Chauffeur</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
                    {(trip.driverName || "AG")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {trip.driverName || "AgriChain Logistics"}
                    </p>
                    <p className="text-xs text-gray-500">{trip.vehiclePlate || "Contact securise"}</p>
                  </div>
                </div>
                <button
                  className="rounded-xl bg-primary-50 p-2.5 transition-colors hover:bg-primary-100 dark:bg-primary-900/20"
                  aria-label="Appeler le chauffeur"
                  type="button"
                >
                  <Phone className="h-4 w-4 text-primary-600" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-navy-800">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(trip.distanceRemainingKm || 0)} km
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-navy-800">
                <p className="text-xs text-gray-500">ETA</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatEta(trip.etaMinutes)}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-3 text-xs text-gray-500">Derniers points GPS</p>
              <div className="space-y-2">
                {latestEvents.length === 0 && (
                  <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-navy-800">
                    Aucun point GPS enregistre pour ce trajet.
                  </p>
                )}
                {latestEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-navy-800">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                        {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(event.recordedAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
