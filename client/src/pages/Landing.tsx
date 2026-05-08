import React, { useState, useEffect } from "react";
import { ArrowRight, Heart, Users, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import TopNav from "@/components/TopNav";
import SplashIntro from "@/components/SplashIntro";

const LOGO_URL = "/gentle_pawz_logo.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if user has already seen the intro this session
    const hasSeenIntro = sessionStorage.getItem("gentlepawz_intro_seen");
    if (hasSeenIntro) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("gentlepawz_intro_seen", "true");
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Splash Intro */}
      {showSplash && <SplashIntro onComplete={handleSplashComplete} />}

      {/* Top Navigation */}
      <TopNav />

      {/* Hero Section with Cinematic Background */}
      <section
        className="relative min-h-screen pt-20 overflow-hidden flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://d2xsxph8kpxj0f.cloudfront.net/310519663631703889/HyjFhWM4C2oWxo7dXTLa4r/hero-bg-cinematic-R8SPMC8TFAMcK8ipTUbkpq.webp)",
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/70 to-background/50" />

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Boutique Dog Care Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              Where Every Paw Gets
              <span className="text-primary block">Personal Care</span>
            </h1>

            <p className="text-lg text-foreground/70 mb-8 max-w-xl leading-relaxed">
              Connect with trusted dog walkers and sitters in North Vancouver.
              Maximum 2 dogs at a time. Real relationships. Real care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/booking")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Book a Walker <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/signup?role=walker")}
              >
                Become a Walker
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground/70">
                  Verified Walkers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground/70">
                  Max 2 Dogs Per Visit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground/70">
                  Direct Messaging
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">
            Built for Boutique Care
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Trusted Walkers</h3>
              <p className="text-foreground/70">
                Meet verified, experienced dog walkers in your neighborhood.
                See their ratings, reviews, and availability.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Personal Attention</h3>
              <p className="text-foreground/70">
                Maximum 2 dogs at a time. Your pup gets the individual care
                and attention they deserve.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Real Connection</h3>
              <p className="text-foreground/70">
                Message your walker directly, get photo updates, and build
                a relationship with someone who loves your dog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">
            Services & Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Doggy Day Care",
                price: "$40",
                period: "per day",
                description:
                  "Daytime care and socialization in a safe, loving home environment.",
              },
              {
                title: "Overnight Boarding",
                price: "$60",
                period: "per night",
                description:
                  "Comfortable overnight stays with meals, playtime, and cuddles.",
              },
              {
                title: "Dog Walks",
                price: "$30",
                period: "per hour",
                description:
                  "Energetic walks, exercise, and outdoor adventures with your pup.",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-2">{service.title}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">
                    {service.price}
                  </span>
                  <span className="text-foreground/60 ml-2">{service.period}</span>
                </div>
                <p className="text-foreground/70">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Find Your Perfect Walker?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of dog owners who trust Gentle Pawz with their best
            friends.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation("/signup?role=customer")}
          >
            Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={LOGO_URL} alt="Gentle Pawz" className="w-8 h-8" />
                <span className="font-serif font-bold">Gentle Pawz</span>
              </div>
              <p className="text-sm opacity-70">
                Boutique dog care in North Vancouver.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <button
                    onClick={() => setLocation("/walkers/1")}
                    className="hover:opacity-100"
                  >
                    Browse Walkers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/booking")}
                    className="hover:opacity-100"
                  >
                    Book Now
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/")}
                    className="hover:opacity-100"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <button
                    onClick={() => setLocation("/about")}
                    className="hover:opacity-100"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/contact")}
                    className="hover:opacity-100"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/about")}
                    className="hover:opacity-100"
                  >
                    Philosophy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm opacity-70">North Vancouver, BC</p>
              <p className="text-sm opacity-70">hello@gentlepawz.com</p>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-60">
            <p>&copy; 2026 Gentle Pawz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
