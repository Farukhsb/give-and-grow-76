const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    const { cause, helpMethod, location } = await req.json()

    const prompt = `You are a charity recommendation engine. Based on these user preferences:
- Cause they care about: ${cause}
- How they want to help: ${helpMethod}
- Impact scope: ${location}

Recommend exactly 3 charities. Return a JSON array with objects having: name, reason (1-2 sentences), category.
Return ONLY valid JSON array, no other text.`

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Lovable AI error:', res.status, errText)
      throw new Error('AI is temporarily unavailable. Please try again.')
    }

    const result = await res.json()
    const content = result.choices?.[0]?.message?.content || '[]'
    let recommendations
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || []
    } catch {
      recommendations = []
    }

    return new Response(JSON.stringify({ recommendations, provider: 'lovable' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'AI is temporarily unavailable. Please try again.'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
