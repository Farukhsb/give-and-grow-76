import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { stories } from "@/data/demo";

const categories = ["All", ...Array.from(new Set(stories.map((s) => s.category)))];

const Stories = () => {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return category === "All" ? stories : stories.filter((s) => s.category === category);
  }, [category]);

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Impact Stories</h1>
          <p className="mt-3 text-muted-foreground">Real stories of how your donations are changing lives.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat} size="sm" variant={category === cat ? "default" : "outline"} onClick={() => setCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((story) => (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={story.image} alt={story.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{story.category}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(story.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold leading-snug">{story.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{story.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Stories;
