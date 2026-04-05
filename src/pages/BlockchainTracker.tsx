import { useState } from "react";
import { motion } from "framer-motion";
import { Link, ArrowRight, Shield, Hash, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";

// Simulated blockchain transaction data
const blockchainTransactions = [
  { hash: "0x7a3f...e9b2", from: "Donor Pool", to: "Clean Water Initiative", amount: 2500, timestamp: "2026-04-05T10:30:00Z", status: "confirmed", block: 18234521, confirmations: 142 },
  { hash: "0x9c1d...f4a8", from: "Donor Pool", to: "Education for All", amount: 1800, timestamp: "2026-04-04T15:22:00Z", status: "confirmed", block: 18234490, confirmations: 173 },
  { hash: "0x2e5b...a1c3", from: "Donor Pool", to: "Hunger Relief Network", amount: 3200, timestamp: "2026-04-03T09:15:00Z", status: "confirmed", block: 18234401, confirmations: 262 },
  { hash: "0x6f8a...d2e7", from: "Donor Pool", to: "Medical Aid Worldwide", amount: 1500, timestamp: "2026-04-02T14:45:00Z", status: "confirmed", block: 18234350, confirmations: 313 },
  { hash: "0x4b2c...g5h9", from: "Donor Pool", to: "Wildlife Conservation Fund", amount: 900, timestamp: "2026-04-01T11:10:00Z", status: "confirmed", block: 18234280, confirmations: 383 },
  { hash: "0x8d4e...k7m1", from: "Donor Pool", to: "Shelter & Hope", amount: 2100, timestamp: "2026-03-31T08:30:00Z", status: "confirmed", block: 18234200, confirmations: 463 },
];

const flowSteps = [
  { icon: DollarSign, label: "Donation Made", desc: "Donor contributes through CharityApp" },
  { icon: Hash, label: "Hash Generated", desc: "Transaction recorded on blockchain" },
  { icon: Shield, label: "Verified", desc: "Smart contract validates transfer" },
  { icon: CheckCircle, label: "Delivered", desc: "Funds reach the charity" },
];

const BlockchainTracker = () => {
  const [selectedTx, setSelectedTx] = useState<number | null>(null);

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">🔗 Blockchain Transparency</h1>
          <p className="mt-3 text-muted-foreground">Every donation is tracked on-chain for complete transparency and accountability.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">How Fund Tracking Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="text-center h-full border-none bg-accent/40 shadow-none">
                  <CardContent className="pt-6 pb-4 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="py-10">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Recent On-Chain Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockchainTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.hash}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedTx(selectedTx === i ? null : i)}
                    className="cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <div>
                          <p className="font-mono text-sm font-medium">{tx.hash}</p>
                          <p className="text-xs text-muted-foreground">{tx.to}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${tx.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px] text-green-600">
                          <CheckCircle className="h-3 w-3 mr-0.5" /> {tx.status}
                        </Badge>
                      </div>
                    </div>

                    {selectedTx === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs"
                      >
                        <div>
                          <span className="text-muted-foreground">Block:</span>
                          <span className="ml-1 font-mono">{tx.block.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confirmations:</span>
                          <span className="ml-1 font-mono">{tx.confirmations}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">From:</span>
                          <span className="ml-1">{tx.from}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <span className="ml-1">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Transactions Verified", value: "12,450+" },
              { label: "Total Tracked", value: "$2.5M+" },
              { label: "Avg Confirmation", value: "< 30s" },
            ].map((stat, i) => (
              <Card key={i} className="text-center border-none bg-accent/40 shadow-none">
                <CardContent className="pt-6 pb-4">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlockchainTracker;
