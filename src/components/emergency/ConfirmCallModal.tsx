"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface ConfirmCallModalProps {
  userId: string;
  emergencyNumber: string;
  onClose: () => void;
}

// Matches Fig. 6 in the report: "Alert your family with your location?"
// Confirming (1) fetches GPS coordinates via the Capacitor Geolocation
// bridge, (2) writes a row to emergency_logs so family/volunteers see it
// in real time, (3) fires the send-sos-alert edge function (Resend email),
// and (4) places the actual phone call through the device dialer.
export function ConfirmCallModal({ userId, emergencyNumber, onClose }: ConfirmCallModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleConfirm() {
    setSending(true);
    const supabase = createClient();

    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const position = await Geolocation.getCurrentPosition();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch {
      // Location permission denied or unavailable on this device/browser —
      // the SOS still proceeds without coordinates rather than blocking.
    }

    await supabase.from("emergency_logs").insert({
      user_id: userId,
      status: "active",
      latitude,
      longitude,
    });

    // Best-effort: notify linked family members. Failure here must never
    // stop the call from being placed.
    try {
      await supabase.functions.invoke("send-sos-alert", {
        body: { userId, latitude, longitude },
      });
    } catch {
      // swallow — the call is the priority, not the notification
    }

    setSending(false);
    setSent(true);
    window.location.href = `tel:${emergencyNumber}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-ink-900 p-6 text-white">
        {!sent ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="text-emergency" size={24} />
              EMERGENCY SOS
              <AlertTriangle className="text-emergency" size={24} />
            </div>
            <p className="mb-6 text-lg">Alert your family with your location?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={sending} className="bg-transparent text-white border-white/30">
                Cancel
              </Button>
              <Button variant="emergency" onClick={handleConfirm} disabled={sending}>
                {sending ? "Sending..." : "OK"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-lg font-semibold text-green-400">✅ SOS sent!</p>
            <Button variant="neutral" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
