"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "emergency" | "pills" | "services" | "community" | "family" | "neutral" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

// Every button in Golden Link meets a 64px minimum height so seniors with
// reduced motor precision or vision can tap confidently — see report
// section 1 ("large touch targets") and c.1 (results on accessibility).
const variantClasses: Record<Variant, string> = {
  emergency: "bg-emergency text-white hover:bg-emergency-dark focus-visible:ring-emergency",
  pills: "bg-pills text-white hover:bg-pills-dark focus-visible:ring-pills",
  services: "bg-services text-white hover:bg-services-dark focus-visible:ring-services",
  community: "bg-community text-white hover:bg-community-dark focus-visible:ring-community",
  family: "bg-family text-white hover:bg-family-dark focus-visible:ring-family",
  neutral: "bg-ink-900 text-white hover:bg-black focus-visible:ring-ink-900",
  outline: "bg-white text-ink-900 border-2 border-gray-200 hover:border-gray-400 focus-visible:ring-gray-400",
};

export function Button({
  variant = "neutral",
  icon,
  fullWidth = true,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "min-h-touch inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-4",
        "text-xl font-semibold tracking-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth && "w-full",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
