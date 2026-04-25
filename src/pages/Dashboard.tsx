// imports added
import { buildCharityRecommendations } from "@/lib/charityRecommendations";
import RecommendedCampaigns from "@/components/donor/RecommendedCampaigns";

// inside component (after completedDonations useMemo)
const recommendations = useMemo(() => {
  if (!charities || charities.length === 0) return [];

  return buildCharityRecommendations(charities, {
    cause: "", // fallback if preferences not loaded
    helpMethod: "",
    location: "",
    urgency: "any",
  });
}, [charities]);

// inside JSX (AFTER ImpactTimeline)
<RecommendedCampaigns
  recommendations={recommendations}
  onOpenMatcher={() => setShowMatcher(true)}
/>

// rest unchanged
