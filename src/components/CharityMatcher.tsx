// simplified explanation: upgraded logic using recommendation engine
import { buildCharityRecommendations } from "@/lib/charityRecommendations";
import { useCharities } from "@/hooks/use-charities";

// inside component
const { charities } = useCharities();

const handleNext = async () => {
  if (step < 2) {
    setStep(step + 1);
    return;
  }

  setLoading(true);

  try {
    // 1. Save donor preferences
    await supabase.from("donor_preferences").upsert({
      donor_id: (await supabase.auth.getUser()).data.user?.id,
      cause: answers[0],
      help_method: answers[1],
      location: answers[2],
    });

    // 2. Try AI first
    const { data } = await supabase.functions.invoke("ai-charity-matcher", {
      body: { cause: answers[0], helpMethod: answers[1], location: answers[2] },
    });

    if (data?.recommendations?.length) {
      setResults(data.recommendations);
    } else {
      // 3. fallback to deterministic engine
      const fallback = buildCharityRecommendations(charities, {
        cause: answers[0],
        helpMethod: answers[1],
        location: answers[2],
        urgency: "any",
      });

      setResults(fallback);
    }
  } catch {
    // safe fallback
    const fallback = buildCharityRecommendations(charities, {
      cause: answers[0],
      helpMethod: answers[1],
      location: answers[2],
      urgency: "any",
    });

    setResults(fallback);
  } finally {
    setLoading(false);
  }
};
