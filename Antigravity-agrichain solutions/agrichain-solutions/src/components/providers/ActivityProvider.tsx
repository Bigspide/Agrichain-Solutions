"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface ActivityContextType {
  trackActivity: (action: string, entity?: string, entityId?: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const trackActivity = async (action: string, entity?: string, entityId?: string) => {
    if (!session?.user?.id) return;

    try {
      await fetch("/api/activity/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          action,
          entity,
          entityId,
        }),
      });
    } catch (error) {
      console.error("Activity tracking failed:", error);
    }
  };

  // Automatic session time tracking (heartbeat)
  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (!session?.user?.id) return;

      const now = Date.now();
      const duration = Math.floor((now - lastActivityRef.current) / 1000);
      lastActivityRef.current = now;

      try {
        await fetch("/api/activity/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            action: "HEARTBEAT",
            duration: duration > 0 ? duration : 30, // cap at 30s for the interval
          }),
        });
      } catch (error) {
        console.error("Heartbeat tracking failed:", error);
      }
    }, 30000); // every 30 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  // Track page changes
  useEffect(() => {
    trackActivity("PAGE_VIEW", "Route", pathname);
  }, [pathname]);

  return (
    <ActivityContext.Provider value={{ trackActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
