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

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{recommendation.reason}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {recommendation.matchFactors.slice(0, 3).map((factor) => (
                    <Badge key={factor} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>

                {recommendation.transparencySignals.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Transparency: {recommendation.transparencySignals.slice(0, 2).join(", ")}
                  </p>
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
