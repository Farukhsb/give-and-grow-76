import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState("feedback");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await (supabase.from("feedback" as any) as any).insert({
        user_id: user?.id || null,
        type,
        title: title.trim(),
        content: content.trim(),
        rating,
        email: user?.email || null,
      });
      toast({ title: "Thank you! 🎉", description: "Your submission has been received." });
      setTitle("");
      setContent("");
      setRating(5);
    } catch {
      toast({ title: "Submission failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Share Your Story</h1>
          <p className="mt-3 text-muted-foreground">Submit feedback, share your impact story, or suggest improvements.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Submit Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">General Feedback</SelectItem>
                      <SelectItem value="story">Impact Story</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your submission a title" required maxLength={200} />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={type === "story" ? "Share your impact story..." : "Tell us what you think..."} rows={6} required maxLength={5000} />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="transition-colors">
                        <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={submitting}>
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Feedback;
