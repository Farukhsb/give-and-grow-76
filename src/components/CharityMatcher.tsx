import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Heart, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCharities } from "@/hooks/use-charities";
import { buildCharityRecommendations, type CharityRecommendation } from "@/lib/charityRecommendations";
import { saveRecommendationHistory } from "@/lib/donorInsights";

const questions = [
  {
    title: "What cause matters most to you?",
    options: [
      { value: "environment", label: "🌍 Environment" },
      { value: "children", label: "👶 Children" },
      { value: "health", label: "🏥 Health" },
      { value: "poverty", label: "🏠 Poverty" },
      { value: "animals", label: "🐾 Animals" },
      { value: "education", label: "📚 Education" },
    ],
  },
  {
    title: "How do you prefer to help?",
    options: [
      { value: "donate", label: "💰 Donate Money" },
      { value: "volunteer", label: "🤝 Volunteer Time" },
      { value: "both", label: "✨ Both" },
    ],
  },
  {
    title: "Where do you want your impact?",
    options: [
      { value: "local", label: "🏘️ Local" },
      { value: "national", label: "🗺️ National" },
      { value: "global", label: "🌐 Global" },
      { value: "anywhere", label: "🌎 Anywhere" },
    ],
  },
];

interface CharityMatcherProps {
  onClose: () => void;
}

const normaliseRecommendation = (recommendation: Partial<CharityRecommendation>, index: number): CharityRecommendation => ({
  id: recommendation.id ?? recommendation.name ?? `ai-match-${index}`,
  name: recommendation.name ?? "Recommended campaign",
  category: recommendation.category ?? "General support",
  location: recommendation.location ?? "Location not specified",
  urgency: recommendation.urgency ?? "medium",
  reason: recommendation.reason ?? "Recommended based on your selected preferences.",
  matchScore: Number(recommendation.matchScore ?? 80),
  matchFactors: recommendation.matchFactors ?? ["AI-assisted match"],
  transparencySignals: recommendation.transparencySignals ?? [],
});

export default function CharityMatcher({ onClose }: CharityMatcherProps) {
  const { charities } = useCharities();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CharityRecommendation[] | null>(null);

  const handleSelect = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  };

  const buildFallbackRecommendations = () =>
    buildCharityRecommendations(charities, {
      cause: answers[0] ?? "",
      helpMethod: answers[1] ?? "",
      location: answers[2] ?? "",
      urgency: "any",
    });

  const persistPreferences = async (userId: string | undefined) => {
    if (!userId) return;

    const { error } = await supabase.from("donor_preferences").upsert({
      donor_id: userId,
      cause: answers[0] ?? "",
      help_method: answers[1] ?? "",
      location: answers[2] ?? "",
    });

    if (error) console.warn("Could not save donor preferences", error);
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);

    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const userId = userResponse.user?.id;
      await persistPreferences(userId);

      const { data, error } = await supabase.functions.invoke("ai-charity-matcher", {
        body: {
          cause: answers[0] ?? "",
          helpMethod: answers[1] ?? "",
          location: answers[2] ?? "",
        },
      });

      const aiRecommendations = !error && Array.isArray(data?.recommendations)
        ? data.recommendations.map(normaliseRecommendation)
        : [];

      const recommendations = aiRecommendations.length > 0 ? aiRecommendations : buildFallbackRecommendations();
      setResults(recommendations);

      if (userId) {
        await saveRecommendationHistory(userId, recommendations);
      }
    } catch (error) {
      console.warn("Charity matcher fell back to local recommendations", error);
      setResults(buildFallbackRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const resetMatcher = () => {
    setResults(null);
    setStep(0);
    setAnswers([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg"
      >
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="p-6">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Finding explainable charity matches...</p>
              </div>
            ) : results ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Your Top Matches</h3>
                  <p className="text-sm text-muted-foreground">Based on your preferences and available campaign data</p>
                </div>

                {results.map((recommendation, index) => (
                  <Card key={`${recommendation.id}-${index}`} className="border-primary/10 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="secondary" className="mb-1 text-xs">{recommendation.category}</Badge>
                          <h4 className="font-semibold">{recommendation.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{recommendation.reason}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">{recommendation.matchScore}%</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {recommendation.matchFactors.slice(0, 3).map((factor) => (
                          <Badge key={factor} variant="outline" className="text-xs">{factor}</Badge>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button size="sm" asChild>
                          <Link to={`/charities/${recommendation.id}`} onClick={onClose}>
                            <Heart className="mr-1 h-3 w-3" /> View Campaign
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" type="button">
                          <Clock className="mr-1 h-3 w-3" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button variant="outline" className="w-full" onClick={resetMatcher}>
                  Start Over
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Find My Charity</h3>
                  <p className="text-sm text-muted-foreground">Step {step + 1} of {questions.length}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-center font-medium">{questions[step].title}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {questions[step].options.map((option) => (
                      <Button
                        key={option.value}
                        variant={answers[step] === option.value ? "default" : "outline"}
                        className="h-auto py-3 text-sm"
                        onClick={() => handleSelect(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleNext} disabled={!answers[step]}>
                    {step === questions.length - 1 ? "Find Matches" : "Next"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
