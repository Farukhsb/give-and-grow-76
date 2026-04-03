import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useCharities } from "@/hooks/use-charities";

const Charities = () => {
  const { charities, loading } = useCharities();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [urgency, setUrgency] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(charities.map((c) => c.category).filter(Boolean)))],
    [charities]
  );
  const urgencies = ["All", "high", "medium", "low"];

  const filtered = useMemo(() => {
    return charities.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || c.category === category;
      const matchUrg = urgency === "All" || c.urgency === urgency;
      return matchSearch && matchCat && matchUrg;
    });
  }, [charities, search, category, urgency]);

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Browse Charities</h1>
          <p className="mt-3 text-muted-foreground">Find a cause you care about and make a real difference.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button key={cat} size="sm" variant={category === cat ? "default" : "outline"} onClick={() => setCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {urgencies.map((u) => (
                <Button key={u} size="sm" variant={urgency === u ? "secondary" : "ghost"} onClick={() => setUrgency(u)} className="capitalize">
                  {u === "All" ? "All Urgency" : u}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Loading charities...</div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((charity) => (
                  <Link key={charity.id} to={`/charities/${charity.id}`}>
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={charity.image} alt={charity.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{charity.category}</Badge>
                          <Badge variant={charity.urgency === "high" ? "destructive" : "outline"} className="text-xs capitalize">{charity.urgency}</Badge>
                        </div>
                        <h3 className="font-serif text-xl font-semibold">{charity.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{charity.location}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{charity.description}</p>
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-medium">£{charity.amountRaised.toLocaleString()}</span>
                            <span className="text-muted-foreground">of £{charity.goalAmount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${(charity.amountRaised / charity.goalAmount) * 100}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{charity.donors.toLocaleString()} donors</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  <Filter className="mx-auto mb-3 h-10 w-10" />
                  <p>No charities match your filters. Try broadening your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Charities;
