import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

type SignupState = "form" | "confirm_email" | "error";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialRole = (params.get("role") as "customer" | "walker") || "customer";
  const { signUp } = useSupabaseAuth();

  const [role, setRole] = useState<"customer" | "walker">(initialRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [signupState, setSignupState] = useState<SignupState>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { needsEmailConfirm } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        role
      );

      if (needsEmailConfirm) {
        // Email confirmation required — show a clear message
        setSignupState("confirm_email");
      } else {
        // Immediate session (email confirm disabled) — redirect to dashboard
        toast.success("Account created! Redirecting...");
        setTimeout(() => {
          setLocation(role === "walker" ? "/walker-dashboard" : "/dashboard");
        }, 800);
      }
    } catch (error: any) {
      const msg: string = error?.message || "Failed to create account";

      // Translate Supabase rate-limit error into a human-friendly message
      if (
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("over_email_send_rate_limit") ||
        msg.toLowerCase().includes("you can only request this")
      ) {
        setErrorMessage(
          "Too many signup attempts. Supabase limits signup emails to a few per hour. " +
          "Please wait a few minutes and try again, or contact the site owner to disable email confirmation in Supabase settings."
        );
        setSignupState("error");
      } else {
        setErrorMessage(msg);
        setSignupState("error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email confirmation pending ──────────────────────────────────────────────
  if (signupState === "confirm_email") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border">
          <div className="container h-16 flex items-center">
            <div className="flex items-center gap-2">
              <PawHeartLogo size={24} className="text-primary" />
              <span className="font-serif font-bold">Gentle Pawz</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-2">Check Your Email</h1>
            <p className="text-foreground/60 mb-4">
              We sent a confirmation link to <strong>{formData.email}</strong>.
              Click the link to activate your account, then come back to log in.
            </p>
            <p className="text-sm text-foreground/50 mb-8">
              Don't see it? Check your spam folder. If the problem persists, the site owner can
              disable email confirmation in Supabase → Authentication → Providers → Email.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Go to Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (signupState === "error") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border">
          <div className="container h-16 flex items-center justify-between">
            <button
              onClick={() => setSignupState("form")}
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
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Signup Failed</h3>
                <p className="text-sm text-red-800 mt-1">{errorMessage}</p>
              </div>
            </div>
            <Button
              onClick={() => setSignupState("form")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
            <div className="mt-4 text-center text-sm">
              <span className="text-foreground/60">Already have an account? </span>
              <button
                onClick={() => setLocation("/login")}
                className="text-primary hover:underline font-medium"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Create Account</h1>
            <p className="text-foreground/60">
              {role === "customer" ? "Find your perfect dog walker" : "Start earning by caring for dogs"}
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "customer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-sm font-semibold">I'm a Dog Owner</div>
              <div className="text-xs text-foreground/60 mt-1">Looking for care</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("walker")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "walker" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-sm font-semibold">I'm a Walker</div>
              <div className="text-xs text-foreground/60 mt-1">Offering services</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  disabled={loading}
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
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  disabled={loading}
                  autoComplete="new-password"
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
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  disabled={loading}
                  autoComplete="new-password"
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-foreground/60">Already have an account? </span>
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
