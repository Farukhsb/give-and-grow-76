import { Heart, Info, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CharityRecommendation } from "@/lib/charityRecommendations";

interface RecommendedCampaignsProps {
  recommendations: CharityRecommendation[];
  onOpenMatcher: () => void;
}

const getWhyLabel = (factor: string) => {
  const labels: Record<string, string> = {
    "cause alignment": "Matches your cause",
    "location preference": "Fits your location preference",
    "campaign urgency": "Urgent campaign",
    "close to target": "Close to funding target",
    "visible funding progress": "Progress is visible",
    "existing donor activity": "Other donors are active",
    "general relevance": "Generally relevant",
  };

  return labels[factor] ?? factor;
};

const getWhyDescription = (factor: string) => {
  const descriptions: Record<string, string> = {
    "cause alignment": "The campaign category or description aligns with the cause area selected in the matcher.",
    "location preference": "The campaign location appears to fit the location preference selected by the donor.",
    "campaign urgency": "The campaign has an urgency signal that increases its recommendation priority.",
    "close to target": "The campaign is already close to its target, so an additional donation may help close the remaining funding gap.",
    "visible funding progress": "The campaign has a visible target and progress value, making its funding status easier to understand.",
    "existing donor activity": "The campaign already has donor activity, which suggests existing supporter engagement.",
    "general relevance": "The campaign is being shown because it has available campaign data, even without a strong personalised signal yet.",
  };

  return descriptions[factor] ?? "This factor contributed to the recommendation score.";
};

export default function RecommendedCampaigns({ recommendations, onOpenMatcher }: RecommendedCampaignsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> Recommended For You
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Explainable suggestions based on your preferences and available campaign data.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenMatcher}>
            Update Preferences
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <Info className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p>No recommendations are available yet.</p>
            <p className="mt-1 text-sm">Answer a few matching questions to personalise your campaign suggestions.</p>
            <Button className="mt-4" size="sm" onClick={onOpenMatcher}>
              Find My Charity
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {recommendation.category || "General"}
                    </Badge>
                    <h3 className="font-semibold leading-tight">{recommendation.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{recommendation.location}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {recommendation.matchScore}%
                  </div>
                </div>

                <div className="mt-3 rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-medium text-foreground">Why this was recommended</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {recommendation.matchFactors.slice(0, 4).map((factor) => (
                      <Badge
                        key={factor}
                        variant="outline"
                        className="cursor-help text-xs"
                        title={getWhyDescription(factor)}
                      >
                        {getWhyLabel(factor)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{recommendation.reason}</p>

                {recommendation.transparencySignals.length > 0 && (
                  <div className="mt-3 rounded-md border border-dashed p-2">
                    <p className="text-xs font-medium text-foreground">Transparency signals</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {recommendation.transparencySignals.slice(0, 3).map((signal) => (
                        <Badge key={signal} variant="secondary" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button asChild size="sm" className="mt-4 w-full">
                  <Link to={`/charities/${recommendation.id}`}>
                    <Heart className="mr-1 h-3 w-3" /> View Campaign
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
