import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, Clock, LogOut, Edit,
  DollarSign, HandHeart, Trophy, ChevronRight, Users, Plus, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import ImpactSummary from "@/components/ImpactSummary";
import ImpactTimeline from "@/components/donor/ImpactTimeline";
import CharityMatcher from "@/components/CharityMatcher";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCharities } from "@/hooks/use-charities";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DonationRow {
  id: string;
  charity_name: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url: string | null;
  created_at: string;
}

interface VolunteerRow {
  id: string;
  charity_name: string;
  status: string;
  hours_logged: number;
  created_at: string;
}

const formatCurrency = (amount: number, currency = "gbp") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

const getStatusVariant = (status: string) => {
  if (status === "completed") return "default";
  if (status === "pending") return "secondary";
  return "outline";
};

const Dashboard = () => {
  const { user, profile, isAdmin, loading, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const { charities } = useCharities();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [showMatcher, setShowMatcher] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  const completedDonations = useMemo(
    () => donations.filter((donation) => donation.status === "completed"),
    [donations]
  );

  const totalDonated = useMemo(
    () => completedDonations.reduce((sum, donation) => sum + Number(donation.amount), 0),
    [completedDonations]
  );

  useEffect(() => {
    if (!user) return;

    setDonationError(null);

    supabase
      .from("donations")
      .select("id, charity_name, amount, currency, status, receipt_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Could not load donor donations", error);
          setDonationError("We could not load your donation history. Please refresh or try again shortly.");
          return;
        }

        setDonations((data ?? []) as DonationRow[]);
      });

    supabase
      .from("volunteer_assignments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setVolunteers(data as VolunteerRow[]);
          setTotalHours(data.reduce((sum, v) => sum + Number(v.hours_logged), 0));
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

  const handleVolunteer = async (charity: { id: string; name: string }) => {
    const existing = volunteers.find(v => v.charity_name === charity.name && v.status === "active");
    if (existing) {
      toast({ title: "Already volunteering", description: `You're already assigned to ${charity.name}.` });
      return;
    }
    await supabase.from("volunteer_assignments").insert({
      user_id: user.id,
      charity_id: charity.id,
      charity_name: charity.name,
      status: "active",
      hours_logged: 0,
    });
    const { data } = await supabase.from("volunteer_assignments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setVolunteers(data as VolunteerRow[]);
      setTotalHours(data.reduce((sum, v) => sum + Number(v.hours_logged), 0));
    }
    toast({ title: "Volunteering started! 🙌", description: `You've joined ${charity.name}.` });
  };

  const handleLogHours = async (id: string, currentHours: number) => {
    const hours = prompt("How many hours did you volunteer?", "1");
    if (!hours || isNaN(Number(hours))) return;
    await supabase.from("volunteer_assignments").update({ hours_logged: currentHours + Number(hours) }).eq("id", id);
    const { data } = await supabase.from("volunteer_assignments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setVolunteers(data as VolunteerRow[]);
      setTotalHours(data.reduce((sum, v) => sum + Number(v.hours_logged), 0));
    }
    toast({ title: "Hours logged! ⏰" });
  };

  const statCards = [
    { icon: DollarSign, label: "Total Donated", value: formatCurrency(totalDonated, completedDonations[0]?.currency ?? "gbp"), color: "text-primary" },
    { icon: CheckCircle2, label: "Completed Donations", value: completedDonations.length.toString(), color: "text-secondary" },
    { icon: Clock, label: "Volunteer Hours", value: totalHours.toString(), color: "text-primary" },
    { icon: Trophy, label: "Points Earned", value: (profile?.points ?? 0).toString(), color: "text-secondary" },
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Welcome, {profile?.display_name || "Friend"}!
            </h1>
            <p className="text-muted-foreground">Your giving journey, verified donations, and next opportunities in one place.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowMatcher(true)}>
              <Heart className="h-4 w-4 mr-1" /> Find My Charity
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </motion.div>

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
                    <Input value={isAdmin ? "admin" : profile?.role ?? "donor"} disabled className="bg-muted" />
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

        <ImpactSummary donations={completedDonations} displayName={profile?.display_name || "Friend"} />

        <ImpactTimeline donations={donations} />

        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donations">Donation History</TabsTrigger>
            <TabsTrigger value="volunteering">Volunteering</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Donations</CardTitle></CardHeader>
              <CardContent>
                {donationError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {donationError}
                  </div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HandHeart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You have not made a verified donation yet.</p>
                    <p className="mt-2 text-sm">Explore campaigns to start your giving journey.</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link to="/charities">Browse Charities <ChevronRight className="h-4 w-4 ml-1" /></Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((d) => (
                      <div key={d.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{d.charity_name}</p>
                          <p className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                          {d.status === "pending" && (
                            <p className="mt-1 text-xs text-muted-foreground">Pending donations are not counted until Stripe confirms payment.</p>
                          )}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-primary">{formatCurrency(Number(d.amount), d.currency)}</p>
                          <div className="mt-1 flex items-center gap-2 sm:justify-end">
                            <Badge variant={getStatusVariant(d.status)}>{d.status}</Badge>
                            {d.receipt_url && d.status === "completed" && (
                              <a className="text-xs text-primary underline" href={d.receipt_url} target="_blank" rel="noreferrer">
                                Receipt
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteering">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Volunteer Assignments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {volunteers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No volunteer assignments yet.</p>
                    <p className="text-sm mt-2">Sign up for a charity below:</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {charities.slice(0, 4).map(c => (
                        <Button key={c.id} variant="outline" size="sm" onClick={() => handleVolunteer(c)}>
                          <Plus className="h-3 w-3 mr-1" /> {c.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {volunteers.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{v.charity_name}</p>
                          <p className="text-sm text-muted-foreground">Since {new Date(v.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-primary">{Number(v.hours_logged)}h</p>
                            <Badge variant={v.status === "active" ? "default" : "secondary"}>{v.status}</Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleLogHours(v.id, Number(v.hours_logged))}>
                            <Clock className="h-3 w-3 mr-1" /> Log Hours
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Join more charities:</p>
                      <div className="flex flex-wrap gap-2">
                        {charities.slice(0, 4).map(c => (
                          <Button key={c.id} variant="ghost" size="sm" onClick={() => handleVolunteer(c)}>
                            <Plus className="h-3 w-3 mr-1" /> {c.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader><CardTitle className="text-lg">Your Achievements</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "First Donation", icon: "🎉", unlocked: donations.length > 0 },
                    { name: "Generous Giver", icon: "💎", unlocked: totalDonated >= 100 },
                    { name: "Super Donor", icon: "🌟", unlocked: totalDonated >= 500 },
                    { name: "Champion", icon: "🏆", unlocked: totalDonated >= 1000 },
                    { name: "5 Donations", icon: "🔥", unlocked: donations.length >= 5 },
                    { name: "Volunteer", icon: "🤝", unlocked: volunteers.length > 0 },
                    { name: "10 Hours", icon: "⏰", unlocked: totalHours >= 10 },
                    { name: "Early Adopter", icon: "🚀", unlocked: true },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className={`rounded-xl border p-4 text-center transition-all ${
                        badge.unlocked ? "bg-accent border-primary/20" : "opacity-40 grayscale"
                      }`}
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      <p className="mt-2 text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.unlocked ? "Unlocked!" : "Locked"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {showMatcher && <CharityMatcher onClose={() => setShowMatcher(false)} />}
    </Layout>
  );
};

export default Dashboard;
