// Supabase Edge Function: send-sos-alert
//
// Invoked from ConfirmCallModal.tsx the moment a senior confirms an SOS.
// Looks up every family member linked to that senior and emails them a
// real-time alert (with a Google Maps link if a location was captured)
// using the Resend API — the "resend API for real-time Alerts" mentioned
// in Ritika Tyagi's individual contribution section of the report.
//
// Deploy with:
//   supabase functions deploy send-sos-alert
//   supabase secrets set RESEND_API_KEY=your_key SUPABASE_SERVICE_ROLE_KEY=your_key

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const { userId, latitude, longitude } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: senior } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const { data: links } = await supabase
      .from("family_links")
      .select("family:profiles!family_links_family_id_fkey(email, full_name)")
      .eq("senior_id", userId)
      .not("family_id", "is", null);

    const mapsLink =
      latitude && longitude
        ? `https://maps.google.com/?q=${latitude},${longitude}`
        : "Location unavailable";

    const emails = (links ?? [])
      .map((row: any) => row.family?.email)
      .filter(Boolean);

    if (emails.length > 0) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Golden Link <alerts@goldenlink.app>",
          to: emails,
          subject: `SOS: ${senior?.full_name ?? "Your senior"} needs help`,
          html: `<p><strong>${senior?.full_name ?? "A senior you're linked to"}</strong> just triggered an emergency alert.</p><p>Location: <a href="${mapsLink}">${mapsLink}</a></p>`,
        }),
      });
    }

    return new Response(JSON.stringify({ notified: emails.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
