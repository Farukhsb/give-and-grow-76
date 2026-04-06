import { useRef } from "react";
import { X, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReceiptData {
  donorName: string;
  charityName: string;
  amount: number;
  date: Date;
  transactionId: string;
}

export default function DonationReceipt({ receipt, onClose }: { receipt: ReceiptData; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const content = `
DONATION RECEIPT
=====================================

Give & Grow - Official Receipt

Transaction Reference: ${receipt.transactionId}
Date: ${receipt.date.toLocaleString()}

Donor: ${receipt.donorName}
Charity: ${receipt.charityName}
Amount: $${receipt.amount.toFixed(2)}

Status: Completed ✓

-------------------------------------
Thank you for your generous donation!
Your contribution is making a real
difference in the world.

This receipt may be used for tax
deduction purposes.

Give & Grow © ${new Date().getFullYear()}
=====================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.transactionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="font-serif text-xl font-bold">Donation Successful!</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={receiptRef} className="mt-4 space-y-4 rounded-lg border bg-card p-4">
            <div className="text-center">
              <p className="font-serif text-lg font-bold text-primary">Give & Grow</p>
              <p className="text-xs text-muted-foreground">Official Donation Receipt</p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Ref</span>
                <span className="font-mono text-xs">{receipt.transactionId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span>{receipt.date.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Donor</span>
                <span className="font-medium">{receipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Charity</span>
                <span className="font-medium">{receipt.charityName}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-base">
                <span className="font-semibold">Amount</span>
                <span className="font-bold text-primary">${receipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <p className="text-center text-xs text-muted-foreground">
              Thank you for your generous donation! 💚<br />
              This receipt may be used for tax deduction purposes.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="flex-1 gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download Receipt
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
