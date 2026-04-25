import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, Clock, Edit, Heart, Mail, ShieldCheck, Sparkles, Trophy, User } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  buildImpactScoreTrend,
  calculateImpactScore,
  readRecommendationHistory,
  type RecommendationHistoryItem,
} from "@/lib/donorInsights";

interface DonationRow {
  id: string;
  charity_name: string;
  amount: number;
  currency: string;
  status: string;
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

export default function DonorProfile() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setEditName(profile.display_name || "");
    setEditBio(profile.bio || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("donations")
      .select("id, charity_name, amount, currency, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setDonations((data ?? []) as DonationRow[]));

    supabase
      .from("volunteer_assignments")
      .select("id, charity_name, status, hours_logged, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setVolunteers((data ?? []) as VolunteerRow[]));

    setHistory(readRecommendationHistory(user.id));
  }, [user]);

  const completedDonations = useMemo(
    () => donations.filter((donation) => donation.status === "completed"),
    [donations]
  );

  const totalDonated = useMemo(
    () => completedDonations.reduce((sum, donation) => sum + Number(donation.amount), 0),
    [completedDonations]
  );

  const totalHours = useMemo(
    () => volunteers.reduce((sum, volunteer) => sum + Number(volunteer.hours_logged), 0),
    [volunteers]
  );

  const causesSupported = useMemo(
    () => new Set(completedDonations.map((donation) => donation.charity_name)).size,
    [completedDonations]
  );

  const impact = useMemo(() => calculateImpactScore(donations, volunteers), [donations, volunteers]);
  const trend = useMemo(() => buildImpactScoreTrend(donations, volunteers), [donations, volunteers]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: editName, bio: editBio });
      toast({ title: "Profile updated" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">Donor Profile</Badge>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {profile?.display_name || "Your Giving Profile"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your profile, giving history, volunteering activity, and trust indicators in one place.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="mx-auto mb-2 h-7 w-7 text-primary" />
              <p className="text-2xl font-bold">{formatCurrency(totalDonated, completedDonations[0]?.currency ?? "gbp")}</p>
              <p className="text-sm text-muted-foreground">Total verified giving</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ShieldCheck className="mx-auto mb-2 h-7 w-7 text-primary" />
              <p className="text-2xl font-bold">{completedDonations.length}</p>
              <p className="text-sm text-muted-foreground">Completed donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="mx-auto mb-2 h-7 w-7 text-primary" />
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-sm text-muted-foreground">Volunteer hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto mb-2 h-7 w-7 text-primary" />
              <p className="text-2xl font-bold">{profile?.points ?? 0}</p>
              <p className="text-sm text-muted-foreground">Community points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {user.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={editBio}
                  onChange={(event) => setEditBio(event.target.value)}
                  rows={5}
                  placeholder="Tell others what kind of causes you care about."
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Edit className="mr-1 h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Giving Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Causes supported</p>
                <p className="text-2xl font-bold">{causesSupported}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on charities with completed donations.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Recent verified donations</p>
                {completedDonations.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No completed donations yet. Verified donations will appear here after Stripe confirms payment.
                  </div>
                ) : (
                  completedDonations.slice(0, 4).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{donation.charity_name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" /> {new Date(donation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(Number(donation.amount), donation.currency)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-bold text-primary">{impact.score}/100</p>
                  <p className="text-sm text-muted-foreground">Based on giving, consistency, breadth, and volunteering.</p>
                </div>
                <Badge variant="secondary">Explainable score</Badge>
              </div>
              <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="rounded-md border p-3">Donation: {impact.components.donationScore}</div>
                <div className="rounded-md border p-3">Consistency: {impact.components.consistencyScore}</div>
                <div className="rounded-md border p-3">Breadth: {impact.components.breadthScore}</div>
                <div className="rounded-md border p-3">Volunteering: {impact.components.volunteerScore}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impact Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trend.map((point, index) => (
                  <div key={`${point.date}-${index}`} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <span className="text-muted-foreground">{point.label}</span>
                    <span className="font-semibold text-primary">{point.score}/100</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> Recommendation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No recommendation history yet. Use the charity matcher from your dashboard to generate personalised recommendations.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {history.slice(0, 6).map((item, index) => (
                  <div key={`${item.id}-${item.generatedAt}-${index}`} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="secondary" className="mb-2 text-xs">{item.category}</Badge>
                        <p className="font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Generated {new Date(item.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {item.matchScore}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.matchFactors.slice(0, 3).map((factor) => (
                        <Badge key={factor} variant="outline" className="text-xs">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trust and Transparency Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="font-medium">Verified totals</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Giving totals count completed donations only, not pending checkout sessions.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Private by default</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Profile data is shown to the signed-in donor and protected by existing backend access rules.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Explainable support</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Recommendations and impact summaries are designed to explain the reasoning behind donor support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
