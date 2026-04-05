import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

interface LeaderEntry {
  display_name: string;
  avatar_url: string | null;
  total_donated: number;
  donation_count: number;
}

const rankIcons = [
  <Trophy className="h-6 w-6 text-yellow-500" />,
  <Medal className="h-6 w-6 text-gray-400" />,
  <Award className="h-6 w-6 text-amber-600" />,
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      // Get all donations with user profiles
      const { data: donations } = await supabase
        .from("donations")
        .select("user_id, amount")
        .eq("status", "completed");

      if (!donations || donations.length === 0) {
        setLoading(false);
        return;
      }

      // Aggregate by user
      const userMap = new Map<string, { total: number; count: number }>();
      for (const d of donations) {
        if (!d.user_id) continue;
        const existing = userMap.get(d.user_id) || { total: 0, count: 0 };
        existing.total += Number(d.amount);
        existing.count += 1;
        userMap.set(d.user_id, existing);
      }

      // Get profiles for top users
      const userIds = Array.from(userMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const leaderList: LeaderEntry[] = [];
      for (const [userId, stats] of userMap) {
        const profile = profiles?.find(p => p.user_id === userId);
        leaderList.push({
          display_name: profile?.display_name || "Anonymous Donor",
          avatar_url: profile?.avatar_url,
          total_donated: stats.total,
          donation_count: stats.count,
        });
      }

      leaderList.sort((a, b) => b.total_donated - a.total_donated);
      setLeaders(leaderList.slice(0, 20));
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">🏆 Donor Leaderboard</h1>
          <p className="mt-3 text-muted-foreground">Celebrating our most generous community members.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : leaders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No donations yet. Be the first to donate and top the leaderboard!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaders.map((leader, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`transition-shadow hover:shadow-md ${i < 3 ? "border-primary/30 bg-accent/30" : ""}`}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-lg">
                        {i < 3 ? rankIcons[i] : <span className="text-muted-foreground">#{i + 1}</span>}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {leader.avatar_url ? (
                          <img src={leader.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {leader.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{leader.display_name}</p>
                        <p className="text-sm text-muted-foreground">{leader.donation_count} donation{leader.donation_count !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">${leader.total_donated.toFixed(0)}</p>
                        {i < 3 && <Badge variant="secondary" className="text-[10px]">{["Gold", "Silver", "Bronze"][i]}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Leaderboard;
