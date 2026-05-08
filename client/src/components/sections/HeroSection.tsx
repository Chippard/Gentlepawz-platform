import { PawHeartLogo } from "../PawHeartLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Heart, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

      <div className="container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <PawHeartLogo size={18} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                North Vancouver's Boutique Dog Care
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Where Every Paw Gets{" "}
                <span className="text-primary">Personal</span> Attention
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Boutique dog boarding and walking with a maximum of 2 dogs at a time. 
                Your furry family member deserves individual care, not a crowd.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 shadow-lg shadow-primary/25 text-base"
              >
                <a href="#booking">
                  Book a Visit
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base bg-white/50"
              >
                <a href="#services">View Services</a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Insured & Certified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                <span>Max 2 Dogs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-primary" />
                <span>5-Star Rated</span>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main card */}
              <div className="absolute inset-8 rounded-3xl overflow-hidden border border-primary/10 shadow-2xl shadow-primary/10">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663631703889/HyjFhWM4C2oWxo7dXTLa4r/hero-dog-VD94YGbZSrvMKTGn3gC8wr.webp"
                  alt="Happy small dog in a cozy home environment"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating cards */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl p-4 shadow-lg border border-border/50 animate-[bounce_3s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Booking Confirmed</p>
                    <p className="text-xs text-muted-foreground">Today at 9:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-white rounded-2xl p-4 shadow-lg border border-border/50 animate-[bounce_4s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-primary/30 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-accent border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Happy Pups Today</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
