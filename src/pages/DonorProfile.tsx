// partial patch focusing on new features
import { readRecommendationHistory, calculateImpactScore, buildImpactScoreTrend } from "@/lib/donorInsights";

// inside component after existing state
const [history, setHistory] = useState<any[]>([]);

useEffect(() => {
  if (!user) return;
  setHistory(readRecommendationHistory(user.id));
}, [user]);

const impact = useMemo(() => calculateImpactScore(donations, volunteers), [donations, volunteers]);
const trend = useMemo(() => buildImpactScoreTrend(donations, volunteers), [donations, volunteers]);

// inside JSX (add new sections before final card)

<Card>
  <CardHeader>
    <CardTitle className="text-lg">Impact Score</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <p className="text-3xl font-bold">{impact.score}/100</p>
      <p className="text-sm text-muted-foreground">Based on giving, consistency, and volunteering</p>
    </div>
    <div className="mt-4 text-xs text-muted-foreground">
      Donation: {impact.components.donationScore} • Consistency: {impact.components.consistencyScore} • Breadth: {impact.components.breadthScore} • Volunteering: {impact.components.volunteerScore}
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle className="text-lg">Impact Score Trend</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {trend.map((point, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{point.label}</span>
          <span className="font-medium">{point.score}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle className="text-lg">Recommendation History</CardTitle>
  </CardHeader>
  <CardContent>
    {history.length === 0 ? (
      <p className="text-sm text-muted-foreground">No recommendation history yet.</p>
    ) : (
      history.slice(0,5).map((item, i) => (
        <div key={i} className="border rounded-lg p-3 mb-2">
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">Score: {item.matchScore}%</p>
        </div>
      ))
    )}
  </CardContent>
</Card>

// rest unchanged
