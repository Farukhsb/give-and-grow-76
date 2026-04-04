import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Heart, Trophy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "donation" | "achievement" | "info";
  read: boolean;
  createdAt: Date;
}

const icons = {
  donation: Heart,
  achievement: Trophy,
  info: Info,
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    // Demo notifications
    setNotifications([
      { id: "1", title: "Welcome to CharityApp!", message: "Start your giving journey by exploring charities.", type: "info", read: false, createdAt: new Date() },
      { id: "2", title: "Early Adopter Badge", message: "You've earned the Early Adopter badge!", type: "achievement", read: false, createdAt: new Date(Date.now() - 60000) },
    ]);
  }, [user]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markAllRead(); }} className="relative rounded-full p-2 hover:bg-accent transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-semibold text-sm">Notifications</p>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications.map((n) => {
                  const Icon = icons[n.type];
                  return (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 border-b last:border-0 ${!n.read ? "bg-accent/50" : ""}`}>
                      <Icon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
