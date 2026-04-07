import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Heart, Loader2 } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { stories } from "@/data/demo";
import { useCharity, addDonation, getImpactMessage } from "@/hooks/use-charities";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DonationReceipt from "@/components/DonationReceipt";
import QuickDonate from "@/components/QuickDonate";

const CharityDetail = () => {
  const { id } = useParams();
  const { charity, loading } = useCharity(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [donating, setDonating] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    donorName: string; charityName: string; amount: number; date: Date; transactionId: string;
  } | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!charity) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-2xl font-bold">Charity not found</h1>
          <Button asChild className="mt-4"><Link to="/charities">Back to Charities</Link></Button>
        </div>
      </Layout>
    );
  }

  const relatedStories = stories.filter((s) => s.charityId === charity.id);
  const progress = charity.goalAmount > 0 ? (charity.amountRaised / charity.goalAmount) * 100 : 0;

  const handleDonate = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to donate.", variant: "destructive" });
      return;
    }
    setDonating(true);
    try {
      await addDonation(charity.id, selectedAmount);
      const txId = crypto.randomUUID();
      await supabase.from("donations").insert({
        user_id: user.id,
        charity_id: charity.id,
        charity_name: charity.name,
        amount: selectedAmount,
        status: "completed",
        payment_method: "demo",
        receipt_url: txId,
      });
      setReceiptData({
        donorName: user.user_metadata?.full_name || user.email || "Donor",
        charityName: charity.name,
        amount: selectedAmount,
        date: new Date(),
        transactionId: txId,
      });
      toast({
        title: "Thank you! 🎉",
        description: getImpactMessage(selectedAmount),
      });
    } catch {
      toast({ title: "Donation failed", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setDonating(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/charities"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Charities</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {charity.image && (
              <div className="overflow-hidden rounded-lg">
                <img src={charity.image} alt={charity.name} className="aspect-[16/9] w-full object-cover" />
              </div>
            )}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {charity.category && <Badge variant="secondary">{charity.category}</Badge>}
                {charity.urgency && (
                  <Badge variant={charity.urgency === "high" ? "destructive" : "outline"} className="capitalize">{charity.urgency} urgency</Badge>
                )}
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold md:text-4xl">{charity.name}</h1>
              {charity.location && (
                <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{charity.location}</p>
              )}
              <p className="mt-6 leading-relaxed text-muted-foreground">{charity.longDescription || charity.description}</p>
            </div>

            {relatedStories.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif text-2xl font-bold">Related Stories</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {relatedStories.map((story) => (
                    <Link key={story.id} to={`/stories/${story.id}`}>
                      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={story.image} alt={story.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-serif font-semibold">{story.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{story.excerpt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Donate Card */}
            <Card>
              <CardContent className="p-4">
                <QuickDonate charityId={charity.id} charityName={charity.name} />
              </CardContent>
            </Card>

            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold">Donate to {charity.name}</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">${charity.amountRaised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${charity.goalAmount.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" />{charity.donors.toLocaleString()} donors</p>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button key={amount} variant={selectedAmount === amount ? "default" : "outline"} size="sm" onClick={() => setSelectedAmount(amount)}>
                      ${amount}
                    </Button>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium mb-2">Payment Method</p>
                  <RadioGroup defaultValue="card" className="grid grid-cols-2 gap-2">
                    {[
                      { value: "card", label: "💳 Card", desc: "Visa / Mastercard" },
                      { value: "paypal", label: "🅿️ PayPal", desc: "Pay with PayPal" },
                      { value: "bank", label: "🏦 Bank", desc: "Bank Transfer" },
                      { value: "apple", label: "🍎 Apple Pay", desc: "Quick checkout" },
                    ].map((method) => (
                      <label key={method.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-input p-2.5 transition-colors hover:bg-accent has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5">
                        <RadioGroupItem value={method.value} className="sr-only" />
                        <div>
                          <p className="text-sm font-medium leading-none">{method.label}</p>
                          <p className="text-[11px] text-muted-foreground">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {!user && (
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to donate and track your contributions.
                  </p>
                )}

                <Button className="mt-4 w-full gap-2" size="lg" onClick={handleDonate} disabled={donating}>
                  {donating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                  {donating ? "Processing..." : "Donate Now"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">Secure payment · Tax deductible · 95% goes to charity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {receiptData && <DonationReceipt receipt={receiptData} onClose={() => setReceiptData(null)} />}
    </Layout>
  );
};

export default CharityDetail;
