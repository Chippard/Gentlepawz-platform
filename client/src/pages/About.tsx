import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PawHeartLogo } from "@/components/PawHeartLogo";
import { ArrowLeft, Heart, Users, Shield } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
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
            <span className="font-serif font-bold hidden sm:inline">
              Gentle Pawz
            </span>
          </div>
          <Button onClick={() => setLocation("/signup?role=customer")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-serif font-bold">About Gentle Pawz</h1>
            <p className="text-xl text-foreground/70">
              Boutique dog care built on trust, expertise, and genuine love for
              every pup.
            </p>
          </div>

          {/* Philosophy Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold">Our Philosophy</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Personal Touch</h3>
                <p className="text-foreground/70">
                  We believe every dog deserves individualized attention and
                  care. That's why we limit ourselves to a maximum of 2 dogs at
                  a time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Community</h3>
                <p className="text-foreground/70">
                  We're building a community of trusted caregivers who share our
                  commitment to boutique, high-quality dog care in North
                  Vancouver.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Trust & Safety</h3>
                <p className="text-foreground/70">
                  Your pup's safety and happiness are our top priorities. Every
                  walker is verified, experienced, and genuinely passionate
                  about dogs.
                </p>
              </div>
            </div>
          </div>

          {/* Why Gentle Pawz Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold">Why Choose Gentle Pawz?</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Maximum 2 Dogs at a Time</h3>
                  <p className="text-foreground/70">
                    Your dog gets the individual attention they deserve, not
                    lost in a crowd.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Experienced Walkers</h3>
                  <p className="text-foreground/70">
                    Our walkers have professional experience in pet care, first
                    aid/CPR, and handling dogs with special needs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real Reviews & Ratings</h3>
                  <p className="text-foreground/70">
                    See verified reviews from real customers who have trusted us
                    with their beloved pets.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Direct Communication</h3>
                  <p className="text-foreground/70">
                    Message your walker directly and receive photo updates
                    throughout the day.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-sm font-bold text-primary">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Flexible Services</h3>
                  <p className="text-foreground/70">
                    Day care, overnight boarding, or walks — choose what works
                    best for your pup and schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scaling Vision */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Our Vision</h2>
            <p className="text-foreground/70 leading-relaxed">
              We're building Gentle Pawz as a platform that scales with the same
              boutique philosophy. As we grow, we're bringing on carefully
              selected walkers who share our commitment to maximum 2 dogs at a
              time, genuine expertise, and treating every pup like family.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              Think of us as your own personal Rover, but with a focus on
              quality over quantity. We're not trying to be everywhere — we're
              focused on being the best in North Vancouver.
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-3xl font-serif font-bold">
              Ready to Meet Your Perfect Walker?
            </h2>
            <p className="text-foreground/70">
              Join the Gentle Pawz community and give your pup the care they
              deserve.
            </p>
            <Button
              onClick={() => setLocation("/signup?role=customer")}
              className="bg-primary hover:bg-primary/90 h-12 px-8"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-12">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawHeartLogo size={24} className="text-primary" />
            <span className="font-serif font-bold">Gentle Pawz</span>
          </div>
          <p className="text-sm opacity-70">
            Boutique dog care in North Vancouver, BC
          </p>
          <p className="text-xs opacity-50 mt-4">
            &copy; 2026 Gentle Pawz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
