import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DonationStatus {
  charity_name: string;
  amount: number;
  status: string;
}

export default function CheckoutResult() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<DonationStatus | null>(null);
  const status = params.get("status");
  const sessionId = params.get("session_id");

  useEffect(() => {
    const loadDonation = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("donations")
        .select("charity_name, amount, status")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      setDonation(data);
      setLoading(false);
    };

    loadDonation();
  }, [sessionId]);

  const isSuccess = status === "success";

  return (
    <Layout>
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="space-y-6 p-8 text-center">
            {loading ? (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <div>
                  <h1 className="font-serif text-2xl font-bold">Verifying your payment</h1>
                  <p className="mt-2 text-muted-foreground">We are waiting for confirmation from Stripe.</p>
                </div>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                <div>
                  <h1 className="font-serif text-2xl font-bold">Payment received</h1>
                  <p className="mt-2 text-muted-foreground">
                    {donation
                      ? `Your donation to ${donation.charity_name} is currently marked as ${donation.status}.`
                      : "Stripe returned successfully. Your donation status will appear in your dashboard as soon as the webhook confirms it."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-10 w-10 text-amber-600" />
                <div>
                  <h1 className="font-serif text-2xl font-bold">Checkout cancelled</h1>
                  <p className="mt-2 text-muted-foreground">No payment was completed. You can return to the charity page and try again.</p>
                </div>
              </>
            )}

            {donation && (
              <div className="rounded-lg border bg-accent/30 p-4 text-left text-sm">
                <p><strong>Charity:</strong> {donation.charity_name}</p>
                <p><strong>Amount:</strong> ${Number(donation.amount).toFixed(2)}</p>
                <p><strong>Status:</strong> {donation.status}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/charities">Browse Charities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
