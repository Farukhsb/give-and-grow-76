const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const CheckoutSchema = z.object({
  charityId: z.string().min(1).max(200),
  charityName: z.string().min(1).max(200),
  amount: z.number().positive().max(100000),
  currency: z.string().length(3).optional().default("usd"),
  origin: z.string().url().optional(),
});

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

function encodeFormBody(values: Record<string, string>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    body.append(key, value);
  }
  return body;
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

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { charityId, charityName, amount, currency, origin } = parsed.data;
    const siteUrl = publicSiteUrl || origin || new URL(req.url).origin;
    const amountInMinorUnits = Math.round(amount * 100);
    const donationId = crypto.randomUUID();

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const insertResult = await supabase.from("donations").insert({
      id: donationId,
      user_id: user.id,
      charity_id: charityId,
      charity_name: charityName,
      amount,
      currency: currency.toLowerCase(),
      status: "pending",
      payment_method: "stripe_checkout",
      payment_provider: "stripe",
    });

    if (insertResult.error) {
      throw insertResult.error;
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodeFormBody({
        mode: "payment",
        success_url: `${siteUrl}/checkout-result?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout-result?status=cancelled`,
        "line_items[0][price_data][currency]": currency.toLowerCase(),
        "line_items[0][price_data][product_data][name]": charityName,
        "line_items[0][price_data][product_data][description]": `Donation to ${charityName}`,
        "line_items[0][price_data][unit_amount]": String(amountInMinorUnits),
        "line_items[0][quantity]": "1",
        customer_email: user.email ?? "",
        "metadata[donation_id]": donationId,
        "metadata[user_id]": user.id,
        "metadata[charity_id]": charityId,
        "metadata[charity_name]": charityName,
      }),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error("Stripe checkout creation failed:", stripeResponse.status, errorText);
      await supabase.from("donations").delete().eq("id", donationId);
      throw new Error("Unable to create Stripe Checkout session");
    }

    const session = await stripeResponse.json();
    const updateResult = await supabase
      .from("donations")
      .update({
        stripe_session_id: session.id,
        receipt_url: session.url,
      })
      .eq("id", donationId);

    if (updateResult.error) {
      throw updateResult.error;
    }

    return new Response(JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    const message = error instanceof Error ? error.message : "Unable to start checkout";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
