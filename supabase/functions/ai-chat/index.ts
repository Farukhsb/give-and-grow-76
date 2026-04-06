import { corsHeaders } from '@supabase/supabase-js/cors'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string().min(1).max(2000),
  })).min(1).max(50),
})

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { messages } = parsed.data

    const systemMessage = {
      role: 'system',
      content: `You are CharityBot, a helpful AI assistant for CharityApp — a platform that connects donors with verified charities worldwide. You help users:
- Find charities and causes to donate to
- Understand how donations work and where money goes
- Learn about volunteering opportunities
- Navigate the platform (dashboard, profile, donation history)
- Answer questions about tax deductions, receipts, and impact tracking
- Provide encouragement and information about charitable giving

Be warm, concise, and helpful. Use emoji sparingly. If asked about specific charities, mention categories like Water & Sanitation, Education, Food Security, Healthcare, Environment, and Housing. The platform supports donations via Credit Card, PayPal, Bank Transfer, and Apple Pay. 95% of every donation goes directly to the charity.`
    }

    const aiMessages = [
      systemMessage,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    // Try Grok first, fall back to Lovable AI
    const grokKey = await getGrokKey()
    let apiUrl: string
    let authHeader: string
    let model: string

    if (grokKey) {
      apiUrl = 'https://api.x.ai/v1/chat/completions'
      authHeader = `Bearer ${grokKey}`
      model = 'grok-3-mini'
    } else {
      const lovableKey = Deno.env.get('LOVABLE_API_KEY')
      if (!lovableKey) throw new Error('No AI API key available')
      apiUrl = 'https://ai.lovable.dev/v1/chat/completions'
      authHeader = `Bearer ${lovableKey}`
      model = 'google/gemini-2.5-flash'
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: aiMessages,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`AI API error [${response.status}]: ${errText}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."

    return new Response(JSON.stringify({ reply, provider: grokKey ? 'grok' : 'lovable' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})