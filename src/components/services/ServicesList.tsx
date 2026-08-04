"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ServiceCard } from "./ServiceCard";
import { SearchBar } from "./SearchBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import type { ServiceListing, Booking } from "@/lib/types";

interface ServicesListProps {
  userId: string;
}

const CATEGORIES = ["Cleaning", "Fixing", "Hangout"] as const;

// Combines the category tabs, search, and "MY BOOKINGS" panel seen across
// Fig. 8. Supabase does the filtering server-side (report a.3) so results
// come back fast even as the provider list grows.
export function ServicesList({ userId }: ServicesListProps) {
  const [category, setCategory] = useState<string>("Cleaning");
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [bookings, setBookings] = useState<(Booking & { services: ServiceListing })[]>([]);
  const [pendingBooking, setPendingBooking] = useState<ServiceListing | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let request = supabase.from("services").select("*").eq("category", category);
    if (query.trim()) {
      request = request.ilike("name", `%${query.trim()}%`);
    }
    request.order("rating_avg", { ascending: false }).then(({ data }) => {
      setServices((data as ServiceListing[]) ?? []);
    });
  }, [category, query]);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*, services(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBookings((data as any) ?? []);
      });
  }, [userId]);

  async function confirmBooking(scheduledAt: string | null) {
    if (!pendingBooking) return;
    const { data } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        service_id: pendingBooking.id,
        status: scheduledAt ? "confirmed" : "requested",
        scheduled_at: scheduledAt,
      })
      .select("*, services(*)")
      .single();

    if (data) setBookings((prev) => [data as any, ...prev]);
    setPendingBooking(null);
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`min-h-touch flex-1 rounded-xl font-semibold ${
              category === c ? "bg-services text-white" : "bg-gray-100 text-ink-900"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder={`Search ${category.toLowerCase()} providers`} />

      <div className="mb-6 flex flex-col gap-3">
        {services.length === 0 ? (
          <p className="text-ink-700">No providers found in this category yet.</p>
        ) : (
          services.map((s) => <ServiceCard key={s.id} service={s} onBook={setPendingBooking} />)
        )}
      </div>

      {bookings.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-bold">My Bookings</h3>
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <p className="font-bold">{b.services?.name}</p>
                <p className="text-sm text-ink-700">{b.services?.category}</p>
                {b.scheduled_at && <p className="text-sm text-ink-700">{formatDateTime(b.scheduled_at)}</p>}
                <p className="mt-1 text-sm font-semibold capitalize text-services">{b.status}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-ink-900 p-6 text-white sm:rounded-2xl">
            <h3 className="mb-4 text-2xl font-bold">Did you book?</h3>
            <p className="mb-4">Did you schedule a visit with {pendingBooking.name}?</p>
            <div className="flex flex-col gap-3">
              <Button variant="neutral" className="bg-white/10" onClick={() => confirmBooking(null)}>
                No, I didn't
              </Button>
              <BookingDatePicker onSave={confirmBooking} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingDatePicker({ onSave }: { onSave: (scheduledAt: string) => void }) {
  const [date, setDate] = useState("");

  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="mb-2 text-sm">Yes, they are coming on:</p>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="min-h-touch mb-3 w-full rounded-lg px-3 text-ink-900"
      />
      <Button variant="services" disabled={!date} onClick={() => onSave(new Date(date).toISOString())}>
        Save Date
      </Button>
    </div>
  );
}
