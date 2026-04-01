import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-muted/50 py-12">
    <div className="container grid gap-8 md:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
          <Heart className="h-5 w-5 fill-primary text-primary" />
          CharityApp
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Connecting generous hearts with worthy causes around the world.
        </p>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Platform</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/charities" className="hover:text-foreground">Browse Charities</Link>
          <Link to="/stories" className="hover:text-foreground">Impact Stories</Link>
          <Link to="/about" className="hover:text-foreground">About Us</Link>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Support</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/contact" className="hover:text-foreground">Contact Us</Link>
          <Link to="/contact" className="hover:text-foreground">FAQs</Link>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Legal</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms & Conditions</Link>
          <Link to="/donation-policy" className="hover:text-foreground">Donation Policy</Link>
        </div>
      </div>
    </div>
    <div className="container mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} CharityApp. All rights reserved. Made with ❤️ for a better world.
    </div>
  </footer>
);

export default Footer;
