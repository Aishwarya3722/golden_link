"use client";

import { Github } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/lib/types";

interface LoginButtonsProps {
  role: UserRole;
}

// Golden Link uses OAuth-only sign-in (report, section "Detailed Design" /
// Conclusion) to remove password fatigue for elderly users. The chosen
// role is stashed in a short-lived cookie that the /auth/callback route
// reads once the OAuth round-trip completes, so a first-time sign-in
// lands the person in the right dashboard.
export function LoginButtons({ role }: LoginButtonsProps) {
  async function handleGithubLogin() {
    document.cookie = `golden_link_role=${role}; path=/; max-age=600`;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <Button variant="neutral" icon={<Github size={22} />} onClick={handleGithubLogin}>
      Login via GitHub
    </Button>
  );
}
