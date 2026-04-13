import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Loader2, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { stories } from "@/data/demo";
import { getImpactMessage, useCharity } from "@/hooks/use-charities";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import QuickDonate from "@/components/QuickDonate";
import { startStripeCheckout } from "@/lib/payments";

const CharityDetail = () => {
  const { id } = useParams();
  const { charity, loading } = useCharity(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [donating, setDonating] = useState(false);

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
          <Button asChild className="mt-4">
            <Link to="/charities">Back to Charities</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const relatedStories = stories.filter((story) => story.charityId === charity.id);
  const progress = charity.goalAmount > 0 ? (charity.amountRaised / charity.goalAmount) * 100 : 0;

  const handleDonate = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to donate.", variant: "destructive" });
      return;
    }

    setDonating(true);
    try {
      await startStripeCheckout({
        charityId: charity.id,
        charityName: charity.name,
        amount: selectedAmount,
      });
      toast({
        title: "Redirecting to secure checkout",
        description: getImpactMessage(selectedAmount),
      });
    } catch {
      toast({ title: "Checkout failed", description: "We could not start Stripe Checkout.", variant: "destructive" });
    } finally {
      setDonating(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/charities">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Charities
          </Link>
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
                  <Badge variant={charity.urgency === "high" ? "destructive" : "outline"} className="capitalize">
                    {charity.urgency} urgency
                  </Badge>
                )}
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold md:text-4xl">{charity.name}</h1>
              {charity.location && (
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {charity.location}
                </p>
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

          <div className="space-y-4">
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
                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {charity.donors.toLocaleString()} donors
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button key={amount} variant={selectedAmount === amount ? "default" : "outline"} size="sm" onClick={() => setSelectedAmount(amount)}>
                      ${amount}
                    </Button>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border bg-accent/20 p-3 text-sm text-muted-foreground">
                  Payment is handled in Stripe Checkout. Supported methods depend on your Stripe account and country configuration.
                </div>

                {!user && (
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to donate and track your contributions.
                  </p>
                )}

                <Button className="mt-4 w-full gap-2" size="lg" onClick={handleDonate} disabled={donating}>
                  {donating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                  {donating ? "Processing..." : "Donate Securely"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Secure checkout powered by Stripe. Your donation is only marked complete after server-side verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CharityDetail;
