import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Users, DollarSign, TrendingUp, Activity, ArrowUpRight,
  Heart, Globe, Shield, MessageSquare, Clock, Settings2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AISettings from "@/components/AISettings";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const CHART_COLORS = [
  "hsl(152, 45%, 38%)",
  "hsl(30, 80%, 55%)",
  "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(45, 80%, 50%)",
];

interface DonationRow {
  id: string;
  charity_name: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string | null;
}

interface FeedbackRow {
  id: string;
  type: string;
  title: string;
  content: string;
  rating: number;
  email: string | null;
  created_at: string;
}

interface VolunteerRow {
  id: string;
  charity_name: string;
  hours_logged: number;
  status: string;
  user_id: string;
}

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [profileCount, setProfileCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    const fetchData = async () => {
      const [donRes, profRes, volRes] = await Promise.all([
        supabase.from("donations").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("volunteer_assignments").select("*"),
      ]);
      setDonations((donRes.data as DonationRow[]) || []);
      setProfileCount(profRes.count || 0);
      setVolunteers((volRes.data as VolunteerRow[]) || []);

      // Fetch feedback
      const { data: fbData } = await (supabase.from("feedback" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setFeedback((fbData as FeedbackRow[]) || []);

      setLoadingData(false);
    };
    fetchData();
  }, [user, profile]);

  if (loading) return <Layout><div className="flex h-[60vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.role !== "admin") return <Layout><div className="container py-20 text-center"><Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h1 className="font-serif text-2xl font-bold">Access Denied</h1><p className="text-muted-foreground mt-2">Admin access required.</p></div></Layout>;

  const totalRevenue = donations.reduce((s, d) => s + Number(d.amount), 0);
  const completedDonations = donations.filter((d) => d.status === "completed").length;
  const totalVolunteerHours = volunteers.reduce((s, v) => s + Number(v.hours_logged), 0);

  const monthlyData = donations.reduce((acc, d) => {
    const month = new Date(d.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const existing = acc.find((a) => a.month === month);
    if (existing) { existing.amount += Number(d.amount); existing.count += 1; }
    else acc.push({ month, amount: Number(d.amount), count: 1 });
    return acc;
  }, [] as { month: string; amount: number; count: number }[]);

  const byCharity = donations.reduce((acc, d) => {
    const existing = acc.find((a) => a.name === d.charity_name);
    if (existing) existing.value += Number(d.amount);
    else acc.push({ name: d.charity_name, value: Number(d.amount) });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 6);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, change: "+12%" },
    { label: "Total Donations", value: completedDonations.toString(), icon: Heart, change: "+8%" },
    { label: "Active Users", value: profileCount.toString(), icon: Users, change: "+15%" },
    { label: "Volunteer Hours", value: totalVolunteerHours.toString(), icon: Clock, change: "+20%" },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform performance and analytics</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs text-primary">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />{stat.change}
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="ai-settings"><Settings2 className="h-3 w-3 mr-1" /> AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Monthly Revenue</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="amount" fill="hsl(152, 45%, 38%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center py-12 text-muted-foreground">No data yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">By Charity</CardTitle></CardHeader>
              <CardContent>
                {byCharity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={byCharity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {byCharity.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center py-12 text-muted-foreground">No data yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader><CardTitle className="text-lg">Donation Trend</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="amount" stroke="hsl(152, 45%, 38%)" strokeWidth={2} name="Amount ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="count" stroke="hsl(30, 80%, 55%)" strokeWidth={2} name="Count" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-center py-12 text-muted-foreground">No data yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> User Feedback & Stories</CardTitle></CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No feedback submitted yet</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {feedback.map((f) => (
                      <div key={f.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs capitalize">{f.type}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-sm ${s <= f.rating ? "text-yellow-400" : "text-muted"}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="font-medium text-sm">{f.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{f.content}</p>
                        {f.email && <p className="text-xs text-muted-foreground mt-2">From: {f.email}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Donations</CardTitle></CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No donations yet</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {donations.slice(0, 20).map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-sm">{d.charity_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${Number(d.amount).toFixed(2)}</p>
                          <Badge variant={d.status === "completed" ? "default" : "secondary"} className="text-[10px]">{d.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-settings">
            <AISettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
