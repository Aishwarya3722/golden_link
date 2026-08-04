"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EmergencyContact } from "@/lib/types";

export function useEmergencyContacts(userId: string | null) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setContacts((data as EmergencyContact[]) ?? []);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contacts, loading, refresh };
}
