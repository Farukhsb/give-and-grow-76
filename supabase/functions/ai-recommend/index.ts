const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const RequestSchema = z.object({
  user_id: z.string().uuid(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { user_id } = parsed.data

    const { data: donations } = await supabase
      .from('donations')
      .select('charity_name, amount')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20)

    const donationSummary = donations?.length
      ? `User has donated to: ${donations.map(d => `${d.charity_name} ($${d.amount})`).join(', ')}`
      : 'User has no donation history yet.'

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a charity recommendation engine. Based on a user's donation history, suggest 3 charity categories they might be interested in. Available categories: Water & Sanitation, Education, Food Security, Healthcare, Environment, Housing. Return a JSON array of objects with "category" and "reason" fields. Only output valid JSON.`
          },
          { role: 'user', content: donationSummary }
        ],
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Lovable AI error:', response.status, errText)
      throw new Error('AI is temporarily unavailable. Please try again.')
    }

    const data = await response.json()
    let recommendations = []
    try {
      const content = data.choices?.[0]?.message?.content || '[]'
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recommendations = JSON.parse(cleaned)
    } catch {
      recommendations = [
        { category: "Education", reason: "Education empowers communities for lasting change" },
        { category: "Healthcare", reason: "Healthcare access saves lives in underserved areas" },
        { category: "Water & Sanitation", reason: "Clean water is fundamental to every community" },
      ]
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    const msg = error instanceof Error ? error.message : 'AI is temporarily unavailable. Please try again.'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
