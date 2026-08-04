"use client";

import { Users, Heart, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface RoleSelectorProps {
  selected: UserRole;
  onSelect: (role: UserRole) => void;
}

const roles: { id: UserRole; label: string; icon: React.ElementType; activeClass: string }[] = [
  { id: "senior", label: "Senior", icon: Users, activeClass: "bg-pills text-white" },
  { id: "family", label: "Family", icon: Heart, activeClass: "bg-family text-white" },
  { id: "volunteer", label: "Volunteer", icon: UserPlus, activeClass: "bg-services text-white" },
];

// Lets a first-time visitor pick which of the three roles they're signing
// up as — Senior, Family, or Volunteer — before continuing to OAuth.
export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {roles.map(({ id, label, icon: Icon, activeClass }) => {
        const isActive = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "min-h-touch flex items-center gap-3 rounded-2xl border-2 px-6 py-4 text-xl font-semibold transition-colors",
              isActive ? cn(activeClass, "border-transparent") : "border-gray-200 bg-white text-ink-900"
            )}
          >
            <Icon size={26} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
