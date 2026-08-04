"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import type { Medicine } from "@/lib/types";

interface MedicineListProps {
  userId: string;
  refreshKey: number;
}

// Mirrors the "MY PILLS" screen (Fig. 7): daily alarms with a one-tap
// "Take Now" action that writes to medicine_history and re-renders
// instantly, matching the adherence tracking described in report c.3.
export function MedicineList({ userId, refreshKey }: MedicineListProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [justTaken, setJustTaken] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  useEffect(() => {
    setLoading(true);
    supabase
      .from("medicines")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .order("reminder_time", { ascending: true })
      .then(({ data }) => {
        setMedicines((data as Medicine[]) ?? []);
        setLoading(false);
      });
  }, [userId, refreshKey]);

  async function handleTakeNow(medicineId: string) {
    await supabase.from("medicine_history").insert({ medicine_id: medicineId, status: "taken" });
    setJustTaken((prev) => ({ ...prev, [medicineId]: true }));
  }

  async function handleDelete(medicineId: string) {
    await supabase.from("medicines").update({ active: false }).eq("id", medicineId);
    setMedicines((prev) => prev.filter((m) => m.id !== medicineId));
  }

  if (loading) return <p className="text-ink-700">Loading pills...</p>;
  if (medicines.length === 0) return <p className="text-ink-700">No medicines added yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-ink-700">Daily Alarms</p>
      {medicines.map((med) => (
        <Card key={med.id} className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold uppercase">{med.name}</p>
            <p className="text-sm text-ink-700">{formatTime(med.reminder_time)} · {med.dosage}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="pills"
              fullWidth={false}
              className="min-h-touch px-4 text-base"
              onClick={() => handleTakeNow(med.id)}
              disabled={justTaken[med.id]}
            >
              {justTaken[med.id] ? "Taken ✓" : "Take Now"}
            </Button>
            <button aria-label="Delete medicine" onClick={() => handleDelete(med.id)}>
              <Trash2 className="text-gray-400 hover:text-emergency" size={22} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
