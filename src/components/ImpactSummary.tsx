import { useState } from "react";
import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  donations: { charity_name: string; amount: number; created_at: string }[];
  displayName: string;
}

export default function ImpactSummary({ donations, displayName }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const totalDonated = donations.reduce((s, d) => s + Number(d.amount), 0);
      const charities = [...new Set(donations.map((d) => d.charity_name))];

      const { data, error } = await supabase.functions.invoke("ai-impact-summary", {
        body: { displayName, totalDonated, charities, donationCount: donations.length },
      });
      if (error) throw error;
      setSummary(data.summary);
      setGeneratedAt(new Date());
    } catch {
      const totalDonated = donations.reduce((s, d) => s + Number(d.amount), 0);
      const charities = [...new Set(donations.map((d) => d.charity_name))];
      setSummary(
        `Since joining Give & Grow, ${displayName || "you"}'ve supported ${charities.length} ${charities.length === 1 ? "charity" : "charities"}, contributing a total of $${totalDonated.toFixed(2)}. Your generosity is making a real difference in the world. Keep it up!`
      );
      setGeneratedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 bg-accent/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" /> My Impact Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground italic">"{summary}"</p>
            {generatedAt && (
              <p className="text-xs text-muted-foreground">Generated {generatedAt.toLocaleString()}</p>
            )}
            <Button variant="outline" size="sm" onClick={generateSummary} disabled={loading}>
              {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
              Regenerate Summary
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {donations.length > 0
                ? "Generate a personalised summary of your giving impact."
                : "Make your first donation to unlock your impact summary!"}
            </p>
            <Button onClick={generateSummary} disabled={loading || donations.length === 0} size="sm">
              {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
              Generate Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
