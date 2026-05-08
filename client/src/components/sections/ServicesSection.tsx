import { Button } from "@/components/ui/button";
import { Sun, Moon, Footprints, Check } from "lucide-react";

const services = [
  {
    icon: Sun,
    title: "Doggy Day Care",
    price: "$40",
    unit: "per day",
    description: "Full-day care in a home environment with personalized attention, play, and rest.",
    features: [
      "Drop off 7 AM – Pick up 7 PM",
      "Max 2 dogs at a time",
      "Indoor & outdoor play",
      "Photo updates throughout the day",
      "Feeding & medication included",
    ],
    popular: false,
  },
  {
    icon: Moon,
    title: "Overnight Boarding",
    price: "$60",
    unit: "per night",
    description: "Your pup sleeps over in our cozy home — just like a sleepover with their best friend.",
    features: [
      "24-hour supervised care",
      "Cozy sleeping arrangements",
      "Evening & morning walks",
      "Bedtime routine maintained",
      "Daily photo & video updates",
    ],
    popular: true,
  },
  {
    icon: Footprints,
    title: "Dog Walks",
    price: "$30",
    unit: "per hour",
    description: "One-on-one walks through North Vancouver's beautiful trails and neighborhoods.",
    features: [
      "1-hour guided walks",
      "Trail & neighborhood routes",
      "GPS tracking shared",
      "Post-walk report card",
      "Flexible scheduling",
    ],
    popular: false,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="section-padding relative">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Our Services
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tailored Care for Every Pup
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether it's a day of play, an overnight stay, or an adventure walk — 
            your dog gets the boutique treatment they deserve.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                service.popular
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02] lg:scale-105"
                  : "bg-card border border-border shadow-sm"
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-primary text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    service.popular ? "bg-white/20" : "bg-primary/10"
                  }`}
                >
                  <service.icon
                    className={`w-6 h-6 ${
                      service.popular ? "text-white" : "text-primary"
                    }`}
                  />
                </div>

                {/* Title & Price */}
                <div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{service.price}</span>
                    <span
                      className={`text-sm ${
                        service.popular ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {service.unit}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed ${
                    service.popular ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          service.popular ? "text-white/90" : "text-primary"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          service.popular ? "text-white/90" : "text-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full rounded-full ${
                    service.popular
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <a href="#booking">Book Now</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
