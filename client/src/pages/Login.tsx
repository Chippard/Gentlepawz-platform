import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, signOut, userRole, profileMissing, repairProfile, user, loading } = useSupabaseAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Track whether we initiated a login so we know to redirect once role resolves
  const pendingRedirect = useRef(false);

  // Redirect once role is resolved after login
  useEffect(() => {
    if (!pendingRedirect.current) return;
    if (loading) return;
    if (!user) return;

    if (userRole) {
      pendingRedirect.current = false;
      if (userRole === "admin") {
        setLocation("/admin");
      } else if (userRole === "walker") {
        setLocation("/walker-dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
    // If userRole is still null but user exists, profileMissing banner will show
  }, [user, userRole, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      pendingRedirect.current = true;
      await signIn(formData.email.trim(), formData.password);
      toast.success("Logged in! Redirecting...");
      // Redirect happens via useEffect once userRole resolves
    } catch (error: any) {
      pendingRedirect.current = false;
      const msg: string = error?.message || "Login failed";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.toLowerCase().includes("email not confirmed")) {
        toast.error("Please confirm your email address before logging in. Check your inbox.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepairProfile = async () => {
    setRepairing(true);
    try {
      await repairProfile();
      toast.success("Profile repaired! Redirecting...");
      pendingRedirect.current = true;
    } catch (error: any) {
      toast.error(error.message || "Failed to repair profile. Please contact support.");
    } finally {
      setRepairing(false);
    }
  };

  const handleSignOutAndRetry = async () => {
    await signOut();
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold">Gentle Pawz</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">

          {/* Profile sync repair — shown when user is authenticated but public.users row is missing */}
          {user && profileMissing ? (
            <div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Profile Sync Issue</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Your account was found but your profile data is missing. This can happen if the
                    database trigger did not run when you first signed up. Click below to repair it.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRepairProfile}
                disabled={repairing}
                className="w-full bg-primary hover:bg-primary/90 mb-3"
              >
                {repairing ? "Repairing..." : "Repair My Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOutAndRetry}
                className="w-full"
              >
                Sign out and try a different account
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Log In</h1>
                <p className="text-foreground/60">Welcome back to Gentle Pawz</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={submitting}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      disabled={submitting}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-3 text-foreground/40 hover:text-foreground/70 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  {submitting ? "Logging in..." : "Log In"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => setLocation("/forgot-password")}
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <div className="mt-4 text-center text-sm">
                <span className="text-foreground/60">Don't have an account? </span>
                <button
                  onClick={() => setLocation("/signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
