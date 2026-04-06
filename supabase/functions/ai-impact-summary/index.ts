import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function getGrokKey(): Promise<string | null> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'grok_api_key')
      .maybeSingle()
    return data?.value || null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { displayName, totalDonated, charities, donationCount } = await req.json();

    const prompt = `Write a warm, personalised 2-3 sentence impact summary for a donor named "${displayName || "a generous donor"}". 
They've made ${donationCount} donations totalling $${totalDonated.toFixed(2)} to these charities: ${charities.join(", ")}.
Make it encouraging, heartfelt, and mention specific causes. Do NOT use markdown. Return only the summary text.`;

    const grokKey = await getGrokKey()
    let apiUrl: string
    let authHeader: string
    let model: string

    if (grokKey) {
      apiUrl = 'https://api.x.ai/v1/chat/completions'
      authHeader = `Bearer ${grokKey}`
      model = 'grok-3-mini'
    } else {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) throw new Error("No AI API key available");
      apiUrl = 'https://ai.lovable.dev/v1/chat/completions'
      authHeader = `Bearer ${lovableKey}`
      model = 'google/gemini-2.5-flash'
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`AI API error [${res.status}]: ${errText}`)
    }

    const result = await res.json();
    const summary = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary, provider: grokKey ? 'grok' : 'lovable' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});