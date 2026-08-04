"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pill, Wrench, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/senior", label: "Home", icon: Home },
  { href: "/senior/pills", label: "Pills", icon: Pill },
  { href: "/senior/services", label: "Services", icon: Wrench },
];

// Persistent bottom bar so a senior is never more than one tap away from
// Home, Pills, or Services — the red floating SOS badge is always visible
// regardless of which tab is active.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white px-2 py-2">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-touch flex-1 flex-col items-center justify-center gap-1 rounded-xl",
              active ? "text-emergency" : "text-gray-400"
            )}
          >
            <Icon size={24} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        );
      })}
      <Link
        href="/senior"
        aria-label="Emergency SOS"
        className="absolute -top-6 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-emergency text-white shadow-lg"
      >
        <AlertTriangle size={24} />
      </Link>
    </nav>
  );
}
