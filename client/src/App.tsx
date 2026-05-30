import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import CustomerDashboard from "@/pages/CustomerDashboard";
import WalkerDashboard from "@/pages/WalkerDashboard";
import WalkerProfile from "@/pages/WalkerProfile";
import BookingFlow from "@/pages/BookingFlow";
import PetProfile from "@/pages/PetProfile";
import Questionnaire from "@/pages/Questionnaire";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import Services from "@/pages/Services";
import Gallery from "@/pages/Gallery";
import { supabase } from "@/lib/supabase";

/**
 * Listens for Supabase PASSWORD_RECOVERY events at the top level.
 *
 * When a user clicks a password-reset email link, Supabase redirects them to
 * the app's root URL (or whatever redirect_to was set to). If they land on "/",
 * this listener detects the PASSWORD_RECOVERY event and immediately navigates
 * them to "/reset-password" so they can enter a new password.
 *
 * It also handles the PKCE flow: if the current URL contains a `code` query
 * parameter AND the path is not already "/reset-password", we redirect there
 * so the ResetPassword page can exchange the code for a session.
 */
function AuthRecoveryListener() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle PKCE flow: ?code= lands on root, redirect to /reset-password
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && window.location.pathname !== "/reset-password") {
      // Preserve the code in the URL so ResetPassword.tsx can exchange it
      setLocation(`/reset-password${window.location.search}`);
      return;
    }

    // Handle implicit / legacy flow: listen for PASSWORD_RECOVERY auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLocation("/reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/signup"} component={SignUp} />
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/dashboard"} component={CustomerDashboard} />
      <Route path={"/walker-dashboard"} component={WalkerDashboard} />
      <Route path={"/walkers/:id"} component={WalkerProfile} />
      <Route path={"/booking"} component={BookingFlow} />
      <Route path={"/pets"} component={PetProfile} />
      <Route path={"/questionnaire"} component={Questionnaire} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/services"} component={Services} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <AuthRecoveryListener />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
