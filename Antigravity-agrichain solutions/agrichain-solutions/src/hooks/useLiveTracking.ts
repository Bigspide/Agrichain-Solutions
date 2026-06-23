"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export type LiveLocation = {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
};

export function useLiveTracking(deliveryId: string | null) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!deliveryId) return;

    const socket = connectSocket();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.emit("join_delivery", deliveryId);

    socket.on("location_updated", (data: LiveLocation) => {
      setLocation(data);
    });

    return () => {
      socket.off("location_updated");
      socket.off("connect");
      socket.off("disconnect");
      disconnectSocket();
    };
  }, [deliveryId]);

  return { location, isConnected };
}
