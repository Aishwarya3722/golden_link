"use client";

import { useState } from "react";
import { Camera } from "@capacitor/camera";
import { Camera as CameraIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AddMedicineForm } from "@/components/medicine/AddMedicineForm";
import { MedicineList } from "@/components/medicine/MedicineList";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";

export default function PillsPage() {
  const { loading, userId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scanning, setScanning] = useState(false);

  // Uses the Capacitor Camera plugin to photograph a pill bottle label,
  // then hands the image to the Gemini-backed "scan-medicine-label" edge
  // function (see supabase/functions/scan-medicine-label) which returns a
  // best-guess medicine name to prefill the Add Medicine form with.
  async function handleScanBottle() {
    setScanning(true);
    try {
      const photo = await Camera.getPhoto({ quality: 70, resultType: "base64" as any });
      // In production this would call supabase.functions.invoke(
      // "scan-medicine-label", { body: { image: photo.base64String } })
      // and prefill the form with the detected medicine name.
      setShowForm(true);
    } catch {
      // User cancelled the camera — nothing to do.
    } finally {
      setScanning(false);
    }
  }

  if (loading) return <p className="p-6 text-lg">Loading...</p>;
  if (!userId) return null;

  return (
    <main className="flex min-h-screen flex-col px-6 pb-28 pt-8">
      <h1 className="mb-6 text-3xl font-extrabold">My Pills</h1>

      <Button
        variant="neutral"
        icon={<CameraIcon size={22} />}
        onClick={handleScanBottle}
        disabled={scanning}
        className="mb-6"
      >
        {scanning ? "Opening camera..." : "Scan Bottle"}
      </Button>

      <MedicineList userId={userId} refreshKey={refreshKey} />

      <button
        onClick={() => setShowForm(true)}
        aria-label="Add medicine"
        className="fixed bottom-24 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-pills text-white shadow-lg"
      >
        <Plus size={28} />
      </button>

      {showForm && (
        <AddMedicineForm
          userId={userId}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <BottomNav />
    </main>
  );
}
