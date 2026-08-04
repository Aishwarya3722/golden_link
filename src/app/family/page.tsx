"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { EmergencyHistory } from "@/components/emergency/EmergencyHistory";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FamilyLink, Profile } from "@/lib/types";

// A family member enters the 6-digit code their senior generated (Fig. 4)
// to link accounts, then sees a read-only view of that senior's emergency
// history and medicine schedule — enforced server-side by the
// is_linked_family() Row Level Security policy in supabase/schema.sql.
export default function FamilyPage() {
  const { loading, userId } = useAuth();
  const [code, setCode] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkedSeniors, setLinkedSeniors] = useState<Profile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("family_links")
      .select("*, senior:profiles!family_links_senior_id_fkey(*)")
      .eq("family_id", userId)
      .then(({ data }) => {
        setLinkedSeniors(((data as any) ?? []).map((row: any) => row.senior));
      });
  }, [userId]);

  async function handleLink(e: FormEvent) {
    e.preventDefault();
    setLinkError(null);

    const { data: match, error } = await supabase
      .from("family_links")
      .select("*")
      .eq("link_code", code.trim())
      .is("family_id", null)
      .maybeSingle();

    if (error || !match) {
      setLinkError("That code wasn't found. Ask the senior to generate a new one.");
      return;
    }

    const { data: updated } = await supabase
      .from("family_links")
      .update({ family_id: userId, linked_at: new Date().toISOString() })
      .eq("id", (match as FamilyLink).id)
      .select("*, senior:profiles!family_links_senior_id_fkey(*)")
      .single();

    if (updated) {
      setLinkedSeniors((prev) => [...prev, (updated as any).senior]);
      setCode("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <p className="p-6 text-lg">Loading...</p>;
  if (!userId) return <p className="p-6 text-lg">Please sign in.</p>;

  return (
    <main className="min-h-screen px-6 pb-10 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Family</h1>
        <button aria-label="Log out" onClick={handleLogout}>
          <LogOut size={24} />
        </button>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 text-lg font-bold">Link to a senior</h2>
        <form onSubmit={handleLink} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            className="min-h-touch flex-1 rounded-xl border-2 border-gray-200 px-4 text-xl tracking-widest focus:border-family focus:outline-none"
          />
          <Button variant="family" type="submit" fullWidth={false} className="px-6">
            Link
          </Button>
        </form>
        {linkError && <p className="mt-2 text-sm text-emergency">{linkError}</p>}
      </Card>

      {linkedSeniors.length === 0 ? (
        <p className="text-ink-700">No linked seniors yet.</p>
      ) : (
        linkedSeniors.map((senior) => (
          <section key={senior.id} className="mb-8">
            <h2 className="mb-3 text-xl font-bold">{senior.full_name}'s Emergency History</h2>
            <EmergencyHistory userId={senior.id} />
          </section>
        ))
      )}
    </main>
  );
}
