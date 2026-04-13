import { useState } from "react";
import { Coins, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getImpactMessage } from "@/hooks/use-charities";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { startStripeCheckout } from "@/lib/payments";

interface QuickDonateProps {
  charityId: string;
  charityName: string;
  compact?: boolean;
}

const MICRO_AMOUNTS = [1, 3, 5];

export default function QuickDonate({ charityId, charityName, compact = false }: QuickDonateProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donatingAmount, setDonatingAmount] = useState<number | null>(null);
  const [studentAmount, setStudentAmount] = useState("");
  const [showStudentInput, setShowStudentInput] = useState(false);
  const [impactMsg, setImpactMsg] = useState<string | null>(null);

  const handleQuickDonate = async (amount: number, type: "micro" | "student") => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to donate.", variant: "destructive" });
      return;
    }

    setDonatingAmount(amount);
    try {
      await startStripeCheckout({
        charityId,
        charityName,
        amount,
      });
      const msg = getImpactMessage(amount);
      setImpactMsg(msg);
    } catch {
      toast({ title: "Checkout failed", description: "We could not start Stripe Checkout.", variant: "destructive" });
    } finally {
      setDonatingAmount(null);
    }
  };

  const handleStudentDonate = () => {
    const val = parseFloat(studentAmount);
    if (isNaN(val) || val < 0.5 || val > 10) {
      toast({ title: "Invalid amount", description: "Please enter between $0.50 and $10.", variant: "destructive" });
      return;
    }
    handleQuickDonate(val, "student");
    setStudentAmount("");
    setShowStudentInput(false);
  };

  return (
    <div className={`space-y-2 ${compact ? "" : "mt-4"}`}>
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className="gap-1 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary border-primary/20">
          <Zap className="h-3 w-3" /> Quick Donate
        </Badge>
      </div>

      <div className="flex gap-1.5">
        {MICRO_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            size="sm"
            variant="outline"
            className="h-8 flex-1 border-primary/30 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={donatingAmount !== null}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleQuickDonate(amount, "micro");
            }}
          >
            {donatingAmount === amount ? <Loader2 className="h-3 w-3 animate-spin" /> : `$${amount}`}
          </Button>
        ))}
      </div>

      {!compact && (
        <>
          {!showStudentInput ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStudentInput(true);
              }}
              className="flex w-full items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Coins className="h-3 w-3" />
              <span>Turn spare change into impact</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Input
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                placeholder="$0.50 - $10"
                value={studentAmount}
                onChange={(e) => setStudentAmount(e.target.value)}
                className="h-8 flex-1 text-xs"
              />
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleStudentDonate} disabled={donatingAmount !== null}>
                {donatingAmount !== null ? <Loader2 className="h-3 w-3 animate-spin" /> : "Give"}
              </Button>
            </div>
          )}
        </>
      )}

      {impactMsg && (
        <p className="animate-in fade-in slide-in-from-bottom-1 text-xs font-medium text-primary duration-300">
          Redirecting to secure checkout. {impactMsg}
        </p>
      )}
    </div>
  );
}
