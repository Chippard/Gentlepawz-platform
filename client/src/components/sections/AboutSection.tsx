import { Heart, Users, Home, Sparkles } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Personal Connection",
    description:
      "We get to know every dog's personality, preferences, and quirks. No two pups are the same, and neither is our care.",
  },
  {
    icon: Users,
    title: "Maximum 2 Dogs",
    description:
      "We never take more than two dogs at a time. This means your pup gets undivided attention and a stress-free environment.",
  },
  {
    icon: Home,
    title: "Home Environment",
    description:
      "No kennels, no cages. Your dog stays in a real home with comfortable furniture, a backyard, and all the love.",
  },
  {
    icon: Sparkles,
    title: "Transparent Updates",
    description:
      "Photos, videos, and GPS tracking throughout the day. You'll always know your pup is happy and safe.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="section-padding">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                About Us
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Boutique Care, Not a Boarding Factory
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Gentle Pawz was born from a simple belief: dogs deserve the same quality of care 
                you'd give them yourself. We're not a facility — we're a family that happens to 
                love taking care of your dog while you're away.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                Based in beautiful North Vancouver, we offer a home-away-from-home experience 
                for small dogs. Our strict two-dog maximum means your pup never feels lost in a 
                crowd or overwhelmed by larger dogs.
              </p>
              <p className="text-foreground leading-relaxed">
                Every dog in our care gets personalized attention, maintained routines, and the 
                kind of love that makes them excited to come back. We're building something 
                different — a community of trusted caregivers who treat every pup like their own.
              </p>
            </div>
          </div>

          {/* Right - Values grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border border-primary/10 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">8+</p>
              <p className="text-sm text-muted-foreground mt-1">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Happy Stays</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5.0</p>
              <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">2</p>
              <p className="text-sm text-muted-foreground mt-1">Max Dogs at Once</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
