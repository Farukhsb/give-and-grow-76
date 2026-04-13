import { CheckCircle2, Settings2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AISettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5" /> AI Settings
          <Badge className="ml-auto border-primary/20 bg-primary/10 text-primary">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Built-in AI Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/15 bg-accent/30 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="font-medium">This app now uses built-in AI.</p>
              <p className="text-sm text-muted-foreground">
                Chat, recommendations, charity matching, and impact summaries run through protected backend functions. Provider credentials stay on the server and are not exposed to the client.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
