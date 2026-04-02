import { motion } from "framer-motion";
import { Shield, Eye, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { teamMembers } from "@/data/demo";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const About = () => (
  <Layout>
    {/* Hero */}
    <section className="bg-accent/50 py-20">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto max-w-2xl text-center">
          <motion.h1 variants={fadeUp} className="font-serif text-4xl font-bold md:text-5xl">
            About <span className="text-primary">CharityApp</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            We believe that generosity, when guided by transparency and technology, can transform the world.
          </motion.p>
        </motion.div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-20">
      <div className="container grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-bold">Our Mission</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            CharityApp was born from a simple idea: connecting people who want to help with those who need it most. We bridge the gap between generous donors and verified charitable organizations, ensuring every pound creates maximum impact. Our platform provides complete transparency, so donors always know exactly where their contributions go and the difference they make.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold">Our Vision</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We envision a world where giving is effortless, transparent, and deeply impactful. A world where technology empowers compassion and every act of generosity — no matter how small — creates ripples of positive change across communities and continents. We're building the future of philanthropy, one donation at a time.
          </p>
        </div>
      </div>
    </section>

    {/* Story */}
    <section className="bg-muted/40 py-20">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-bold">Our Story</h2>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Founded in 2020 by a team of technologists and humanitarian workers, CharityApp started as a weekend project during a hackathon. The founders saw firsthand how difficult it was for small charities to reach potential donors, and how donors struggled to find trustworthy organizations. What began as a simple directory grew into a comprehensive platform that has now facilitated over $2.5 million in donations to 150+ charities across 35 countries. Our team is driven by the belief that technology should serve humanity's highest aspirations.
        </p>
      </div>
    </section>

    {/* Trust Badges */}
    <section className="py-20">
      <div className="container">
        <h2 className="text-center font-serif text-3xl font-bold">Why Trust Us</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Shield className="h-8 w-8 text-primary" />, title: "Verified Charities", desc: "Every charity undergoes rigorous verification before joining our platform." },
            { icon: <Eye className="h-8 w-8 text-primary" />, title: "Full Transparency", desc: "Track your donation from the moment you give to the moment it creates impact." },
            { icon: <Award className="h-8 w-8 text-secondary" />, title: "95% to Cause", desc: "95 cents of every dollar goes directly to the charity you choose." },
            { icon: <Users className="h-8 w-8 text-secondary" />, title: "45K+ Donors", desc: "Join a thriving community of donors making a difference worldwide." },
          ].map((badge, i) => (
            <Card key={i} className="border-none bg-accent/40 text-center shadow-none">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                {badge.icon}
                <h3 className="font-serif text-lg font-semibold">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="bg-muted/40 py-20">
      <div className="container">
        <h2 className="text-center font-serif text-3xl font-bold">Meet Our Team</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          Passionate people dedicated to making generosity easier and more impactful.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <img src={member.avatar} alt={member.name} className="mx-auto h-28 w-28 rounded-full object-cover shadow-md" />
              <h3 className="mt-4 font-serif text-lg font-semibold">{member.name}</h3>
              <p className="text-sm font-medium text-primary">{member.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
