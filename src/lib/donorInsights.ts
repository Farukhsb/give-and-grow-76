// updated to support DB-backed history
import { supabase } from "@/integrations/supabase/client";

export async function fetchRecommendationHistory(userId: string) {
  const { data } = await supabase
    .from("donor_recommendation_history")
    .select("*")
    .eq("donor_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function saveRecommendationHistory(userId: string, recommendations: any[]) {
  if (!recommendations.length) return;

  const rows = recommendations.slice(0, 3).map((r) => ({
    donor_id: userId,
    campaign_id: r.id,
    campaign_name: r.name,
    category: r.category,
    match_score: r.matchScore,
    reason: r.reason,
    match_factors: r.matchFactors,
  }));

  await supabase.from("donor_recommendation_history").insert(rows);
}
