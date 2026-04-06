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
    const { cause, helpMethod, location } = await req.json();

    const prompt = `You are a charity recommendation engine. Based on these user preferences:
- Cause they care about: ${cause}
- How they want to help: ${helpMethod}
- Impact scope: ${location}

Recommend exactly 3 charities. Return a JSON array with objects having: name, reason (1-2 sentences), category.
Return ONLY valid JSON array, no other text.`;

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
    const content = result.choices?.[0]?.message?.content || "[]";
    let recommendations;
    try {
      const parsed = JSON.parse(content);
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    } catch {
      recommendations = [];
    }

    return new Response(JSON.stringify({ recommendations, provider: grokKey ? 'grok' : 'lovable' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});