import { supabase } from "@/integrations/supabase/client";

interface StartCheckoutInput {
  charityId: string;
  charityName: string;
  amount: number;
}

export async function startStripeCheckout({ charityId, charityName, amount }: StartCheckoutInput) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      charityId,
      charityName,
      amount,
      currency: "usd",
      origin: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.checkoutUrl) {
    throw new Error("Missing checkout URL");
  }

  window.location.assign(data.checkoutUrl);
}
