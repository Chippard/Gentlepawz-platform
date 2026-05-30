import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Handle both PKCE (code in query params) and implicit flow (tokens in hash)
    const handleRecoveryToken = async () => {
      // --- PKCE flow: Supabase redirects with ?code=... in the query string ---
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        // Exchange the PKCE code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("Invalid or expired reset link. Please request a new one.");
          return;
        }
        // Clean up the URL so the code isn't reused on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        setSessionReady(true);
        return;
      }

      // --- Implicit / legacy flow: tokens arrive in the URL hash ---
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        // Supabase JS v2 automatically parses the hash and establishes the session
        // via onAuthStateChange(PASSWORD_RECOVERY). We just need to wait for it.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
          return;
        }
        // If session isn't ready yet, wait for the auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
            setSessionReady(true);
            subscription.unsubscribe();
          }
        });
        return;
      }

      // No valid token found
      setError("Invalid or expired reset link. Please request a new one.");
    };

    handleRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/login")}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          {error ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="text-3xl font-serif font-bold mb-2">Invalid Link</h1>
              <p className="text-foreground/60 mb-8">{error}</p>
              <Button
                onClick={() => setLocation("/forgot-password")}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Request New Reset Link
              </Button>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-3xl font-serif font-bold mb-2">Password Reset</h1>
              <p className="text-foreground/60 mb-8">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center">
              <p className="text-foreground/60">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Create New Password</h1>
                <p className="text-foreground/60">
                  Enter your new password below.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
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

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-3 text-foreground/40 hover:text-foreground/70 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center text-sm">
                <button
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  Back to Log In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
