import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golden Link",
  description: "A senior-first companion app for emergency response, medicine, services, and community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto min-h-screen max-w-md bg-white">{children}</body>
    </html>
  );
}
