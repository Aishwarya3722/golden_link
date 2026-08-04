"use client";

import { useState } from "react";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { LoginButtons } from "@/components/auth/LoginButtons";
import type { UserRole } from "@/lib/types";

export default function WelcomePage() {
  const [role, setRole] = useState<UserRole>("senior");

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-3xl font-extrabold">Welcome</h1>
      <p className="mb-8 text-lg text-ink-700">Select your role</p>

      <RoleSelector selected={role} onSelect={setRole} />

      <div className="mt-10">
        <LoginButtons role={role} />
      </div>
    </main>
  );
}
