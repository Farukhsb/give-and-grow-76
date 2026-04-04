import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

const RESPONSES: Record<string, string> = {
  donate: "You can donate by visiting our **Charities** page and selecting a cause that resonates with you. Click 'Donate Now' on any charity card to contribute!",
  charity: "We partner with verified charities across education, healthcare, environment, and humanitarian aid. Browse our **Charities** page to explore all causes.",
  volunteer: "Interested in volunteering? Sign up for an account and visit your Dashboard to find volunteer opportunities with our partner charities.",
  account: "You can create a free account by clicking **Sign In** in the navigation bar. This lets you track donations, earn badges, and save favorite charities.",
  receipt: "All donation receipts are automatically saved to your Dashboard after each transaction. They're available for download anytime.",
  contact: "You can reach our team through the **Contact** page. We typically respond within 24 hours.",
  help: "I can help with: \n• **Donating** to charities\n• **Volunteering** opportunities\n• **Account** setup\n• **Receipts** & history\n• **Contact** information\n\nJust ask me anything!",
  default: "Thanks for your message! I'm here to help you navigate CharityApp. You can ask me about donating, volunteering, your account, or anything else. Type **help** for a list of topics.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hello! 👋 Welcome to CharityApp. How can I help you today? Type **help** to see what I can assist with.";
  if (lower.includes("thank"))
    return "You're welcome! 😊 Is there anything else I can help you with?";
  return RESPONSES.default;
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", content: "Hi! 👋 I'm CharityBot. How can I help you today? Type **help** for options." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", content: getResponse(input) };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">CharityBot</p>
                  <p className="text-[11px] opacity-80">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-primary-foreground/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1" : ""}>
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full text-sm"
                />
                <Button type="submit" size="icon" className="rounded-full shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
