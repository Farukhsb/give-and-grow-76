const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "stripe-signature, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signPayload(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = await signPayload(secret, signedPayload);

  const withinTolerance = Math.abs(Date.now() / 1000 - Number(timestamp)) <= 300;
  if (!withinTolerance) {
    return false;
  }

  return signatures.some((signature) => timingSafeEqual(signature, expectedSignature));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeWebhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

    const payload = await req.text();
    const signatureHeader = req.headers.get("stripe-signature") ?? "";
    const isValid = await verifyStripeSignature(payload, signatureHeader, stripeWebhookSecret);

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(payload);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const donationId = session.metadata?.donation_id;
      const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;

      if (donationId) {
        const { error } = await supabase
          .from("donations")
          .update({
            status: "completed",
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntent,
            receipt_url: session.payment_intent ? `https://dashboard.stripe.com/payments/${paymentIntent}` : session.url,
            completed_at: new Date().toISOString(),
            payment_method: "stripe_checkout",
            payment_provider: "stripe",
          })
          .eq("id", donationId);

        if (error) {
          throw error;
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const donationId = session.metadata?.donation_id;

      if (donationId) {
        await supabase.from("donations").update({ status: "failed" }).eq("id", donationId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook handling failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
