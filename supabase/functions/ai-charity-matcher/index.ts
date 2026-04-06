import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { cause, helpMethod, location } = await req.json();

    const prompt = `You are a charity recommendation engine. Based on these user preferences:
- Cause they care about: ${cause}
- How they want to help: ${helpMethod}
- Impact scope: ${location}

Recommend exactly 3 charities. Return a JSON array with objects having: name, reason (1-2 sentences), category.
Return ONLY valid JSON array, no other text.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const res = await fetch("https://ai.lovable.dev/api/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const result = await res.json();
    const content = result.choices?.[0]?.message?.content || "[]";
    let recommendations;
    try {
      const parsed = JSON.parse(content);
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    } catch {
      recommendations = [];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
