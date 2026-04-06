const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
    if (!GROK_API_KEY) throw new Error('GROK_API_KEY not configured')

    const { displayName, totalDonated, charities, donationCount } = await req.json()

    const prompt = `Write a warm, personalised 2-3 sentence impact summary for a donor named "${displayName || 'a generous donor'}". 
They've made ${donationCount} donations totalling $${totalDonated.toFixed(2)} to these charities: ${charities.join(', ')}.
Make it encouraging, heartfelt, and mention specific causes. Do NOT use markdown. Return only the summary text.`

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Grok API error:', res.status, errText)
      throw new Error('AI is temporarily unavailable. Please try again.')
    }

    const result = await res.json()
    const summary = result.choices?.[0]?.message?.content || ''

    return new Response(JSON.stringify({ summary, provider: 'grok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'AI is temporarily unavailable. Please try again.'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
