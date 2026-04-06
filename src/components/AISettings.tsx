import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AISettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "grok_api_key")
        .maybeSingle();
      if (data?.value) {
        setSavedKey(data.value);
        setApiKey(data.value);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({ title: "Please enter an API key", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("app_settings")
        .select("id")
        .eq("key", "grok_api_key")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("app_settings")
          .update({ value: apiKey.trim() })
          .eq("key", "grok_api_key");
      } else {
        await supabase
          .from("app_settings")
          .insert({ key: "grok_api_key", value: apiKey.trim() });
      }

      setSavedKey(apiKey.trim());
      toast({ title: "AI settings saved! ✅" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await supabase.from("app_settings").delete().eq("key", "grok_api_key");
      setSavedKey(null);
      setApiKey("");
      toast({ title: "API key removed" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isConnected = !!savedKey;
  const maskedKey = savedKey ? `${savedKey.slice(0, 8)}${"•".repeat(20)}${savedKey.slice(-4)}` : "";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5" /> AI Settings
          {isConnected ? (
            <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" /> AI Connected ✅
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-auto">
              <XCircle className="mr-1 h-3 w-3" /> AI Not Connected ❌
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Current API Key</Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
                  {showKey ? savedKey : maskedKey}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Grok API key is configured. AI features are active across the platform.
              You can also use Lovable Cloud's built-in AI which works without any API key.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setSavedKey(null); }}>
                Update Key
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemove} disabled={saving}>
                Remove Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To enable Grok-powered AI features, enter your xAI API key below.
              Without it, the platform uses Lovable Cloud's built-in AI models.
            </p>
            <div className="space-y-2">
              <Label htmlFor="grok-key">Grok API Key</Label>
              <Input
                id="grok-key"
                type={showKey ? "text" : "password"}
                placeholder="xai-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Save & Enable AI
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
