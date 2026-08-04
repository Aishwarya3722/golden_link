"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Medicine } from "@/lib/types";

interface ReminderSchedulerProps {
  userId: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Renders nothing visible. Every minute it checks the signed-in senior's
 * active medicines against the current day/time and fires a simple
 * visual + notification alert when a dose is due — the "automated push
 * notifications and simple visual alerts" described in the report's
 * introduction. On native builds this pairs with a local-notifications
 * Capacitor plugin; in the browser it falls back to the Notifications API.
 */
export function ReminderScheduler({ userId }: ReminderSchedulerProps) {
  const firedThisMinute = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const supabase = createClient();
    const interval = setInterval(async () => {
      const now = new Date();
      const today = DAY_LABELS[now.getDay()];
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const slotKey = `${hhmm}`;

      if (firedThisMinute.current.has(slotKey)) return;

      const { data } = await supabase
        .from("medicines")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true);

      (data as Medicine[] | null)?.forEach((med) => {
        const medTime = med.reminder_time.slice(0, 5);
        if (medTime === hhmm && med.days.includes(today)) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Time for your medicine", {
              body: `${med.name} — ${med.dosage}`,
            });
          }
        }
      });

      firedThisMinute.current.add(slotKey);
      // Keep the memoized set small — one entry per minute is enough.
      if (firedThisMinute.current.size > 5) firedThisMinute.current.clear();
    }, 30_000);

    return () => clearInterval(interval);
  }, [userId]);

  return null;
}
