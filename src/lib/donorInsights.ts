import { supabase } from "@/integrations/supabase/client";
import type { CharityRecommendation } from "@/lib/charityRecommendations";

export interface DonationInsightRow {
  id: string;
  charity_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface VolunteerInsightRow {
  id: string;
  charity_name: string;
  status: string;
  hours_logged: number;
  created_at: string;
}

export interface RecommendationHistoryItem {
  id: string;
  name: string;
  category: string;
  matchScore: number;
  reason: string;
  matchFactors: string[];
  generatedAt: string;
}

export interface DbRecommendationHistoryRow {
  id: string;
  donor_id: string;
  campaign_id: string;
  campaign_name: string;
  category: string | null;
  match_score: number;
  reason: string;
  match_factors: string[];
  generated_at: string;
  created_at: string;
}

const HISTORY_KEY = "give-grow-recommendation-history";
const getStorageKey = (userId: string) => `${HISTORY_KEY}:${userId}`;

export function readRecommendationHistory(userId: string): RecommendationHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendRecommendationHistory(
  userId: string,
  recommendations: CharityRecommendation[],
): RecommendationHistoryItem[] {
  if (typeof window === "undefined" || recommendations.length === 0) return [];

  const existing = readRecommendationHistory(userId);
  const generatedAt = new Date().toISOString();
  const nextItems: RecommendationHistoryItem[] = recommendations.slice(0, 3).map((recommendation) => ({
    id: recommendation.id,
    name: recommendation.name,
    category: recommendation.category,
    matchScore: recommendation.matchScore,
    reason: recommendation.reason,
    matchFactors: recommendation.matchFactors,
    generatedAt,
  }));

  const deduped = [...nextItems, ...existing]
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id && candidate.generatedAt === item.generatedAt) === index)
    .slice(0, 12);

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(deduped));
  return deduped;
}

export async function fetchRecommendationHistory(userId: string): Promise<RecommendationHistoryItem[]> {
  const { data, error } = await supabase
    .from("donor_recommendation_history")
    .select("id, campaign_id, campaign_name, category, match_score, reason, match_factors, generated_at, created_at")
    .eq("donor_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.warn("Could not load database recommendation history", error);
    return readRecommendationHistory(userId);
  }

  return ((data ?? []) as DbRecommendationHistoryRow[]).map((row) => ({
    id: row.campaign_id,
    name: row.campaign_name,
    category: row.category ?? "General",
    matchScore: row.match_score,
    reason: row.reason,
    matchFactors: row.match_factors ?? [],
    generatedAt: row.generated_at ?? row.created_at,
  }));
}

export async function saveRecommendationHistory(userId: string, recommendations: CharityRecommendation[]) {
  if (!recommendations.length) return;

  appendRecommendationHistory(userId, recommendations);

  const rows = recommendations.slice(0, 3).map((recommendation) => ({
    donor_id: userId,
    campaign_id: recommendation.id,
    campaign_name: recommendation.name,
    category: recommendation.category,
    match_score: recommendation.matchScore,
    reason: recommendation.reason,
    match_factors: recommendation.matchFactors,
  }));

  const { error } = await supabase.from("donor_recommendation_history").insert(rows);
  if (error) {
    console.warn("Could not save database recommendation history", error);
  }
}

export function calculateImpactScore(
  donations: DonationInsightRow[],
  volunteers: VolunteerInsightRow[],
) {
  const completedDonations = donations.filter((donation) => donation.status === "completed");
  const totalDonated = completedDonations.reduce((sum, donation) => sum + Number(donation.amount), 0);
  const donationCount = completedDonations.length;
  const supportedCharities = new Set(completedDonations.map((donation) => donation.charity_name)).size;
  const volunteerHours = volunteers.reduce((sum, volunteer) => sum + Number(volunteer.hours_logged), 0);

  const donationScore = Math.min(45, totalDonated / 2);
  const consistencyScore = Math.min(20, donationCount * 4);
  const breadthScore = Math.min(15, supportedCharities * 5);
  const volunteerScore = Math.min(20, volunteerHours * 2);
  const score = Math.round(donationScore + consistencyScore + breadthScore + volunteerScore);

  return {
    score: Math.min(100, score),
    totalDonated,
    donationCount,
    supportedCharities,
    volunteerHours,
    components: {
      donationScore: Math.round(donationScore),
      consistencyScore: Math.round(consistencyScore),
      breadthScore: Math.round(breadthScore),
      volunteerScore: Math.round(volunteerScore),
    },
  };
}

export function buildImpactScoreTrend(
  donations: DonationInsightRow[],
  volunteers: VolunteerInsightRow[],
) {
  const completedDonations = donations
    .filter((donation) => donation.status === "completed")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let runningTotal = 0;
  const points = completedDonations.map((donation, index) => {
    runningTotal += Number(donation.amount);
    const partialDonations = completedDonations.slice(0, index + 1);
    const score = calculateImpactScore(partialDonations, volunteers).score;

    return {
      date: donation.created_at,
      label: new Date(donation.created_at).toLocaleDateString(),
      score,
      totalDonated: runningTotal,
    };
  });

  if (points.length === 0) {
    return [
      {
        date: new Date().toISOString(),
        label: "Start",
        score: calculateImpactScore([], volunteers).score,
        totalDonated: 0,
      },
    ];
  }

  return points.slice(-6);
}
