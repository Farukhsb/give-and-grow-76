import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { stories, charities } from "@/data/demo";

const StoryDetail = () => {
  const { id } = useParams();
  const story = stories.find((s) => s.id === id);

  if (!story) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-serif text-2xl font-bold">Story not found</h1>
          <Button asChild className="mt-4"><Link to="/stories">Back to Stories</Link></Button>
        </div>
      </Layout>
    );
  }

  const charity = charities.find((c) => c.id === story.charityId);

  return (
    <Layout>
      <article className="container py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/stories"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Stories</Link>
        </Button>

        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-lg">
            <img src={story.image} alt={story.title} className="aspect-[16/9] w-full object-cover" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Badge variant="secondary">{story.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(story.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl">{story.title}</h1>

          {charity && (
            <Link to={`/charities/${charity.id}`} className="mt-3 inline-block text-sm text-primary hover:underline">
              By {charity.name}
            </Link>
          )}

          <div className="prose mt-8 max-w-none">
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{story.content}</p>
          </div>

          {charity && (
            <div className="mt-10 rounded-lg bg-accent/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">Want to support stories like this?</p>
              <Button asChild className="mt-3">
                <Link to={`/charities/${charity.id}`}>Donate to {charity.name}</Link>
              </Button>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default StoryDetail;
