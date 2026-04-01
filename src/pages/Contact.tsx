import { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { faqs } from "@/data/demo";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <section className="bg-accent/50 py-16">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div>
            <h2 className="font-serif text-2xl font-bold">Send a Message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Message</label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="How can we help?" rows={5} />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Mail className="h-5 w-5 text-primary" />, label: "Email", value: "hello@charityapp.com" },
                { icon: <Phone className="h-5 w-5 text-primary" />, label: "Phone", value: "+1 (555) 123-4567" },
                { icon: <MessageSquare className="h-5 w-5 text-primary" />, label: "Live Chat", value: "Available 9-5 EST" },
              ].map((item, i) => (
                <Card key={i} className="border-none bg-accent/40 shadow-none">
                  <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                    {item.icon}
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="font-serif text-2xl font-bold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
