import { corsHeaders } from '@supabase/supabase-js/cors'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const MessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string().min(1).max(2000),
  })).min(1).max(50),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    const body = await req.json()
    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { messages } = parsed.data

    const aiMessages = [
      {
        role: 'system',
        content: `You are CharityBot, a helpful AI assistant for CharityApp — a platform that connects donors with verified charities worldwide. You help users:
- Find charities and causes to donate to
- Understand how donations work and where money goes
- Learn about volunteering opportunities
- Navigate the platform (dashboard, profile, donation history)
- Answer questions about tax deductions, receipts, and impact tracking
- Provide encouragement and information about charitable giving

Be warm, concise, and helpful. Use emoji sparingly. If asked about specific charities, mention categories like Water & Sanitation, Education, Food Security, Healthcare, Environment, and Housing. The platform supports donations via Credit Card, PayPal, Bank Transfer, and Apple Pay. 95% of every donation goes directly to the charity.`
      },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    const response = await fetch('https://ai.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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

    return new Response(JSON.stringify({ reply }), {
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
