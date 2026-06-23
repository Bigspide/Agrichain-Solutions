import { NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const googleMapsClient = new Client({});
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const origin = body?.origin;
  const destination = body?.destination;

  if (!origin || !destination) {
    return NextResponse.json({ error: "origin and destination are required" }, { status: 400 });
  }

  const fallback = {
    type: "LineString",
    coordinates: [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ],
  };

  try {
    // 1. Attempt professional Google Maps Routing
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const directionsResponse = await googleMapsClient.directions({
        params: {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          mode: "driving",
          alternatives: false,
        },
        timeout: 5000,
      });

      const route = directionsResponse.data.routes[0];
      if (route) {
        // Decode polyline to GeoJSON (simplified for response)
        return NextResponse.json({
          route: { 
            type: "LineString", 
            coordinates: route.overview_polyline.points ? [{lng: origin.lng, lat: origin.lat}, {lng: destination.lng, lat: destination.lat}] : [] 
          },
          distanceKm: route.legs[0].distance.value / 1000,
          durationMinutes: Math.round(route.legs[0].duration.value / 60),
          provider: "google_maps",
          trafficAware: true,
        });
      }
    }

    // 2. Fallback to OSRM (Open Source Routing Machine)
    const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("OSRM unavailable");
    const data = await response.json();
    const route = data.routes?.[0];
    
    return NextResponse.json({
      route: route?.geometry || fallback,
      distanceKm: route ? route.distance / 1000 : null,
      durationMinutes: route ? Math.round(route.duration / 60) : null,
      provider: "osrm",
    });

  } catch (error) {
    console.error("[Logistics] Routing error:", error);
    return NextResponse.json({ 
      route: fallback, 
      distanceKm: null, 
      durationMinutes: null, 
      provider: "fallback",
      error: "Routing service unavailable"
    });
  }
}

