"use client";

import { useAuth } from "@/hooks/useAuth";
import { ServicesList } from "@/components/services/ServicesList";
import { BottomNav } from "@/components/ui/BottomNav";

export default function ServicesPage() {
  const { loading, userId } = useAuth();

  if (loading) return <p className="p-6 text-lg">Loading...</p>;
  if (!userId) return null;

  return (
    <main className="flex min-h-screen flex-col px-6 pb-28 pt-8">
      <h1 className="mb-6 text-3xl font-extrabold">Services</h1>
      <ServicesList userId={userId} />
      <BottomNav />
    </main>
  );
}
