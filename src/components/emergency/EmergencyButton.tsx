"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmCallModal } from "./ConfirmCallModal";

interface EmergencyButtonProps {
  userId: string;
  emergencyNumber?: string;
}

// One-tap emergency call. Tapping opens a confirmation modal first so an
// accidental pocket-tap never places a real call — see report a.1.
export function EmergencyButton({ userId, emergencyNumber = "102" }: EmergencyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="emergency"
        icon={<Phone size={24} />}
        onClick={() => setOpen(true)}
        className="justify-between text-2xl"
      >
        <span className="flex-1 text-left">Emergency ({emergencyNumber})</span>
      </Button>

      {open && (
        <ConfirmCallModal
          userId={userId}
          emergencyNumber={emergencyNumber}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
