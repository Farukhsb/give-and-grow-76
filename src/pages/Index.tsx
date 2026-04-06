import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, Globe, ArrowRight, Droplets, BookOpen, Utensils, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { testimonials, impactStats } from "@/data/demo";
import { useCharities } from "@/hooks/use-charities";
import { useEffect, useState, useRef } from "react";
import CharityMatcher from "@/components/CharityMatcher";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <div ref={ref} className="text-3xl font-bold text-primary md:text-4xl">
      {prefix}{count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count}{suffix}
    </div>
  );
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Water & Sanitation": <Droplets className="h-4 w-4" />,
  Education: <BookOpen className="h-4 w-4" />,
  "Food Security": <Utensils className="h-4 w-4" />,
  Healthcare: <Shield className="h-4 w-4" />,
};

const Index = () => {
  const { charities, loading } = useCharities();
  const featured = charities.filter((c) => c.featured).slice(0, 4);
  const [showMatcher, setShowMatcher] = useState(false);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32" style={{ background: "var(--hero-gradient)" }}>
        <div className="container relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto max-w-2xl text-center">
            <motion.h1 variants={fadeUp} className="font-serif text-4xl font-bold leading-tight md:text-6xl">
              Make a <span className="text-primary">Difference</span> Today
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground">
              Connect with verified charities worldwide and see the real impact of your generosity. Every donation tells a story of hope.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link to="/charities"><Heart className="h-4 w-4" /> Donate Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/about">Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="secondary" className="text-base gap-2" onClick={() => setShowMatcher(true)}>
                <Sparkles className="h-4 w-4" /> Find My Charity
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="border-b bg-card py-16">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {impactStats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-bold md:text-4xl">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Making a difference is simpler than you think. Three easy steps to change lives.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: <Globe className="h-8 w-8 text-primary" />, title: "Discover", desc: "Browse verified charities and causes that align with your values." },
              { icon: <Heart className="h-8 w-8 text-secondary" />, title: "Donate", desc: "Give securely with one-time or recurring donations — 95% goes directly to the cause." },
              { icon: <Users className="h-8 w-8 text-primary" />, title: "Track Impact", desc: "See exactly how your donation is making a real difference in people's lives." },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full border-none bg-accent/50 text-center shadow-none transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-4 p-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">{step.icon}</div>
                    <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold md:text-4xl">Featured Causes</h2>
              <p className="mt-2 text-muted-foreground">Charities making the biggest impact right now.</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/charities">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <p className="col-span-full text-center text-muted-foreground">Loading charities...</p>
            ) : featured.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">No featured charities yet.</p>
            ) : (
              featured.map((charity) => (
                <Link key={charity.id} to={`/charities/${charity.id}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={charity.image} alt={charity.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {categoryIcons[charity.category]}
                        {charity.category}
                      </div>
                      <h3 className="font-serif text-lg font-semibold leading-snug">{charity.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{charity.description}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium">£{(charity.amountRaised / 1000).toFixed(0)}K raised</span>
                          <span className="text-muted-foreground">of £{(charity.goalAmount / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((charity.amountRaised / charity.goalAmount) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/charities">View All Charities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-serif text-3xl font-bold md:text-4xl">What Our Donors Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-none bg-accent/40 shadow-none">
                <CardContent className="p-6">
                  <p className="text-sm italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Ready to Make a Difference?</h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
            Join thousands of donors who are changing lives every day. Your contribution matters.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 text-base">
            <Link to="/charities">Start Donating Today</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
