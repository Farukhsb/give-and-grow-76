import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { displayName, totalDonated, charities, donationCount } = await req.json();

    const prompt = `Write a warm, personalised 2-3 sentence impact summary for a donor named "${displayName || "a generous donor"}". 
They've made ${donationCount} donations totalling $${totalDonated.toFixed(2)} to these charities: ${charities.join(", ")}.
Make it encouraging, heartfelt, and mention specific causes. Do NOT use markdown. Return only the summary text.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const res = await fetch("https://ai.lovable.dev/api/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const result = await res.json();
    const summary = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
