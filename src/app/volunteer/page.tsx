"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ServiceCategory, ServiceListing, Booking } from "@/lib/types";

const CATEGORIES: ServiceCategory[] = [
  "Cleaning",
  "Fixing",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "AC Repair",
  "Hangout",
  "Other",
];

// Matches the "OFFER HELP — Register as a provider" screen (Fig. 5): a
// volunteer submits their profile once, which creates a row in `services`
// that seniors can then discover, call, WhatsApp, and book from the
// Services module.
export default function VolunteerPage() {
  const { loading, userId } = useAuth();
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    category: CATEGORIES[0],
    availability: "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("services")
      .select("*")
      .eq("volunteer_id", userId)
      .maybeSingle()
      .then(({ data }) => setListing(data as ServiceListing | null));
  }, [userId]);

  useEffect(() => {
    if (!listing) return;
    supabase
      .from("bookings")
      .select("*")
      .eq("service_id", listing.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings((data as Booking[]) ?? []));
  }, [listing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const { data } = await supabase
      .from("services")
      .insert({
        volunteer_id: userId,
        name: form.name,
        category: form.category,
        whatsapp_number: form.whatsapp,
        availability: form.availability,
      })
      .select("*")
      .single();

    setSaving(false);
    if (data) setListing(data as ServiceListing);
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
        <h1 className="text-2xl font-extrabold">Offer Help</h1>
        <button aria-label="Log out" onClick={handleLogout}>
          <LogOut size={24} />
        </button>
      </div>

      {!listing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase text-ink-700">Register as a provider</p>

          <label className="text-sm font-semibold text-ink-700">
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="min-h-touch mt-1 w-full rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-services focus:outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-ink-700">
            WhatsApp number
            <input
              required
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              className="min-h-touch mt-1 w-full rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-services focus:outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-ink-700">
            Service type
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
              className="min-h-touch mt-1 w-full rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-services focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-ink-700">
            Availability
            <input
              placeholder="e.g. Weekends 10AM - 2PM"
              value={form.availability}
              onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
              className="min-h-touch mt-1 w-full rounded-xl border-2 border-gray-200 px-4 text-lg focus:border-services focus:outline-none"
            />
          </label>

          <Button variant="services" type="submit" disabled={saving}>
            {saving ? "Submitting..." : "Submit Profile"}
          </Button>
        </form>
      ) : (
        <>
          <Card className="mb-6">
            <p className="text-lg font-bold">{listing.name}</p>
            <p className="text-ink-700">{listing.category} · {listing.availability}</p>
          </Card>

          <h2 className="mb-3 text-lg font-bold">Booking requests</h2>
          {bookings.length === 0 ? (
            <p className="text-ink-700">No bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <Card key={b.id}>
                  <p className="font-semibold capitalize">{b.status}</p>
                  {b.scheduled_at && <p className="text-sm text-ink-700">{formatDateTime(b.scheduled_at)}</p>}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
