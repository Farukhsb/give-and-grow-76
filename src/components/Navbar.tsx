import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/charities", label: "Charities" },
  { to: "/stories", label: "Stories" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
          <Heart className="h-6 w-6 fill-primary text-primary" />
          CharityApp
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                location.pathname === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button asChild variant="outline" size="sm" className="ml-3">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="ml-3">
              <Link to="/auth">
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="ml-2">
            <Link to="/charities">Donate Now</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${
                location.pathname === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Sign In
            </Link>
          )}
          <Button asChild size="sm" className="mt-2 w-full">
            <Link to="/charities" onClick={() => setMobileOpen(false)}>Donate Now</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
