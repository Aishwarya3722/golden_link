"use client";

import { createBrowserClient } from "@supabase/ssr";

// A single browser Supabase client, safe to import in any client component.
// Reads the two public env vars — never put the service role key here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
