import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { charities, stories } from "@/data/demo";

const CharityDetail = () => {
  const { id } = useParams();
  const charity = charities.find((c) => c.id === id);

  if (!charity) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-2xl font-bold">Charity not found</h1>
          <Button asChild className="mt-4"><Link to="/charities">Back to Charities</Link></Button>
        </div>
      </Layout>
    );
  }

  const relatedStories = stories.filter((s) => s.charityId === charity.id);
  const progress = (charity.raised / charity.goal) * 100;

  return (
    <Layout>
      <div className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/charities"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Charities</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg">
              <img src={charity.image} alt={charity.name} className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{charity.category}</Badge>
                <Badge variant={charity.urgency === "high" ? "destructive" : "outline"} className="capitalize">{charity.urgency} urgency</Badge>
              </div>
              <h1 className="mt-4 font-serif text-3xl font-bold md:text-4xl">{charity.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{charity.location}</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">{charity.longDescription}</p>
            </div>

            {relatedStories.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif text-2xl font-bold">Related Stories</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {relatedStories.map((story) => (
                    <Link key={story.id} to={`/stories/${story.id}`}>
                      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={story.image} alt={story.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-serif font-semibold">{story.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{story.excerpt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold">Donate to {charity.name}</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">${charity.raised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${charity.goal.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" />{charity.donors.toLocaleString()} donors</p>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button key={amount} variant="outline" size="sm">${amount}</Button>
                  ))}
                </div>
                <Button className="mt-4 w-full gap-2" size="lg">
                  <Heart className="h-4 w-4" /> Donate Now
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">Secure payment · Tax deductible · 95% goes to charity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CharityDetail;
