"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface AddMedicineFormProps {
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mirrors the "SET ALARM" screen in the report (Fig. 7): pick the days,
// pick a time, save. TypeScript + a check constraint on the DB side both
// validate the input before it ever reaches PostgreSQL (report a.2 / c.3).
export function AddMedicineForm({ userId, onClose, onSaved }: AddMedicineFormProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 tablet");
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: string) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a medicine name.");
      return;
    }
    if (days.length === 0) {
      setError("Please pick at least one day.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("medicines").insert({
      user_id: userId,
      name: name.trim(),
      dosage,
      days,
      reminder_time: `${time}:00`,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Set Alarm</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Medicine name (e.g. Paracetamol)"
          className="min-h-touch mb-4 w-full rounded-xl border-2 border-gray-200 px-4 text-lg font-semibold uppercase focus:border-pills focus:outline-none"
        />

        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Dosage (e.g. 1 tablet)"
          className="min-h-touch mb-4 w-full rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-pills focus:outline-none"
        />

        <p className="mb-2 font-semibold text-ink-700">Which days?</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`min-h-touch rounded-xl px-4 font-semibold ${
                days.includes(day) ? "bg-pills text-white" : "bg-gray-100 text-ink-900"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <p className="mb-2 font-semibold text-ink-700">What time?</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="min-h-touch mb-6 w-full rounded-xl border-2 border-gray-200 px-4 text-2xl font-bold focus:border-pills focus:outline-none"
        />

        {error && <p className="mb-4 text-emergency">{error}</p>}

        <Button type="submit" variant="pills" disabled={saving}>
          {saving ? "Saving..." : "Save Alarm"}
        </Button>
      </form>
    </div>
  );
}
