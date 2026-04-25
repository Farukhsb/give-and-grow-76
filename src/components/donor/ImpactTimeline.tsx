import { CalendarDays, CheckCircle2, HandHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Donation {
  id: string;
  charity_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  receipt_url: string | null;
}

interface ImpactTimelineProps {
  donations: Donation[];
}

const formatCurrency = (amount: number, currency = "gbp") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

const buildImpactText = (donation: Donation) =>
  `${formatCurrency(Number(donation.amount), donation.currency)} contributed toward ${donation.charity_name}. This record is based on a completed donation and should be read as a contribution toward the campaign, not a guaranteed individual outcome.`;

export default function ImpactTimeline({ donations }: ImpactTimelineProps) {
  const completedDonations = donations.filter((donation) => donation.status === "completed");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HandHeart className="h-5 w-5 text-primary" /> Impact Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedDonations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No verified impact records yet.</p>
            <p className="mt-2 text-sm">Completed donations will appear here once Stripe confirms payment.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/charities">Browse Charities</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {completedDonations.map((donation) => (
              <div key={donation.id} className="relative rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">Verified donation</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(donation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium">{donation.charity_name}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{buildImpactText(donation)}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(Number(donation.amount), donation.currency)}
                    </p>
                    {donation.receipt_url && (
                      <a className="text-xs text-primary underline" href={donation.receipt_url} target="_blank" rel="noreferrer">
                        View receipt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
