"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthState {
  loading: boolean;
  userId: string | null;
  profile: Profile | null;
}

/**
 * Loads the signed-in user's id and their `profiles` row, and keeps both
 * in sync as the Supabase auth state changes (sign in / sign out).
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    userId: null,
    profile: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (mounted) {
        setState({ loading: false, userId, profile: data as Profile | null });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else if (mounted) {
        setState({ loading: false, userId: null, profile: null });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setState({ loading: false, userId: null, profile: null });
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
