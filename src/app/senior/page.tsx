"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, LogOut, Pill, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { EmergencyButton } from "@/components/emergency/EmergencyButton";
import { ReminderScheduler } from "@/components/medicine/ReminderScheduler";
import { LinkCodeModal } from "@/components/auth/LinkCodeModal";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";

export default function SeniorHomePage() {
  const { loading, userId } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <p className="p-6 text-lg">Loading...</p>;
  if (!userId) return <SignedOutNotice />;

  return (
    <main className="flex min-h-screen flex-col px-6 pb-28 pt-8">
      <ReminderScheduler userId={userId} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Hello!</h1>
        <div className="flex gap-3">
          <button aria-label="Link family account" onClick={() => setShowLinkModal(true)}>
            <Link2 size={24} />
          </button>
          <button aria-label="Log out" onClick={handleLogout}>
            <LogOut size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <EmergencyButton userId={userId} />

        <Link href="/senior/pills">
          <Button variant="pills" icon={<Pill size={24} />} className="justify-start">
            Pills
          </Button>
        </Link>

        <Link href="/senior/services">
          <Button variant="services" icon={<Wrench size={24} />} className="justify-start">
            Services
          </Button>
        </Link>
      </div>

      {showLinkModal && <LinkCodeModal seniorId={userId} onClose={() => setShowLinkModal(false)} />}

      <BottomNav />
    </main>
  );
}

function SignedOutNotice() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg">You need to sign in to view this page.</p>
      <Link href="/" className="font-semibold text-pills underline">
        Go to sign in
      </Link>
    </main>
  );
}
