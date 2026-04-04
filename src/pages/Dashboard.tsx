import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, Award, Clock, TrendingUp, LogOut, Edit, User,
  DollarSign, HandHeart, Trophy, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DonationRow {
  id: string;
  charity_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("donations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setDonations(data as DonationRow[]);
          setTotalDonated(data.reduce((sum, d) => sum + Number(d.amount), 0));
        }
      });
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.display_name || "");
      setEditBio(profile.bio || "");
    }
  }, [profile]);

  if (loading) return <Layout><div className="flex h-[60vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: editName, bio: editBio });
    setEditing(false);
    toast({ title: "Profile updated!" });
  };

  const statCards = [
    { icon: DollarSign, label: "Total Donated", value: `$${totalDonated.toFixed(2)}`, color: "text-primary" },
    { icon: Heart, label: "Donations Made", value: donations.length.toString(), color: "text-secondary" },
    { icon: Trophy, label: "Points Earned", value: (profile?.points ?? 0).toString(), color: "text-yellow-500" },
    { icon: Award, label: "Badges", value: (profile?.badges?.length ?? 0).toString(), color: "text-purple-500" },
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Welcome, {profile?.display_name || "Friend"}!
            </h1>
            <p className="text-muted-foreground">Your giving journey at a glance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Edit Profile */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={profile?.role ?? "donor"} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} style={{ transitionDelay: `${i * 0.1}s` }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HandHeart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No donations yet.</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link to="/charities">Browse Charities <ChevronRight className="h-4 w-4 ml-1" /></Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{d.charity_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${Number(d.amount).toFixed(2)}</p>
                          <Badge variant={d.status === "completed" ? "default" : "secondary"}>
                            {d.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "First Donation", icon: "🎉", unlocked: donations.length > 0 },
                    { name: "Generous Giver", icon: "💎", unlocked: totalDonated >= 100 },
                    { name: "Super Donor", icon: "🌟", unlocked: totalDonated >= 500 },
                    { name: "Champion", icon: "🏆", unlocked: totalDonated >= 1000 },
                    { name: "5 Donations", icon: "🔥", unlocked: donations.length >= 5 },
                    { name: "10 Donations", icon: "⭐", unlocked: donations.length >= 10 },
                    { name: "Early Adopter", icon: "🚀", unlocked: true },
                    { name: "Community Hero", icon: "🦸", unlocked: false },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className={`rounded-xl border p-4 text-center transition-all ${
                        badge.unlocked ? "bg-accent border-primary/20" : "opacity-40 grayscale"
                      }`}
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      <p className="mt-2 text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.unlocked ? "Unlocked!" : "Locked"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
