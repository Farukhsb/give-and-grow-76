const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function requireUser(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await requireUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { displayName, totalDonated, charities, donationCount } = await req.json();
    const safeDisplayName = displayName || user.email || "a generous donor";
    const safeCharities = Array.isArray(charities) ? charities : [];
    const safeDonationCount = Number.isFinite(donationCount) ? donationCount : 0;
    const safeTotalDonated = Number.isFinite(totalDonated) ? totalDonated : 0;

    const prompt = `Write a warm, personalised 2-3 sentence impact summary for a donor named "${safeDisplayName}".
They have ${safeDonationCount} verified donations totalling $${safeTotalDonated.toFixed(2)} to these charities: ${safeCharities.join(", ")}.
Make it encouraging, heartfelt, and mention specific causes. Do not use markdown. Return only the summary text.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Lovable AI error:", res.status, errText);
      throw new Error("AI is temporarily unavailable. Please try again.");
    }

    const result = await res.json();
    const summary = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary, provider: "lovable" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI is temporarily unavailable. Please try again.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
