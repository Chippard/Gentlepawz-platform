import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function TopNav() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  // Use userRole (from public.users) NOT user.role (auth.User has no .role property)
  const { user, userRole, signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      handleNavClick("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavClick = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
    setPlatformDropdownOpen(false);
  };

  // Label shown next to logout button
  const roleLabel =
    userRole === "admin" ? "Admin" :
    userRole === "walker" ? "Walker" :
    userRole === "customer" ? "Owner" :
    user ? (user.email?.split("@")[0] ?? "") : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/gentle_pawz_logo.png" alt="Gentle Pawz" className="w-8 h-8" />
          <span className="font-serif text-xl font-bold hidden sm:inline">
            Gentle Pawz
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("/")}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Home
          </button>

          {/* Platform Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors">
              Platform
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => handleNavClick("/booking")}
                className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors first:rounded-t-lg"
              >
                Book a Walker
              </button>
              <button
                onClick={() => handleNavClick("/walkers/1")}
                className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors"
              >
                Browse Walkers
              </button>
              <button
                onClick={() => handleNavClick("/about")}
                className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick("/contact")}
                className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors last:rounded-b-lg"
              >
                Contact
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNavClick("/about")}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            About
          </button>

          <button
            onClick={() => handleNavClick("/contact")}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Contact
          </button>
        </div>

        {/* Right Side - Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-foreground/70">{roleLabel}</span>
              {userRole === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavClick("/admin")}
                >
                  Admin
                </Button>
              )}
              {userRole === "walker" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavClick("/walker-dashboard")}
                >
                  Dashboard
                </Button>
              )}
              {userRole === "customer" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavClick("/dashboard")}
                >
                  Dashboard
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleNavClick("/login")}
                className="hidden sm:inline-flex"
              >
                Log In
              </Button>
              <Button
                onClick={() => handleNavClick("/signup")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-4 space-y-2">
            <button
              onClick={() => handleNavClick("/")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("/booking")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              Book a Walker
            </button>
            <button
              onClick={() => handleNavClick("/walkers/1")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              Browse Walkers
            </button>
            <button
              onClick={() => handleNavClick("/about")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick("/contact")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              Contact
            </button>
            {user && (
              <>
                {userRole === "admin" && (
                  <button
                    onClick={() => handleNavClick("/admin")}
                    className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Admin Dashboard
                  </button>
                )}
                {userRole === "walker" && (
                  <button
                    onClick={() => handleNavClick("/walker-dashboard")}
                    className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Walker Dashboard
                  </button>
                )}
                {userRole === "customer" && (
                  <button
                    onClick={() => handleNavClick("/dashboard")}
                    className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    My Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
