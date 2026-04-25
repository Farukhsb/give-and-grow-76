import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import About from "./pages/About";
import Charities from "./pages/Charities";
import CharityDetail from "./pages/CharityDetail";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DonationPolicy from "./pages/DonationPolicy";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DonorProfile from "./pages/DonorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import BlockchainTracker from "./pages/BlockchainTracker";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import CheckoutResult from "./pages/CheckoutResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/charities" element={<Charities />} />
            <Route path="/charities/:id" element={<CharityDetail />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/donation-policy" element={<DonationPolicy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<DonorProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/blockchain" element={<BlockchainTracker />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/checkout-result" element={<CheckoutResult />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
