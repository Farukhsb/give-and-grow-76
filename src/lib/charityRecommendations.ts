import type { Charity } from "@/hooks/use-charities";

export interface DonorPreferences {
  cause: string;
  helpMethod: string;
  location: string;
  urgency: string;
}

export interface CharityRecommendation {
  id: string;
  name: string;
  category: string;
  location: string;
  urgency: string;
  reason: string;
  matchScore: number;
  matchFactors: string[];
  transparencySignals: string[];
}

const normalize = (value?: string) => (value ?? "").toLowerCase().trim();

const getFundingProgress = (charity: Charity) => {
  if (!charity.goalAmount) return 0;
  return Math.min(100, Math.round((Number(charity.amountRaised) / Number(charity.goalAmount)) * 100));
};

const matchesCause = (charity: Charity, cause: string) => {
  const category = normalize(charity.category);
  const description = `${normalize(charity.name)} ${normalize(charity.description)} ${normalize(charity.longDescription)}`;
  const selectedCause = normalize(cause);

  if (!selectedCause) return false;
  if (category.includes(selectedCause) || description.includes(selectedCause)) return true;

  const synonyms: Record<string, string[]> = {
    poverty: ["food", "homeless", "housing", "relief", "poverty", "community"],
    children: ["child", "children", "youth", "school", "education"],
    health: ["health", "medical", "hospital", "care"],
    environment: ["environment", "climate", "water", "clean", "sustainability"],
    animals: ["animal", "wildlife", "pet"],
    education: ["education", "school", "learning", "student"],
  };

  return (synonyms[selectedCause] ?? []).some((term) => category.includes(term) || description.includes(term));
};

const matchesLocation = (charity: Charity, location: string) => {
  const selectedLocation = normalize(location);
  const charityLocation = normalize(charity.location);

  if (!selectedLocation || selectedLocation === "anywhere") return false;
  return charityLocation.includes(selectedLocation);
};

const getUrgencyScore = (urgency: string) => {
  const normalized = normalize(urgency);
  if (normalized === "high" || normalized === "urgent") return 20;
  if (normalized === "medium") return 10;
  return 4;
};

const getTransparencySignals = (charity: Charity) => {
  const signals: string[] = [];
  const progress = getFundingProgress(charity);

  if (charity.description) signals.push("Clear campaign description");
  if (charity.goalAmount > 0) signals.push("Funding target visible");
  if (progress > 0) signals.push("Campaign progress visible");
  if (charity.donors > 0) signals.push("Donor activity visible");
  if (charity.image) signals.push("Campaign profile is complete");

  return signals;
};

export function buildCharityRecommendations(
  charities: Charity[],
  preferences: DonorPreferences,
): CharityRecommendation[] {
  return charities
    .map((charity) => {
      let score = 20;
      const factors: string[] = [];

      if (matchesCause(charity, preferences.cause)) {
        score += 35;
        factors.push("cause alignment");
      }

      if (matchesLocation(charity, preferences.location)) {
        score += 15;
        factors.push("location preference");
      }

      const urgencyScore = getUrgencyScore(charity.urgency);
      score += urgencyScore;
      if (urgencyScore >= 10) factors.push("campaign urgency");

      const progress = getFundingProgress(charity);
      if (progress >= 70 && progress < 100) {
        score += 12;
        factors.push("close to target");
      } else if (progress > 0) {
        score += 6;
        factors.push("visible funding progress");
      }

      if (charity.donors > 0) {
        score += Math.min(10, charity.donors);
        factors.push("existing donor activity");
      }

      const transparencySignals = getTransparencySignals(charity);
      score += Math.min(10, transparencySignals.length * 2);

      const reasonParts = factors.length > 0
        ? factors.join(", ")
        : "general campaign relevance";

      return {
        id: charity.id,
        name: charity.name,
        category: charity.category || "General support",
        location: charity.location || "Location not specified",
        urgency: charity.urgency || "medium",
        reason: `Recommended because of ${reasonParts}. This is an explainable match based on available campaign data and your preferences.`,
        matchScore: Math.min(100, Math.round(score)),
        matchFactors: factors.length > 0 ? factors : ["general relevance"],
        transparencySignals,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}
