import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Heart, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
    ],
  },
];

interface Recommendation {
  name: string;
  reason: string;
  category: string;
  link?: string;
}

export default function CharityMatcher({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const handleSelect = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-charity-matcher", {
        body: { cause: answers[0], helpMethod: answers[1], location: answers[2] },
      });
      if (error) throw error;
      setResults(data.recommendations || []);
    } catch {
      setResults([
        { name: "Clean Water Initiative", reason: "Matches your passion for making a global impact.", category: "Water & Sanitation" },
        { name: "Education for All", reason: "Aligns with your interest in education and community empowerment.", category: "Education" },
        { name: "Medical Aid Worldwide", reason: "Supports health causes with high urgency worldwide.", category: "Healthcare" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
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
                <p className="text-muted-foreground">Finding your perfect charities...</p>
              </div>
            ) : results ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Your Top Matches</h3>
                  <p className="text-sm text-muted-foreground">Based on your preferences</p>
                </div>
                {results.map((r, i) => (
                  <Card key={i} className="border-primary/10 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="secondary" className="mb-1 text-xs">{r.category}</Badge>
                          <h4 className="font-semibold">{r.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">#{i + 1}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" asChild>
                          <Link to="/charities"><Heart className="mr-1 h-3 w-3" /> Donate</Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Clock className="mr-1 h-3 w-3" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => { setResults(null); setStep(0); setAnswers([]); }}>
                  Start Over
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Find My Charity</h3>
                  <p className="text-sm text-muted-foreground">Step {step + 1} of 3</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-center">{questions[step].title}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {questions[step].options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={answers[step] === opt.value ? "default" : "outline"}
                        className="h-auto py-3 text-sm"
                        onClick={() => handleSelect(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleNext} disabled={!answers[step]}>
                    {step === 2 ? "Find Matches" : "Next"} <ArrowRight className="ml-1 h-4 w-4" />
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
