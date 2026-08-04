// Supabase Edge Function: scan-medicine-label
//
// Invoked from the "Scan Bottle" button on the Pills page. Receives a
// base64 photo captured through the Capacitor Camera plugin and asks
// Gemini's vision model to read the medicine name off the label, so the
// senior doesn't have to type it — the "Capacitor-powered camera
// interface to scan medicine bottles" described in the report's abstract.
//
// Deploy with:
//   supabase functions deploy scan-medicine-label
//   supabase secrets set GEMINI_API_KEY=your_key

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

Deno.serve(async (req) => {
  try {
    const { image } = await req.json(); // base64-encoded JPEG, no data: prefix

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Read the label on this medicine bottle or blister pack. Reply with only the medicine name and strength, e.g. 'Paracetamol 650mg'. If you cannot read it, reply 'Unknown'.",
              },
              { inline_data: { mime_type: "image/jpeg", data: image } },
            ],
          },
        ],
      }),
    });

    const result = await response.json();
    const text: string =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "Unknown";

    return new Response(JSON.stringify({ medicineName: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
