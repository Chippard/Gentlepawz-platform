import React from "react";
import { useLocation } from "wouter";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sun,
  Moon,
  Footprints,
  Heart,
  Shield,
  Clock,
  Check,
} from "lucide-react";

type Service = {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  highlight?: boolean;
};

const services: Service[] = [
  {
    title: "Doggy Day Care",
    price: "$40",
    period: "per day",
    description:
      "Need a last-minute spot for your pup to play, nap, and be spoiled while you're away for the day? We've got you covered! At Gentle Pawz, we turn unexpected plans into tail-wagging adventures with plenty of cuddles, playtime, and TLC.",
    features: [
      "Up to 8 hours of supervised care",
      "Socialization with other friendly dogs",
      "Indoor and outdoor playtime",
      "Fresh water and meal service",
      "Photo updates throughout the day",
      "Maximum 2 dogs at a time",
    ],
    icon: <Sun className="w-8 h-8" />,
  },
  {
    title: "Overnight Boarding",
    price: "$60",
    period: "per night",
    description:
      "Going away overnight or heading on vacation? Your pup will feel right at home with cozy cuddles, evening strolls, and sweet dreams under our loving care. Enjoy your time away knowing your best friend is safe and happy.",
    features: [
      "24-hour supervised care",
      "Comfortable sleeping arrangements",
      "Evening and morning walks included",
      "Meals and treats provided",
      "Bedtime cuddles and routine",
      "Daily photo and video updates",
    ],
    icon: <Moon className="w-8 h-8" />,
    highlight: true,
  },
  {
    title: "Walk & Wag Visits",
    price: "$30",
    period: "per hour",
    description:
      "Need a quick visit to give your pup or kitty a break, some love, and a stretch of the legs? We'll swing by for a tail-wagging stroll, belly rubs, fresh water, and a little joy to break up their day.",
    features: [
      "One-on-one walking attention",
      "Neighborhood or trail walks",
      "Potty breaks and exercise",
      "Fresh water and treats",
      "Post-walk report card",
      "Flexible scheduling available",
    ],
    icon: <Footprints className="w-8 h-8" />,
  },
];

export default function Services() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-card border-b border-border">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Boutique Pet Services
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Compassionate, personalized care for your furry family members.
            Every pup gets individual attention with a maximum of 2 dogs at a
            time.
          </p>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 ${
                  service.highlight
                    ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                    : "border-border"
                }`}
              >
                {service.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5">
                    Most Popular
                  </div>
                )}

                <div
                  className={`${service.highlight ? "mt-4" : ""}`}
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    {service.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    {service.title}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {service.price}
                    </span>
                    <span className="text-foreground/60 ml-2">
                      {service.period}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/70 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      service.highlight
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }`}
                    variant={service.highlight ? "default" : "outline"}
                    size="lg"
                    onClick={() => setLocation("/booking")}
                  >
                    Book Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-12">
            Why Choose Gentle Pawz?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Max 2 Dogs</h4>
              <p className="text-sm text-foreground/70">
                Personal attention guaranteed with our small group policy.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Safe & Secure</h4>
              <p className="text-sm text-foreground/70">
                Fully insured with a safe, home-like environment.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Flexible Hours</h4>
              <p className="text-sm text-foreground/70">
                Drop-off and pick-up times that work for your schedule.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sun className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Daily Updates</h4>
              <p className="text-sm text-foreground/70">
                Photos and messages so you never miss a moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Ready to Book?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
            Give your pup the love and care they deserve. Book a meet and greet
            or schedule your first service today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/booking")}
            >
              Book a Service <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setLocation("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
