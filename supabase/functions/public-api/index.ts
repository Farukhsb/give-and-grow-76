const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || 'stats'

    if (endpoint === 'stats') {
      const [donRes, profRes] = await Promise.all([
        supabase.from('donations').select('amount', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ])

      const totalRaised = (donRes.data || []).reduce((s, d) => s + Number(d.amount), 0)

      return new Response(JSON.stringify({
        platform: 'CharityApp',
        stats: {
          total_raised: totalRaised,
          total_donations: donRes.count || 0,
          total_users: profRes.count || 0,
          countries_reached: 35,
          charities_supported: 150,
        },
        api_version: '1.0',
        documentation: 'Use ?endpoint=stats for platform stats, ?endpoint=donations for recent donations',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (endpoint === 'donations') {
      const limit = Math.min(Number(url.searchParams.get('limit') || 10), 50)
      const { data } = await supabase
        .from('donations')
        .select('charity_name, amount, status, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit)

      return new Response(JSON.stringify({
        donations: (data || []).map(d => ({
          charity: d.charity_name,
          amount: d.amount,
          status: d.status,
          date: d.created_at,
        })),
        count: data?.length || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      error: 'Unknown endpoint',
      available: ['stats', 'donations'],
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Public API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
