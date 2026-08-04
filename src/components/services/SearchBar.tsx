"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search services..." }: SearchBarProps) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-touch w-full rounded-2xl border-2 border-gray-200 pl-12 pr-4 text-lg focus:border-services focus:outline-none"
      />
    </div>
  );
}
